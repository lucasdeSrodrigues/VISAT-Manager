import re
from datetime import date

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from .. import config, rules, services
from ..database import get_db
from ..models import Demanda, Documento, Etapa, Movimentacao, Origem, Perfil, Prioridade, TipoOcorrencia, Usuario
from ..schemas import AtribuirIn, AvancarIn, DemandaCriar, DemandaDetalhe, DemandaEditar, ObservacaoIn, Pagina
from ..security import exigir_gestor, usuario_atual
from ..serializers import detalhe, resumo

router = APIRouter(prefix="/api/demandas", tags=["Demandas"])

ORDENACOES = {
    "prazo": Demanda.prazo_legal.asc(),
    "-prazo": Demanda.prazo_legal.desc(),
    "entrada": Demanda.data_entrada.asc(),
    "-entrada": Demanda.data_entrada.desc(),
}
MAX_UPLOAD = 10 * 1024 * 1024
EXT_PERMITIDAS = {".pdf", ".png", ".jpg", ".jpeg", ".doc", ".docx", ".odt", ".txt"}


def _fmt(v):
    return v.strftime("%d/%m/%Y") if isinstance(v, date) else getattr(v, "value", v)


def query_visiveis(usuario: Usuario):
    q = select(Demanda)
    if usuario.perfil == Perfil.INSPETOR:
        q = q.where(or_(Demanda.responsavel_id == usuario.id, Demanda.criado_por_id == usuario.id))
    return q


def obter(db: Session, demanda_id: int, usuario: Usuario) -> Demanda:
    d = db.get(Demanda, demanda_id)
    if not d:
        raise HTTPException(404, "Demanda não encontrada.")
    if not rules.pode_ver_demanda(usuario.perfil, usuario.id, d.responsavel_id, d.criado_por_id):
        raise HTTPException(403, "Você não tem acesso a esta demanda.")
    return d


def tratar(fn):
    try:
        return fn()
    except rules.PermissaoNegadaError as e:
        raise HTTPException(403, str(e)) from e
    except rules.RegraNegocioError as e:
        raise HTTPException(409, str(e)) from e


@router.get("", response_model=Pagina)
def listar(
    usuario: Usuario = Depends(usuario_atual),
    db: Session = Depends(get_db),
    q: str | None = None,
    etapa: list[Etapa] = Query(default=[]),
    prioridade: list[Prioridade] = Query(default=[]),
    origem: Origem | None = None,
    tipo: TipoOcorrencia | None = None,
    responsavel_id: int | None = None,
    sem_responsavel: bool = False,
    saude: str | None = None,
    abertas: bool = False,
    ordenar: str = "prazo",
    pagina: int = Query(1, ge=1),
    por_pagina: int = Query(20, ge=1, le=100),
):
    """Lista do Painel Central, filtrável por status, prioridade, responsável e origem (Fluxo de Dados)."""
    stmt = query_visiveis(usuario)
    if q:
        termo = f"%{q.strip()}%"
        stmt = stmt.where(
            or_(
                Demanda.codigo.ilike(termo),
                Demanda.orgao_demandante.ilike(termo),
                Demanda.empresa.ilike(termo),
                Demanda.municipio.ilike(termo),
                Demanda.descricao.ilike(termo),
            )
        )
    if etapa:
        stmt = stmt.where(Demanda.etapa.in_(etapa))
    if abertas:
        stmt = stmt.where(Demanda.etapa != Etapa.CONCLUIDA)
    if prioridade:
        stmt = stmt.where(Demanda.prioridade.in_(prioridade))
    if origem:
        stmt = stmt.where(Demanda.origem == origem)
    if tipo:
        stmt = stmt.where(Demanda.tipo_ocorrencia == tipo)
    if responsavel_id:
        stmt = stmt.where(Demanda.responsavel_id == responsavel_id)
    if sem_responsavel:
        stmt = stmt.where(Demanda.responsavel_id.is_(None))
    # abertas primeiro; dentro de cada grupo, a ordenação escolhida
    stmt = stmt.order_by(
        (Demanda.etapa == Etapa.CONCLUIDA).asc(), ORDENACOES.get(ordenar, ORDENACOES["prazo"]), Demanda.id
    )
    itens = [resumo(d) for d in db.scalars(stmt)]
    if saude:  # calculado (depende de 'hoje'), filtrado após a consulta
        itens = [i for i in itens if i.saude == saude.upper()]
    ini = (pagina - 1) * por_pagina
    return Pagina(itens=itens[ini : ini + por_pagina], total=len(itens), pagina=pagina, por_pagina=por_pagina)


@router.post("", response_model=DemandaDetalhe, status_code=201)
def criar_manual(dados: DemandaCriar, usuario: Usuario = Depends(usuario_atual), db: Session = Depends(get_db)):
    """Cadastro manual — demandas que chegam por outros meios (e-mail, ofício, presencial)."""
    d = tratar(
        lambda: services.registrar_entrada(
            db,
            origem=Origem.MANUAL,
            tipo=dados.tipo_ocorrencia,
            orgao=dados.orgao_demandante,
            municipio=dados.municipio,
            empresa=dados.empresa or None,
            ramo=dados.ramo_atividade or None,
            descricao=dados.descricao,
            prioridade=dados.prioridade,
            data_entrada=dados.data_entrada or date.today(),
            prazo_legal=dados.prazo_legal,
            autor=usuario,
        )
    )
    return detalhe(d, usuario)


