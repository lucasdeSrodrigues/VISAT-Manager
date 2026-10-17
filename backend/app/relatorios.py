"""Relatórios em PDF (ReportLab).

- pdf_demanda: o "Gerar relatório" do wireframe — ficha da demanda, situação do prazo,
  linha do tempo completa e documentos. Serve para responder ao órgão demandante.
- pdf_periodo: os mesmos indicadores da tela Relatórios do protótipo, para arquivar/enviar.
"""

from datetime import date, datetime, timedelta
from io import BytesIO

from reportlab.graphics.shapes import Drawing, Rect, String
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import KeepTogether, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle
from sqlalchemy.orm import Session

from . import rules, services
from .models import Demanda, Usuario

BRAND = colors.HexColor("#14305a")
MUTED = colors.HexColor("#4a5568")
BORDA = colors.HexColor("#d3d9e4")
FUNDO = colors.HexColor("#f2f4f8")
COR_STATUS = {
    "Nova": "#1f4e79",
    "Em análise": "#7b5ea7",
    "Em andamento": "#21857a",
    "Aguardando documento": "#b26a00",
    "Concluída": "#3d7a3a",
}
CORES = ["#1f4e79", "#21857a", "#b26a00", "#c0503a", "#7b5ea7", "#5b6573"]
ROTULOS_EVENTO = {
    "criacao": "Criação",
    "status": "Status",
    "documento": "Documento",
    "observacao": "Observação",
    "reatribuicao": "Reatribuição",
    "edicao": "Prioridade/prazo",
    "conclusao": "Conclusão",
}

