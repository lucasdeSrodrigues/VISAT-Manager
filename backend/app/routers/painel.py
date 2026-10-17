from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from collector.pipeline import sincronizar
from collector.sources.sei_mock import SeiMockSource

from .. import config, rules, services
from ..database import get_db
from ..models import Demanda, Etapa, Perfil, Usuario
from ..schemas import SyncOut, UsuarioOut
from ..security import exigir_gestor, usuario_atual
from ..serializers import resumo
from .demandas import query_visiveis

router = APIRouter(prefix="/api", tags=["Painel"])


@router.get("/dashboard")
def dashboard(usuario: Usuario = Depends(usuario_atual), db: Session = Depends(get_db)):
    """Visão geral (wireframe Dashboard). Para o inspetor, considera só as demandas dele."""
    return services.visao_geral(db, list(db.scalars(query_visiveis(usuario))))


@router.get("/radar")
def radar(usuario: Usuario = Depends(usuario_atual), db: Session = Depends(get_db)):
    """Radar de Prazos: demandas abertas agrupadas em Vencidas, Urgentes, Atenção e Prazo seguro."""
    stmt = query_visiveis(usuario).where(Demanda.etapa != Etapa.CONCLUIDA).order_by(Demanda.prazo_legal)
    grupos = {f: [] for f in rules.FAIXAS_RADAR}
    for d in db.scalars(stmt):
        r = resumo(d)
        grupos[r.saude].append(r)
    return {"limites": {"urgente": config.LIMITE_URGENTE_DIAS, "atencao": config.LIMITE_ATENCAO_DIAS}, "grupos": grupos}


@router.get("/inspetores", response_model=list[UsuarioOut])
def inspetores(_: Usuario = Depends(usuario_atual), db: Session = Depends(get_db)):
    return db.scalars(
        select(Usuario).where(Usuario.perfil == Perfil.INSPETOR, Usuario.ativo).order_by(Usuario.nome)
    ).all()


@router.post("/sync/sei", response_model=SyncOut)
def sync_sei(_: Usuario = Depends(exigir_gestor), db: Session = Depends(get_db)):
    """Dispara a sincronização (coletor) — o mesmo pipeline do CLI `python -m collector.run`."""
    try:
        r = sincronizar(db, SeiMockSource(config.SEI_EXPORT_PATH))
    except (FileNotFoundError, ValueError) as e:
        raise HTTPException(502, f"Falha ao ler a fonte SEI: {e}") from e
    return SyncOut(**r.__dict__)
