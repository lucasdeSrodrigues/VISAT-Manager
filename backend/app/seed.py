"""Dados de exemplo — os MESMOS do protótipo (SEED do index.html), agora gravados no banco.

    python -m backend.app.seed      # recria o banco e a exportação simulada do SEI

As datas são relativas a HOJE (como no protótipo), então a demonstração sempre tem
demandas vencidas, vencendo hoje, na semana e no prazo.
"""

import os
from datetime import date, datetime, time, timedelta
from html import escape

from . import config
from .database import Base, SessionLocal, engine
from .models import Demanda, Documento, Evento, Usuario
from .services import set_param

USUARIOS = [
    ("g1", "Marina Albuquerque", "Gerente de Vigilância Sanitária", "gestor"),
    ("i1", "Carlos Menezes", "Inspetor Sanitário", "inspetor"),
    ("i2", "Ana Beatriz Lopes", "Inspetora Sanitária", "inspetor"),
    ("i3", "Rafael Tavares", "Inspetor Sanitário", "inspetor"),
]
NOMES = {u[0]: u[1] for u in USUARIOS}

# Cópia fiel do SEED do protótipo + local (município, bairro) para o Mapa de demandas.
# o=origem c=criada(dias) z=prazo(dias) x=conclusão(dias) r=responsável k=tipo e=estabelecimento p=prioridade s=status
SEED = [
    dict(
        o="SEI",
        t="Denúncia de armazenamento inadequado de alimentos",
        k="Denúncia",
        e="Mercadinho Boa Compra",
        p="Alta",
        s="Em andamento",
        r="i1",
        z=-4,
        c=-40,
        d="Denunciante relata produtos perecíveis armazenados fora de refrigeração e presença de pragas no depósito.",
        docs=[("denuncia_original.pdf", 245760), ("fotos_local.zip", 3145728)],
        obs=["Vistoria agendada; solicitado acesso ao depósito."],
        loc=("Recife", "Casa Amarela"),
    ),
    dict(
        o="SEI",
        t="Renovação de licença sanitária – padaria",
        k="Licenciamento",
        e="Padaria Pão Quente",
        p="Média",
        s="Em análise",
        r="i1",
        z=2,
        c=-12,
        d="Pedido de renovação anual da licença sanitária com documentação completa.",
        loc=("Recife", "Boa Viagem"),
    ),
    dict(
        o="SEI",
        t="Solicitação de inspeção em clínica odontológica",
        k="Inspeção",
        e="Clínica OdontoVida",
        p="Média",
        s="Nova",
        r="i1",
        z=9,
        c=-3,
        loc=("Recife", "Graças"),
    ),
    dict(
        o="Manual",
        t="Reclamação de higiene em restaurante",
        k="Reclamação",
        e="Restaurante Sabor da Terra",
        p="Alta",
        s="Aguardando documento",
        r="i1",
        z=1,
        c=-20,
        d="Cliente relata higiene precária nos banheiros e na cozinha aparente.",
        obs=["Solicitado ao estabelecimento o plano de limpeza e o controle de pragas."],
        loc=("Olinda", None),
    ),
    dict(
        o="SEI",
        t="Análise de projeto arquitetônico – laboratório",
        k="Licenciamento",
        e="Laboratório Análise Vida",
        p="Baixa",
        s="Em análise",
        r="i1",
        z=20,
        c=-9,
        docs=[("projeto_arquitetonico.pdf", 5242880)],
        loc=("Recife", "Boa Vista"),
    ),
    dict(
        o="Manual",
        t="Inspeção de rotina – supermercado",
        k="Inspeção de rotina",
        e="Supermercado Central",
        p="Média",
        s="Concluída",
        r="i1",
        z=-10,
        c=-60,
        x=-12,
        loc=("Recife", "São José"),
    ),
    dict(
        o="SEI",
        t="Denúncia de venda de medicamentos vencidos",
        k="Denúncia",
        e="Farmácia Saúde Já",
        p="Alta",
        s="Em andamento",
        r="i2",
        z=0,
        c=-15,
        d="Consumidor encontrou medicamentos com validade expirada em prateleira.",
        docs=[("foto_medicamentos.jpg", 860160)],
        loc=("Jaboatão dos Guararapes", None),
    ),
    dict(
        o="SEI",
        t="Licença sanitária – salão de beleza",
        k="Licenciamento",
        e="Studio Bela Forma",
        p="Baixa",
        s="Nova",
        r="i2",
        z=12,
        c=-2,
        loc=("Recife", "Espinheiro"),
    ),
    dict(
        o="Manual",
        t="Inspeção pós-obra em hospital",
        k="Inspeção",
        e="Hospital Municipal Santa Rita",
        p="Alta",
        s="Em andamento",
        r="i2",
        z=3,
        c=-30,
        d="Verificação das áreas reformadas antes da reabertura do setor de internação.",
        obs=["Alas B e C inspecionadas; pendente a ala D."],
        loc=("Camaragibe", None),
    ),
    dict(
        o="SEI",
        t="Reclamação de resíduos – açougue",
        k="Reclamação",
        e="Açougue Boi Gordo",
        p="Média",
        s="Aguardando documento",
        r="i2",
        z=-2,
        c=-25,
        d="Vizinhos reclamam do descarte irregular de resíduos orgânicos.",
        loc=("Recife", "Afogados"),
    ),
    dict(
        o="SEI",
        t="Informação sobre normas para food truck",
        k="Solicitação de informação",
        e="Feira Gastronômica",
        p="Baixa",
        s="Concluída",
        r="i2",
        z=-20,
        c=-75,
        x=-25,
        loc=("Recife", "Recife Antigo"),
    ),
    dict(
        o="SEI",
        t="Denúncia de água contaminada em escola",
        k="Denúncia",
        e="Escola Municipal Ipê",
        p="Alta",
        s="Em análise",
        r="i3",
        z=5,
        c=-6,
        d="Pais relatam alteração de cor e odor na água dos bebedouros.",
        loc=("Recife", "Ibura"),
    ),
    dict(
        o="Manual",
        t="Inspeção em creche",
        k="Inspeção de rotina",
        e="Creche Pequeno Passo",
        p="Média",
        s="Em andamento",
        r="i3",
        z=7,
        c=-18,
        loc=("Paulista", None),
    ),
    dict(
        o="SEI",
        t="Renovação de alvará – clínica veterinária",
        k="Licenciamento",
        e="PetCare Veterinária",
        p="Média",
        s="Aguardando documento",
        r="i3",
        z=-1,
        c=-35,
        docs=[("requerimento_alvara.pdf", 153600)],
        loc=("Recife", "Madalena"),
    ),
    dict(
        o="SEI",
        t="Reclamação de higiene em UPA",
        k="Reclamação",
        e="UPA Zona Norte",
        p="Alta",
        s="Nova",
        r="i3",
        z=4,
        c=-1,
        loc=("Recife", "Água Fria"),
    ),
    dict(
        o="Manual",
        t="Inspeção de rotina – hotel",
        k="Inspeção de rotina",
        e="Hotel Vista Mar",
        p="Baixa",
        s="Concluída",
        r="i3",
        z=-5,
        c=-20,
        x=-6,
        loc=("Recife", "Pina"),
    ),
    dict(
        o="SEI",
        t="Denúncia de comércio de alimentos sem licença",
        k="Denúncia",
        e="Ambulantes da Praça da Matriz",
        p="Alta",
        s="Nova",
        r=None,
        z=2,
        c=-1,
        loc=("Recife", "Santo Amaro"),
    ),
    dict(
        o="SEI",
        t="Solicitação de licença – casa de repouso",
        k="Licenciamento",
        e="Casa de Repouso Bem Viver",
        p="Média",
        s="Nova",
        r=None,
        z=14,
        c=-2,
        loc=("Recife", "Torre"),
    ),
    dict(
        o="SEI",
        t="Reclamação de piscina pública sem cloração",
        k="Reclamação",
        e="Clube Aquático Central",
        p="Alta",
        s="Nova",
        r=None,
        z=-3,
        c=-4,
        loc=("Recife", "Cordeiro"),
    ),
    dict(
        o="Manual",
        t="Boas práticas em cozinha industrial",
        k="Solicitação de informação",
        e="Cozinha Industrial Delícia",
        p="Baixa",
        s="Nova",
        r=None,
        z=25,
        c=0,
        loc=("Cabo de Santo Agostinho", None),
    ),
    dict(
        o="SEI",
        t="Inspeção em estúdio de tatuagem e piercing",
        k="Inspeção",
        e="Studio Tattoo Ink",
        p="Média",
        s="Nova",
        r=None,
        z=8,
        c=-1,
        loc=("Recife", "Boa Vista"),
    ),
    dict(
        o="SEI",
        t="Regularização de cadastro – farmácia de manipulação",
        k="Licenciamento",
        e="Farmácia Manipulare",
        p="Média",
        s="Em andamento",
        r="i1",
        z=6,
        c=-22,
        sc="Documentação regularizada e vistoria realizada, sem pendências.",
        loc=("Recife", "Imbiribeira"),
    ),
    dict(
        o="Manual",
        t="Verificação de descarte de resíduos – clínica",
        k="Inspeção",
        e="Clínica Renal Vida",
        p="Média",
        s="Em andamento",
        r="i2",
        z=3,
        c=-28,
        sc="Contrato de coleta de resíduos apresentado e conferido.",
        loc=("Recife", "Iputinga"),
    ),
    dict(
        o="SEI",
        t="Licenciamento de indústria de laticínios",
        k="Licenciamento",
        e="Laticínios Vale Verde",
        p="Alta",
        s="Concluída",
        r="i1",
        z=-30,
        c=-80,
        x=-33,
        loc=("Moreno", None),
    ),
    dict(
        o="SEI",
        t="Reclamação de ruído e higiene – bar",
        k="Reclamação",
        e="Bar do Zé",
        p="Baixa",
        s="Concluída",
        r="i2",
        z=-15,
        c=-45,
        x=-20,
        loc=("Recife", "Várzea"),
    ),
    dict(
        o="SEI",
        t="Inspeção em feira livre",
        k="Inspeção de rotina",
        e="Feira Livre do Centro",
        p="Média",
        s="Concluída",
        r="i1",
        z=-2,
        c=-12,
        x=-3,
        loc=("Recife", "São José"),
    ),
    dict(
        o="Manual",
        t="Denúncia de produtos sem rótulo",
        k="Denúncia",
        e="Empório Natural",
        p="Média",
        s="Concluída",
        r="i2",
        z=-1,
        c=-8,
        x=-2,
        loc=("Recife", "Encruzilhada"),
    ),
    dict(
        o="SEI",
        t="Análise de projeto – hemodiálise",
        k="Licenciamento",
        e="Instituto Renal Norte",
        p="Alta",
        s="Em análise",
        r="i3",
        z=15,
        c=-5,
        loc=("Recife", "Campo Grande"),
    ),
]