_base = getSampleStyleSheet()
S = {
    "h1": ParagraphStyle(
        "h1", parent=_base["Heading1"], fontName="Helvetica-Bold", fontSize=17, textColor=BRAND, spaceAfter=2
    ),
    "h2": ParagraphStyle(
        "h2",
        parent=_base["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=12,
        textColor=BRAND,
        spaceBefore=10,
        spaceAfter=5,
    ),
    "p": ParagraphStyle(
        "p", parent=_base["BodyText"], fontName="Helvetica", fontSize=9.5, leading=13, alignment=TA_LEFT
    ),
    "mut": ParagraphStyle(
        "mut", parent=_base["BodyText"], fontName="Helvetica", fontSize=8.5, leading=11, textColor=MUTED
    ),
    "cel": ParagraphStyle("cel", parent=_base["BodyText"], fontName="Helvetica", fontSize=8.5, leading=11),
    "celb": ParagraphStyle("celb", parent=_base["BodyText"], fontName="Helvetica-Bold", fontSize=8.5, leading=11),
}


def _e(txt) -> str:
    return str(txt or "").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def _dt(v: datetime | None) -> str:
    return v.strftime("%d/%m/%Y %H:%M") if v else "—"


def _rodape(canvas, doc):
    canvas.saveState()
    canvas.setFont("Helvetica", 7.5)
    canvas.setFillColor(MUTED)
    canvas.drawString(18 * mm, 10 * mm, f"VISAT Manager · gerado em {datetime.now():%d/%m/%Y %H:%M}")
    canvas.drawRightString(A4[0] - 18 * mm, 10 * mm, f"Página {doc.page}")
    canvas.setStrokeColor(BRAND)
    canvas.setLineWidth(2)
    canvas.line(18 * mm, A4[1] - 12 * mm, A4[0] - 18 * mm, A4[1] - 12 * mm)
    canvas.restoreState()


def _tabela(linhas, larguras, cabecalho=True, zebra=True):
    dados = [
        [
            Paragraph(_e(c), S["celb"] if (cabecalho and i == 0) else S["cel"]) if not hasattr(c, "wrap") else c
            for c in linha
        ]
        for i, linha in enumerate(linhas)
    ]
    t = Table(dados, colWidths=larguras, repeatRows=1 if cabecalho else 0)
    estilo = [
        ("GRID", (0, 0), (-1, -1), 0.4, BORDA),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
    ]
    if cabecalho:
        estilo.append(("BACKGROUND", (0, 0), (-1, 0), FUNDO))
    if zebra:
        estilo += [("BACKGROUND", (0, i), (-1, i), colors.HexColor("#fafbfd")) for i in range(2, len(dados), 2)]
    t.setStyle(TableStyle(estilo))
    return t


def _barras(itens: list[tuple[str, int, str]], largura=170 * mm) -> Drawing:
    """Barras horizontais com rótulo e valor escrito (nunca só cor)."""
    h_linha, rot_w = 15, 62 * mm
    area = largura - rot_w - 12 * mm
    mx = max([v for _, v, _ in itens] + [1])
    d = Drawing(largura, h_linha * len(itens) + 4)
    for i, (rot, val, cor) in enumerate(itens):
        y = d.height - (i + 1) * h_linha
        d.add(String(0, y + 4, rot[:42], fontName="Helvetica", fontSize=8, fillColor=MUTED))
        d.add(Rect(rot_w, y + 2, area, 9, fillColor=colors.HexColor("#eceff4"), strokeColor=None))
        if val:
            d.add(Rect(rot_w, y + 2, max(3, area * val / mx), 9, fillColor=colors.HexColor(cor), strokeColor=None))
        d.add(String(rot_w + area + 4, y + 3, str(val), fontName="Helvetica-Bold", fontSize=8.5))
    return d


def _doc(buf, titulo):
    return SimpleDocTemplate(
        buf,
        pagesize=A4,
        leftMargin=18 * mm,
        rightMargin=18 * mm,
        topMargin=18 * mm,
        bottomMargin=17 * mm,
        title=titulo,
        author="VISAT Manager",
    )


# ------------------------------------------------------------------ demanda
def pdf_demanda(db: Session, d: Demanda) -> bytes:
    buf = BytesIO()
    urg = rules.urgencia(d.prazo, d.status)
    resp = services.nome_de(db, d.responsavel_id) if d.responsavel_id else "Sem responsável"
    local = f"{d.bairro}, {d.municipio}" if d.bairro else d.municipio
    el = [
        Paragraph("Relatório da demanda", S["mut"]),
        Paragraph(_e(d.titulo), S["h1"]),
        Paragraph(
            f"<b>{_e(d.id)}</b> · {'Sincronizada do SEI' if d.origem == 'SEI' else 'Cadastro manual'} · "
            f"Status: <b>{_e(d.status)}</b> · Prioridade {_e(d.prioridade.lower())} · Prazo: <b>{_e(urg['t'])}</b>",
            S["p"],
        ),
        Spacer(1, 6),
        _tabela(
            [
                ["Tipo", d.tipo, "Estabelecimento", d.estabelecimento or "—"],
                ["Local", local, "Responsável", resp],
                ["Prazo", d.prazo.strftime("%d/%m/%Y"), "Criada em", _dt(d.criada)],
                ["Concluída em", _dt(d.concluida_em), "Documentos", str(len(d.docs))],
            ],
            [30 * mm, 55 * mm, 32 * mm, 57 * mm],
            cabecalho=False,
            zebra=False,
        ),
        Paragraph("Descrição", S["h2"]),
        Paragraph(_e(d.descricao) or "<i>Sem descrição.</i>", S["p"]),
    ]
    if d.sol_por:
        el += [
            Paragraph("Conclusão solicitada", S["h2"]),
            Paragraph(f"Por {_e(services.nome_de(db, d.sol_por))} em {_dt(d.sol_em)}: {_e(d.sol_obs)}", S["p"]),
        ]
    linhas = [["Data/hora", "Evento", "Descrição", "Por"]] + [
        [_dt(e.em), ROTULOS_EVENTO.get(e.tipo, "Evento"), e.texto, services.nome_de(db, e.por)] for e in d.historico
    ]
    el += [Paragraph("Linha do tempo", S["h2"]), _tabela(linhas, [27 * mm, 25 * mm, 87 * mm, 35 * mm])]
    if d.docs:
        el += [
            Paragraph("Documentos", S["h2"]),
            _tabela(
                [["Arquivo", "Tamanho", "Anexado por", "Em"]]
                + [
                    [x.nome, f"{max(1, round(x.tam / 1024))} KB", services.nome_de(db, x.por), _dt(x.em)]
                    for x in d.docs
                ],
                [80 * mm, 20 * mm, 40 * mm, 34 * mm],
            ),
        ]
    _doc(buf, f"Relatório {d.id}").build(el, onFirstPage=_rodape, onLaterPages=_rodape)
    return buf.getvalue()


# ------------------------------------------------------------------ período
def dados_periodo(db: Session, u: Usuario, dias: int, hoje: date | None = None) -> dict:
    """Mesmo cálculo de dadosRelatorio() do protótipo."""
    hoje = hoje or date.today()
    base = services.visiveis(db, u)
    inicio = hoje - timedelta(days=dias)
    criadas = [d for d in base if d.criada.date() >= inicio]
    concl = [d for d in base if d.concluida_em and d.concluida_em.date() >= inicio]
    abertas = [d for d in base if rules.aberta(d.status)]
    tempos = [max(0, (d.concluida_em.date() - d.criada.date()).days) for d in concl]
    return {
        "base": base,
        "inicio": inicio,
        "criadas": criadas,
        "concl": concl,
        "abertas": abertas,
        "venc": [d for d in abertas if rules.dias_ate(d.prazo, hoje) < 0],
        "tmedio": sum(tempos) / len(tempos) if tempos else None,
    }


def pdf_periodo(db: Session, u: Usuario, dias: int) -> bytes:
    buf = BytesIO()
    hoje = date.today()
    r = dados_periodo(db, u, dias, hoje)
    gestor = rules.perm(u.perfil).ver_todas
    inspetores = [x for x in db.query(Usuario).filter(Usuario.perfil == "inspetor").order_by(Usuario.id)]
    tm = "—" if r["tmedio"] is None else f"{r['tmedio']:.1f}".replace(".", ",")
    kpis = _tabela(
        [
            [
                "Criadas no período",
                "Concluídas no período",
                "Em aberto agora",
                "Vencidas agora",
                "Dias até concluir (média)",
            ],
            [str(len(r["criadas"])), str(len(r["concl"])), str(len(r["abertas"])), str(len(r["venc"])), tm],
        ],
        [34.8 * mm] * 5,
        zebra=False,
    )
    n = lambda d: rules.dias_ate(d.prazo, hoje)  # noqa: E731
    el = [
        Paragraph("Relatório gerencial" if gestor else f"Meus indicadores · {_e(u.nome)}", S["mut"]),
        Paragraph(f"Demandas da VISAT · últimos {dias} dias", S["h1"]),
        Paragraph(
            f"Período: {r['inicio']:%d/%m/%Y} a {hoje:%d/%m/%Y}"
            + ("" if gestor else " · somente demandas atribuídas a você"),
            S["p"],
        ),
        Spacer(1, 8),
        kpis,
        Paragraph("Demandas criadas por status atual", S["h2"]),
        _barras([(s, sum(d.status == s for d in r["criadas"]), COR_STATUS[s]) for s in rules.STATUS]),
        Paragraph("Demandas criadas por tipo", S["h2"]),
        _barras([(t, sum(d.tipo == t for d in r["criadas"]), CORES[i]) for i, t in enumerate(rules.TIPOS)]),
    ]
    if gestor:
        el += [
            Paragraph("Demandas criadas por inspetor", S["h2"]),
            _barras(
                [(i.nome, sum(d.responsavel_id == i.id for d in r["criadas"]), "#1f4e79") for i in inspetores]
                + [("Sem responsável", sum(not d.responsavel_id for d in r["criadas"]), "#5b6573")]
            ),
        ]
    el += [
        Paragraph("Situação dos prazos (em aberto)", S["h2"]),
        _barras(
            [
                ("Vencidas", sum(n(d) < 0 for d in r["abertas"]), "#b91c1c"),
                ("Vencem em até 3 dias", sum(0 <= n(d) <= 3 for d in r["abertas"]), "#b26a00"),
                ("No prazo", sum(n(d) > 3 for d in r["abertas"]), "#2f7d32"),
            ]
        ),
    ]
    lista = sorted(r["criadas"], key=lambda d: d.criada, reverse=True)
    linhas = [["Número", "Demanda", "Status", "Prior.", "Responsável", "Prazo"]] + [
        [
            d.id,
            d.titulo,
            d.status,
            d.prioridade,
            services.nome_de(db, d.responsavel_id) if d.responsavel_id else "Sem responsável",
            f"{d.prazo:%d/%m/%Y} · {rules.urgencia(d.prazo, d.status, hoje)['t']}",
        ]
        for d in lista
    ]
    el += [
        KeepTogether([Paragraph(f"Demandas criadas no período ({len(lista)})", S["h2"])]),
        _tabela(linhas, [30 * mm, 52 * mm, 25 * mm, 13 * mm, 26 * mm, 28 * mm])
        if lista
        else Paragraph("Nenhuma demanda criada no período.", S["p"]),
    ]
    _doc(buf, f"Relatório VISAT {dias} dias").build(el, onFirstPage=_rodape, onLaterPages=_rodape)
    return buf.getvalue()
