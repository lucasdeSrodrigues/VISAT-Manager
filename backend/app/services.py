"""Lógica da aplicação — cada função espelha uma ação do protótipo (seção 8 do index.html),
com as mesmas mensagens e os mesmos textos no histórico, agora persistidos no banco.
"""

from datetime import date, datetime, timedelta

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from . import config, geo, rules
from .models import Demanda, Documento, Evento, Parametro, Usuario
from .rules import CONCLUIDA, MOTIVOS, PermissaoNegadaError, RegraNegocioError


def agora() -> datetime:
    return datetime.now().replace(second=0, microsecond=0)


def fdata(d: date) -> str:
    return d.strftime("%d/%m/%Y")


def nome_de(db: Session, uid: str | None) -> str:
    if uid == "sei":
        return "Sincronização SEI"
    u = db.get(Usuario, uid) if uid else None
    return u.nome if u else "—"


def registrar(d: Demanda, tipo: str, texto: str, por: str, em: datetime | None = None) -> None:
    d.historico.append(Evento(tipo=tipo, texto=texto, por=por, em=em or agora()))


# ------------------------------------------------------------------ parâmetros
def get_param(db: Session, chave: str, padrao: str = "") -> str:
    p = db.get(Parametro, chave)
    return p.valor if p else padrao


def set_param(db: Session, chave: str, valor: str) -> None:
    p = db.get(Parametro, chave)
    if p:
        p.valor = valor
    else:
        db.add(Parametro(chave=chave, valor=valor))


# ------------------------------------------------------------------ consultas
def visiveis(db: Session, u: Usuario) -> list[Demanda]:
    q = select(Demanda)
    if not rules.perm(u.perfil).ver_todas:
        q = q.where(Demanda.responsavel_id == u.id)
    return list(db.scalars(q.order_by(Demanda.criada.desc())))


def obter(db: Session, u: Usuario, demanda_id: str) -> Demanda:
    d = db.get(Demanda, demanda_id)
    if not d:
        raise LookupError("Demanda não encontrada.")
    if not rules.pode_ver(u.perfil, u.id, d.responsavel_id):
        raise PermissaoNegadaError(MOTIVOS["ver"])
    return d


def _dt(v: datetime | None) -> str | None:
    return v.strftime("%Y-%m-%dT%H:%M") if v else None


def demanda_json(d: Demanda) -> dict:
    """Formato exato do objeto `demanda` do protótipo (+ municipio/bairro)."""
    return {
        "id": d.id,
        "origem": d.origem,
        "titulo": d.titulo,
        "descricao": d.descricao,
        "tipo": d.tipo,
        "estabelecimento": d.estabelecimento,
        "municipio": d.municipio,
        "bairro": d.bairro,
        "prioridade": d.prioridade,
        "status": d.status,
        "responsavel": d.responsavel_id,
        "prazo": d.prazo.isoformat(),
        "criada": _dt(d.criada),
        "concluidaEm": _dt(d.concluida_em),
        "conclusaoSolicitada": {"por": d.sol_por, "em": _dt(d.sol_em), "obs": d.sol_obs} if d.sol_por else None,
        "docs": [
            {"id": x.id, "nome": x.nome, "tam": x.tam, "por": x.por, "em": _dt(x.em), "arquivo": bool(x.caminho)}
            for x in d.docs
        ],
        "historico": [{"tipo": e.tipo, "por": e.por, "em": _dt(e.em), "texto": e.texto} for e in d.historico],
    }


# ------------------------------------------------------------------ entrada
def proximo_id_manual(db: Session, ano: int) -> str:
    prefixo = f"MAN-{ano}-"
    ultimo = db.scalar(select(func.max(Demanda.id)).where(Demanda.id.like(f"{prefixo}%")))
    n = int(ultimo.rsplit("-", 1)[1]) + 1 if ultimo else 1
    return f"{prefixo}{n:04d}"


def _validar_local(municipio: str | None, bairro: str | None) -> tuple[str, str | None]:
    municipio = (municipio or "Recife").strip()
    if municipio not in geo.MUNICIPIOS:
        raise RegraNegocioError("Município fora da Região Metropolitana do Recife.")
    bairro = (bairro or "").strip() or None
    return municipio, bairro