# Processos que a "exportação do SEI" (coletor) traz: os MODELOS_SEI do protótipo.
# (título, tipo, estabelecimento, local, dias desde a autuação)
MODELOS_SEI = [
    ("Denúncia de manipulação inadequada de carnes", "Denúncia", "Churrascaria Fogo Alto", "Boa Viagem, Recife", 8),
    ("Pedido de licença sanitária – lanchonete", "Licenciamento", "Lanchonete Ponto Certo", "Torre, Recife", 3),
    ("Reclamação de insetos em cozinha industrial", "Reclamação", "Refeitório Fábrica Norte", "Paulista", 2),
    ("Solicitação de vistoria em consultório médico", "Inspeção", "Consultório Dr. Almeida", "Graças, Recife", 1),
    (
        "Informação sobre validade de licença",
        "Solicitação de informação",
        "Mercearia Dois Irmãos",
        "Afogados, Recife",
        1,
    ),
    ("Renovação de licença – academia com piscina", "Licenciamento", "Academia Corpo em Forma", "Olinda", 0),
    (
        "Denúncia de água estagnada em condomínio",
        "Denúncia",
        "Condomínio Parque das Flores",
        "Jaboatão dos Guararapes",
        0,
    ),
    ("Inspeção de rotina – cantina escolar", "Inspeção de rotina", "Colégio Aurora", "Várzea, Recife", 0),
]


