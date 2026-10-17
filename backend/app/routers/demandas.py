"""Endpoints das demandas — um para cada ação do protótipo."""

import re
from contextlib import contextmanager
from datetime import date

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.responses import FileResponse, Response
from pydantic import BaseModel
from sqlalchemy.orm import Session

from .. import relatorios, services
from ..database import get_db
from ..models import Usuario
from ..rules import PermissaoNegadaError, RegraNegocioError
from ..security import usuario_atual

router = APIRouter(prefix="/api/demandas", tags=["Demandas"])

MAX_UPLOAD = 10 * 1024 * 1024
EXT_BLOQUEADAS = {".exe", ".bat", ".cmd", ".com", ".msi", ".js", ".vbs", ".ps1", ".sh", ".dll", ".scr"}


@contextmanager
def erros():
    """Converte as regras de negócio em respostas HTTP com a mesma mensagem do protótipo."""
    try:
        yield
    except LookupError as e:
        raise HTTPException(404, str(e)) from e
    except PermissaoNegadaError as e:
        raise HTTPException(403, str(e)) from e
    except RegraNegocioError as e:
        raise HTTPException(409, str(e)) from e


class NovaIn(BaseModel):
    titulo: str
    tipo: str = "Denúncia"
    estabelecimento: str = ""
    descricao: str = ""
    resp: str | None = None
    prioridade: str = "Média"
    prazo: date | None = None
    municipio: str | None = "Recife"
    bairro: str | None = None


class AtribuirIn(BaseModel):
    ids: list[str]
    resp: str | None = None


class StatusIn(BaseModel):
    status: str
    obs: str | None = None


class ObsIn(BaseModel):
    obs: str = ""


class GestaoIn(BaseModel):
    resp: str | None = None
    prioridade: str
    prazo: date | None = None


class TextoIn(BaseModel):
    texto: str = ""


def _resposta(db: Session, demanda_id: str, u: Usuario) -> dict:
    db.expire_all()
    return services.demanda_json(services.obter(db, u, demanda_id))


@router.post("", status_code=201)
def nova(dados: NovaIn, u: Usuario = Depends(usuario_atual), db: Session = Depends(get_db)):
    with erros():
        d = services.criar_manual(db, u, **dados.model_dump())
        return _resposta(db, d.id, u)


@router.post("/atribuir")
def atribuir(dados: AtribuirIn, u: Usuario = Depends(usuario_atual), db: Session = Depends(get_db)):
    with erros():
        return {"alteradas": services.atribuir(db, u, dados.ids, dados.resp)}


@router.get("/{demanda_id:path}/relatorio.pdf")
def relatorio_pdf(demanda_id: str, u: Usuario = Depends(usuario_atual), db: Session = Depends(get_db)):
    with erros():
        d = services.obter(db, u, demanda_id)
        pdf = relatorios.pdf_demanda(db, d)
    nome = re.sub(r"[^\w-]", "_", d.id)
    return Response(
        pdf,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="relatorio-{nome}.pdf"'},
    )


@router.get("/{demanda_id:path}/documentos/{doc_id:path}")
def baixar(demanda_id: str, doc_id: str, u: Usuario = Depends(usuario_atual), db: Session = Depends(get_db)):
    with erros():
        d = services.obter(db, u, demanda_id)
    doc = next((x for x in d.docs if x.id == doc_id), None)
    if not doc:
        raise HTTPException(404, "Documento não encontrado.")
    if not doc.caminho:
        raise HTTPException(404, "Documento de exemplo: o arquivo não foi armazenado.")
    return FileResponse(doc.caminho, filename=doc.nome)


@router.post("/{demanda_id:path}/status")
def status(demanda_id: str, dados: StatusIn, u: Usuario = Depends(usuario_atual), db: Session = Depends(get_db)):
    with erros():
        services.mudar_status(db, u, services.obter(db, u, demanda_id), dados.status, dados.obs)
        return _resposta(db, demanda_id, u)


@router.post("/{demanda_id:path}/solicitar-conclusao")
def solicitar(demanda_id: str, dados: ObsIn, u: Usuario = Depends(usuario_atual), db: Session = Depends(get_db)):
    with erros():
        services.solicitar_conclusao(db, u, services.obter(db, u, demanda_id), dados.obs)
        return _resposta(db, demanda_id, u)


@router.post("/{demanda_id:path}/aprovar")
def aprovar(demanda_id: str, u: Usuario = Depends(usuario_atual), db: Session = Depends(get_db)):
    with erros():
        services.aprovar(db, u, services.obter(db, u, demanda_id))
        return _resposta(db, demanda_id, u)


@router.post("/{demanda_id:path}/devolver")
def devolver(demanda_id: str, dados: ObsIn, u: Usuario = Depends(usuario_atual), db: Session = Depends(get_db)):
    with erros():
        services.devolver(db, u, services.obter(db, u, demanda_id), dados.obs)
        return _resposta(db, demanda_id, u)


@router.post("/{demanda_id:path}/gestao")
def gestao(demanda_id: str, dados: GestaoIn, u: Usuario = Depends(usuario_atual), db: Session = Depends(get_db)):
    with erros():
        services.salvar_gestao(
            db, u, services.obter(db, u, demanda_id), resp=dados.resp, prioridade=dados.prioridade, prazo=dados.prazo
        )
        return _resposta(db, demanda_id, u)


@router.post("/{demanda_id:path}/observacoes", status_code=201)
def observacao(demanda_id: str, dados: TextoIn, u: Usuario = Depends(usuario_atual), db: Session = Depends(get_db)):
    with erros():
        services.observar(db, u, services.obter(db, u, demanda_id), dados.texto)
        return _resposta(db, demanda_id, u)


@router.post("/{demanda_id:path}/documentos", status_code=201)
async def anexar(
    demanda_id: str, arquivo: UploadFile = File(...), u: Usuario = Depends(usuario_atual), db: Session = Depends(get_db)
):
    nome = re.sub(r"[^\w.\- ()]", "_", arquivo.filename or "documento")[:150]
    ext = ("." + nome.rsplit(".", 1)[-1].lower()) if "." in nome else ""
    if ext in EXT_BLOQUEADAS:
        raise HTTPException(422, "Tipo de arquivo não permitido.")
    conteudo = await arquivo.read()
    if len(conteudo) > MAX_UPLOAD:
        raise HTTPException(413, "Arquivo maior que 10 MB.")
    with erros():
        services.anexar(db, u, services.obter(db, u, demanda_id), nome, conteudo)
        return _resposta(db, demanda_id, u)


@router.get("/{demanda_id:path}")
def ver(demanda_id: str, u: Usuario = Depends(usuario_atual), db: Session = Depends(get_db)):
    with erros():
        return services.demanda_json(services.obter(db, u, demanda_id))