def criar_manual(
    db: Session,
    u: Usuario,
    *,
    titulo: str,
    tipo: str,
    estabelecimento: str = "",
    descricao: str = "",
    resp: str | None = None,
    prioridade: str = "Média",
    prazo: date | None = None,
    municipio: str | None = None,
    bairro: str | None = None,
) -> Demanda:
    """FORMS.nova do protótipo. Inspetor: atribuída a ele, prioridade Média e prazo padrão."""
    p = rules.perm(u.perfil)
    titulo = (titulo or "").strip()
    if not titulo:
        raise RegraNegocioError("Informe o título da demanda.")
    if tipo not in rules.TIPOS:
        raise RegraNegocioError("Tipo inválido.")
    hoje = date.today()
    if p.atribuir_no_cadastro:
        if prioridade not in rules.PRIORIDADES:
            raise RegraNegocioError("Prioridade inválida.")
        if not prazo:
            raise RegraNegocioError("Informe o prazo.")
        if prazo < hoje:
            raise RegraNegocioError("O prazo não pode estar no passado.")
        if resp:
            alvo = db.get(Usuario, resp)
            if not alvo or alvo.perfil != "inspetor":
                raise RegraNegocioError("Responsável deve ser um inspetor.")
    else:
        resp, prioridade, prazo = u.id, "Média", hoje + timedelta(days=config.DIAS_PRAZO_PADRAO)
    municipio, bairro = _validar_local(municipio, bairro)
    d = Demanda(
        id=proximo_id_manual(db, hoje.year),
        origem="Manual",
        titulo=titulo[:140],
        descricao=(descricao or "").strip()[:2000],
        tipo=tipo,
        estabelecimento=(estabelecimento or "").strip()[:120],
        municipio=municipio,
        bairro=bairro,
        prioridade=prioridade,
        status="Nova",
        responsavel_id=resp or None,
        prazo=prazo,
        criada=agora(),
    )
    registrar(d, "criacao", "Demanda cadastrada manualmente", u.id)
    if resp:
        txt = (
            f"Atribuída a {nome_de(db, resp)}"
            if p.atribuir_no_cadastro
            else f"Atribuída automaticamente a {nome_de(db, resp)}"
        )
        registrar(d, "reatribuicao", txt, u.id)
    db.add(d)
    db.commit()
    return d


def registrar_sei(
    db: Session,
    *,
    id_sei: str,
    titulo: str,
    tipo: str,
    estabelecimento: str,
    prioridade: str,
    municipio: str,
    bairro: str | None,
    autuacao: date,
    descricao: str = "",
) -> Demanda:
    """Entrada pela sincronização com o SEI (usada pelo coletor). Não faz commit."""
    prazo = autuacao + timedelta(days=config.PRAZO_SEI_POR_TIPO.get(tipo, config.DIAS_PRAZO_PADRAO))
    d = Demanda(
        id=id_sei,
        origem="SEI",
        titulo=titulo,
        descricao=descricao or "Demanda importada automaticamente do SEI.",
        tipo=tipo,
        estabelecimento=estabelecimento,
        municipio=municipio,
        bairro=bairro,
        prioridade=prioridade,
        status="Nova",
        responsavel_id=None,
        prazo=prazo,
        criada=agora(),
    )
    registrar(d, "criacao", "Demanda importada do SEI", "sei")
    db.add(d)
    db.flush()
    return d


# ------------------------------------------------------------------ ações
def atribuir(db: Session, u: Usuario, ids: list[str], resp: str | None, commit: bool = True) -> int:
    if not rules.perm(u.perfil).atribuir:
        raise PermissaoNegadaError(MOTIVOS["atribuir"])
    if resp:
        alvo = db.get(Usuario, resp)
        if not alvo or alvo.perfil != "inspetor":
            raise RegraNegocioError("Responsável deve ser um inspetor.")
    n = 0
    for demanda_id in ids:
        d = db.get(Demanda, demanda_id)
        if not d or d.responsavel_id == (resp or None):
            continue
        ant = d.responsavel_id
        d.responsavel_id = resp or None
        texto = (
            f"Responsável alterado de {nome_de(db, ant)} para {nome_de(db, resp) if resp else 'sem responsável'}"
            if ant
            else f"Atribuída a {nome_de(db, resp)}"
        )
        registrar(d, "reatribuicao", texto, u.id)
        n += 1
    if commit:
        db.commit()
    return n


def _concluir(d: Demanda, obs: str, por: str) -> None:
    d.status, d.concluida_em = CONCLUIDA, agora()
    d.sol_por = d.sol_em = d.sol_obs = None
    registrar(d, "conclusao", f"Demanda concluída. Observação: {obs}", por)


def mudar_status(db: Session, u: Usuario, d: Demanda, novo: str, obs: str | None = None) -> str:
    tipo = rules.validar_mudanca_status(u.perfil, d.status, novo, obs)
    if tipo == "concluir":
        _concluir(d, obs.strip(), u.id)
    elif tipo == "reabrir":
        d.status, d.concluida_em = novo, None
        registrar(d, "status", f"Demanda reaberta ({novo}). Motivo: {obs.strip()}", u.id)
    else:
        registrar(d, "status", f"Alterado de {d.status} para {novo}", u.id)
        d.status = novo
    db.commit()
    return tipo