def _id_sei(n: int, ano: int) -> str:
    """Mesmo formato do gerarId do protótipo: 00089.000001/2026-01."""
    return f"{89:05d}.{n:06d}/{ano}-{n % 97:02d}"


def _montar(db, cont: dict, r: dict, hoje: date) -> Demanda:
    """Porta do montarDemanda() do protótipo."""
    ano = hoje.year
    if r["o"] == "SEI":
        cont["sei"] += 1
        did = _id_sei(cont["sei"], ano)
    else:
        cont["man"] += 1
        did = f"MAN-{ano}-{cont['man']:04d}"

    agora = datetime.now().replace(second=0, microsecond=0)

    def dia(n: int, hh: int, mm: int) -> datetime:
        dt = datetime.combine(hoje + timedelta(days=n), time(hh, mm))
        # Eventos "de hoje" nunca ficam no futuro (mantendo a ordem relativa entre eles).
        return min(dt, agora - timedelta(minutes=(24 * 60 - (hh * 60 + mm)) // 30 + 1))

    resp = r.get("r")
    mun, bairro = r["loc"]
    d = Demanda(
        id=did,
        origem=r["o"],
        titulo=r["t"],
        descricao=r.get("d", ""),
        tipo=r["k"],
        estabelecimento=r["e"],
        municipio=mun,
        bairro=bairro,
        prioridade=r["p"],
        status=r["s"],
        responsavel_id=resp,
        prazo=hoje + timedelta(days=r["z"]),
        criada=dia(r["c"], 9, 0),
    )
    ev = [
        Evento(
            tipo="criacao",
            por="sei" if r["o"] == "SEI" else "g1",
            em=d.criada,
            texto="Demanda importada do SEI" if r["o"] == "SEI" else "Demanda cadastrada manualmente",
        )
    ]
    if resp:
        ev.append(Evento(tipo="reatribuicao", por="g1", em=dia(r["c"], 10, 30), texto=f"Atribuída a {NOMES[resp]}"))
    if r["s"] != "Nova":
        alvo = "Em andamento" if r["s"] == "Concluída" else r["s"]
        ev.append(
            Evento(
                tipo="status",
                por=resp or "g1",
                em=dia(min(r["c"] + 1, -1), 14, 0),
                texto=f"Alterado de Nova para {alvo}",
            )
        )
    for i, (nome, tam) in enumerate(r.get("docs", [])):
        em = dia(min(r["c"] + 2, -1), 11, 0)
        d.docs.append(Documento(id=f"{did}-d{i}", nome=nome, tam=tam, por=resp or "g1", em=em, caminho=None))
        ev.append(Evento(tipo="documento", por=resp or "g1", em=em, texto=f"Anexado: {nome}"))
    for i, texto in enumerate(r.get("obs", [])):
        ev.append(Evento(tipo="observacao", por=resp or "g1", em=dia(min(r["c"] + 3 + i, -1), 16, 0), texto=texto))
    if r["s"] == "Concluída":
        d.concluida_em = dia(r["x"], 15, 0)
        ev.append(
            Evento(
                tipo="conclusao",
                por="g1",
                em=d.concluida_em,
                texto="Demanda concluída. Observação: " + r.get("fim", "Vistoria finalizada sem pendências."),
            )
        )
    if r.get("sc"):
        d.sol_por, d.sol_em, d.sol_obs = resp, dia(-1, 10, 15), r["sc"]
        ev.append(Evento(tipo="status", por=resp, em=d.sol_em, texto="Conclusão solicitada ao Gestor: " + r["sc"]))
    ev.sort(key=lambda e: e.em)
    d.historico.extend(ev)
    return d


def gerar_exportacao_sei(hoje: date | None = None) -> None:
    """Recria a exportação simulada da tela 'Controle de Processos' do SEI com datas relativas a hoje."""
    hoje = hoje or date.today()
    linhas = []
    for i, (titulo, tipo, estab, local, idade) in enumerate(MODELOS_SEI):
        n = 101 + i
        autuacao = (hoje - timedelta(days=idade)).strftime("%d/%m/%Y")
        linhas.append(
            f"    <tr><td>{_id_sei(n, hoje.year)}</td><td>Vigilância Sanitária: {escape(tipo)}</td>"
            f"<td>{escape(titulo)} – {escape(local)}</td><td>{escape(estab)}</td><td>{autuacao}</td><td>SESAU-VISA</td></tr>"
        )
    ontem = (hoje - timedelta(days=1)).strftime("%d/%m/%Y")
    linhas.append(
        f"    <tr><td>89.123/{hoje.year % 100}</td><td>Vigilância Sanitária: Denúncia</td>"
        f"<td>Registro com número fora do padrão – Recife</td><td>Interessado Exemplo</td><td>{ontem}</td><td>SESAU-VISA</td></tr>"
    )
    linhas.append(
        f"    <tr><td>{_id_sei(130, hoje.year)}</td><td>Licitação: Aquisição de Material</td>"
        f"<td>Processo administrativo de outra natureza – Recife</td><td>Gerência Administrativa</td><td>{ontem}</td><td>SESAU-VISA</td></tr>"
    )
    html = f"""<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"><title>SEI - Controle de Processos (EXPORTAÇÃO SIMULADA)</title></head>
<body>
<!--
  ARQUIVO SIMULADO, gerado por `python -m backend.app.seed`, para desenvolver o coletor.
  Imita a tela "Controle de Processos > Recebidos" do SEI da unidade.
  Dados FICTÍCIOS. As duas últimas linhas são propositalmente inválidas.
-->
<h1>Controle de Processos — Unidade SESAU-VISA</h1>
<table id="tblProcessosRecebidos">
  <thead>
    <tr><th>Processo</th><th>Tipo</th><th>Especificação</th><th>Interessado</th><th>Autuação</th><th>Unidade</th></tr>
  </thead>
  <tbody>
{chr(10).join(linhas)}
  </tbody>
</table>
</body>
</html>
"""
    config.SEI_EXPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    config.SEI_EXPORT_PATH.write_text(html, encoding="utf-8")


def popular(db, hoje: date | None = None) -> None:
    hoje = hoje or date.today()
    for uid, nome, cargo, perfil in USUARIOS:
        db.add(Usuario(id=uid, nome=nome, cargo=cargo, perfil=perfil))
    db.flush()
    cont = {"sei": 0, "man": 0}
    for r in SEED:
        db.add(_montar(db, cont, r, hoje))
    set_param(db, "ultima_sync", (datetime.now() - timedelta(minutes=90)).strftime("%Y-%m-%dT%H:%M"))
    db.commit()


def recriar_banco() -> None:
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
    with SessionLocal() as db:
        popular(db)


def main() -> None:
    if config.DATABASE_URL.startswith("sqlite:///") and not config.DATABASE_URL.endswith(":memory:"):
        caminho = config.DATABASE_URL.replace("sqlite:///", "")
        engine.dispose()
        if os.path.exists(caminho):
            os.remove(caminho)
    recriar_banco()
    gerar_exportacao_sei()
    print(f"[seed] Banco recriado com {len(USUARIOS)} usuários e {len(SEED)} demandas de exemplo (as do protótipo).")
    print(f"[seed] Exportação simulada do SEI com {len(MODELOS_SEI)} processos novos: {config.SEI_EXPORT_PATH.name}")


if __name__ == "__main__":
    main()