@router.get("/{demanda_id}", response_model=DemandaDetalhe)
def ver(demanda_id: int, usuario: Usuario = Depends(usuario_atual), db: Session = Depends(get_db)):
    return detalhe(obter(db, demanda_id, usuario), usuario)


@router.patch("/{demanda_id}", response_model=DemandaDetalhe)
def editar(
    demanda_id: int, dados: DemandaEditar, gestor: Usuario = Depends(exigir_gestor), db: Session = Depends(get_db)
):
    d = obter(db, demanda_id, gestor)
    if d.etapa == Etapa.CONCLUIDA:
        raise HTTPException(409, "Demanda concluída não pode ser editada.")
    mudancas = []
    for campo, valor in dados.model_dump(exclude_none=True).items():
        antigo = getattr(d, campo)
        if campo == "prazo_legal" and valor < d.data_entrada:
            raise HTTPException(422, "O prazo legal não pode ser anterior à data de entrada.")
        if antigo != valor:
            setattr(d, campo, valor)
            mudancas.append(f"{campo.replace('_', ' ')}: {_fmt(antigo)} → {_fmt(valor)}")
    if mudancas:
        d.movimentacoes.append(
            Movimentacao(etapa=None, autor_id=gestor.id, descricao="Dados alterados — " + "; ".join(mudancas))
        )
        db.commit()
        db.refresh(d)
    return detalhe(d, gestor)


@router.post("/{demanda_id}/avancar", response_model=DemandaDetalhe)
def avancar(
    demanda_id: int, dados: AvancarIn, usuario: Usuario = Depends(usuario_atual), db: Session = Depends(get_db)
):
    """Registra a próxima etapa da Linha do Tempo (validação sequencial + permissão)."""
    d = obter(db, demanda_id, usuario)
    return detalhe(tratar(lambda: services.avancar(db, d, dados.etapa, usuario, dados.descricao)), usuario)


@router.post("/{demanda_id}/atribuir", response_model=DemandaDetalhe)
def atribuir(
    demanda_id: int, dados: AtribuirIn, gestor: Usuario = Depends(exigir_gestor), db: Session = Depends(get_db)
):
    d = obter(db, demanda_id, gestor)
    insp = db.get(Usuario, dados.responsavel_id)
    if not insp:
        raise HTTPException(404, "Inspetor não encontrado.")
    return detalhe(tratar(lambda: services.atribuir(db, d, insp, gestor)), gestor)


@router.post("/{demanda_id}/observacoes", response_model=DemandaDetalhe, status_code=201)
def observar(
    demanda_id: int, dados: ObservacaoIn, usuario: Usuario = Depends(usuario_atual), db: Session = Depends(get_db)
):
    d = obter(db, demanda_id, usuario)
    d.movimentacoes.append(Movimentacao(etapa=None, descricao=dados.descricao.strip(), autor_id=usuario.id))
    db.commit()
    db.refresh(d)
    return detalhe(d, usuario)


@router.post("/{demanda_id}/documentos", response_model=DemandaDetalhe, status_code=201)
async def anexar(
    demanda_id: int,
    arquivo: UploadFile = File(...),
    usuario: Usuario = Depends(usuario_atual),
    db: Session = Depends(get_db),
):
    d = obter(db, demanda_id, usuario)
    nome = re.sub(r"[^\w.\- ]", "_", arquivo.filename or "documento")[:150]
    ext = ("." + nome.rsplit(".", 1)[-1].lower()) if "." in nome else ""
    if ext not in EXT_PERMITIDAS:
        raise HTTPException(422, f"Tipo de arquivo não permitido. Use: {', '.join(sorted(EXT_PERMITIDAS))}")
    conteudo = await arquivo.read()
    if len(conteudo) > MAX_UPLOAD:
        raise HTTPException(413, "Arquivo maior que 10 MB.")
    pasta = config.UPLOAD_DIR / str(d.id)
    pasta.mkdir(parents=True, exist_ok=True)
    doc = Documento(demanda_id=d.id, nome=nome, caminho="", tamanho=len(conteudo), autor_id=usuario.id)
    db.add(doc)
    db.flush()
    destino = pasta / f"{doc.id}{ext}"
    destino.write_bytes(conteudo)
    doc.caminho = str(destino)
    d.movimentacoes.append(Movimentacao(etapa=None, descricao=f"Documento anexado: {nome}", autor_id=usuario.id))
    db.commit()
    db.refresh(d)
    return detalhe(d, usuario)


@router.get("/{demanda_id}/documentos/{doc_id}")
def baixar(demanda_id: int, doc_id: int, usuario: Usuario = Depends(usuario_atual), db: Session = Depends(get_db)):
    obter(db, demanda_id, usuario)
    doc = db.get(Documento, doc_id)
    if not doc or doc.demanda_id != demanda_id:
        raise HTTPException(404, "Documento não encontrado.")
    return FileResponse(doc.caminho, filename=doc.nome)