def solicitar_conclusao(db: Session, u: Usuario, d: Demanda, obs: str) -> None:
    if not rules.perm(u.perfil).solicitar_conclusao:
        raise PermissaoNegadaError("Somente Inspetor solicita conclusão; o Gestor conclui diretamente.")
    if not rules.aberta(d.status):
        raise PermissaoNegadaError(MOTIVOS["reabrir"])
    if d.sol_por:
        raise RegraNegocioError(MOTIVOS["solicitarPendente"])
    obs = (obs or "").strip()
    if not obs:
        raise RegraNegocioError("A observação é obrigatória para solicitar a conclusão.")
    d.sol_por, d.sol_em, d.sol_obs = u.id, agora(), obs
    registrar(d, "status", f"Conclusão solicitada ao Gestor: {obs}", u.id)
    db.commit()


def aprovar(db: Session, u: Usuario, d: Demanda) -> None:
    if not rules.perm(u.perfil).aprovar_conclusao:
        raise PermissaoNegadaError(MOTIVOS["concluir"])
    if not d.sol_por:
        raise RegraNegocioError("Não há conclusão solicitada para esta demanda.")
    _concluir(d, f"{d.sol_obs} (aprovada pelo Gestor)", u.id)
    db.commit()


def devolver(db: Session, u: Usuario, d: Demanda, obs: str) -> None:
    if not rules.perm(u.perfil).aprovar_conclusao:
        raise PermissaoNegadaError(MOTIVOS["concluir"])
    if not d.sol_por:
        raise RegraNegocioError("Não há conclusão solicitada para esta demanda.")
    obs = (obs or "").strip()
    if not obs:
        raise RegraNegocioError("Informe o motivo da devolução.")
    d.sol_por = d.sol_em = d.sol_obs = None
    registrar(d, "status", f"Conclusão devolvida ao inspetor. Motivo: {obs}", u.id)
    db.commit()


def salvar_gestao(
    db: Session, u: Usuario, d: Demanda, *, resp: str | None, prioridade: str, prazo: date | None
) -> None:
    p = rules.perm(u.perfil)
    if not (p.atribuir or p.prioridade_prazo):
        raise PermissaoNegadaError(MOTIVOS["atribuir"])
    if not prazo:
        raise RegraNegocioError("Informe o prazo.")
    if prazo != d.prazo and prazo < date.today():
        raise RegraNegocioError("O prazo não pode estar no passado.")
    if prioridade not in rules.PRIORIDADES:
        raise RegraNegocioError("Prioridade inválida.")
    m_resp, m_pr, m_pz = (resp or None) != d.responsavel_id, prioridade != d.prioridade, prazo != d.prazo
    if not (m_resp or m_pr or m_pz):
        raise RegraNegocioError("Nenhuma alteração para salvar.")
    if m_resp:
        atribuir(db, u, [d.id], resp, commit=False)
    partes = []
    if m_pr:
        partes.append(f"prioridade de {d.prioridade} para {prioridade}")
        d.prioridade = prioridade
    if m_pz:
        partes.append(f"prazo de {fdata(d.prazo)} para {fdata(prazo)}")
        d.prazo = prazo
    if partes:
        registrar(d, "edicao", f"Alterado: {'; '.join(partes)}", u.id)
    db.commit()


def observar(db: Session, u: Usuario, d: Demanda, texto: str) -> None:
    if not rules.pode_conteudo(u.perfil, u.id, d.responsavel_id, d.status):
        raise PermissaoNegadaError(MOTIVOS["conteudo"])
    texto = (texto or "").strip()
    if not texto:
        raise RegraNegocioError("Escreva a observação antes de registrar.")
    registrar(d, "observacao", texto[:4000], u.id)
    db.commit()


def anexar(db: Session, u: Usuario, d: Demanda, nome: str, conteudo: bytes) -> Documento:
    if not rules.pode_conteudo(u.perfil, u.id, d.responsavel_id, d.status):
        raise PermissaoNegadaError(MOTIVOS["conteudo"])
    em = agora()
    doc_id = f"{d.id}-d{int(datetime.now().timestamp() * 1000)}"
    pasta = config.UPLOAD_DIR / "".join(c if c.isalnum() else "_" for c in d.id)
    pasta.mkdir(parents=True, exist_ok=True)
    ext = ("." + nome.rsplit(".", 1)[-1].lower()) if "." in nome else ""
    destino = pasta / f"{doc_id.rsplit('-d', 1)[1]}{ext}"
    destino.write_bytes(conteudo)
    doc = Documento(id=doc_id, nome=nome, tam=len(conteudo), por=u.id, em=em, caminho=str(destino))
    d.docs.append(doc)
    registrar(d, "documento", f"Anexado: {nome}", u.id, em)
    db.commit()
    return doc
