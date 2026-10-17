"""Estado inicial da tela, sincronização SEI, restauração, mapa e relatório do período."""

from collections import defaultdict
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import Response
from sqlalchemy import select
from sqlalchemy.orm import Session

from collector.pipeline import sincronizar
from collector.sources.sei_mock import SeiMockSource

from .. import config, geo, relatorios, rules, seed, services
from ..database import get_db
from ..models import Usuario
from ..security import usuario_atual
from .auth import usuario_json

router = APIRouter(prefix="/api", tags=["Painel"])


@router.get("/estado")
def estado(u: Usuario = Depends(usuario_atual), db: Session = Depends(get_db)):
    """Tudo o que o protótipo mantinha em memória: usuários, demandas visíveis e última sincronização."""
    return {
        "usuario": usuario_json(u),
        "usuarios": [usuario_json(x) for x in db.scalars(select(Usuario).order_by(Usuario.id))],
        "demandas": [services.demanda_json(d) for d in services.visiveis(db, u)],
        "ultimaSync": services.get_param(db, "ultima_sync") or None,
        "municipios": geo.municipios(),
        "bairros": geo.bairros_recife(),
    }


@router.post("/sync/sei")
def sync_sei(u: Usuario = Depends(usuario_atual), db: Session = Depends(get_db)):
    if not rules.perm(u.perfil).sincronizar_sei:
        raise HTTPException(403, rules.MOTIVOS["sincronizarSEI"])
    try:
        r = sincronizar(db, SeiMockSource(config.SEI_EXPORT_PATH))
    except (FileNotFoundError, ValueError) as e:
        raise HTTPException(502, f"Falha ao ler a fonte SEI: {e}") from e
    return {**r.__dict__, "ultimaSync": services.get_param(db, "ultima_sync")}


@router.post("/restaurar")
def restaurar(u: Usuario = Depends(usuario_atual), db: Session = Depends(get_db)):
    """Botão "Restaurar dados de exemplo" do protótipo: recria os dados de demonstração."""
    db.close()
    seed.recriar_banco()
    seed.gerar_exportacao_sei()
    return {"ok": True}


@router.get("/mapa")
def mapa(u: Usuario = Depends(usuario_atual), db: Session = Depends(get_db)):
    """Demandas visíveis agrupadas por local (bairro do Recife ou município da RMR)."""
    pontos: dict[str, dict] = {}
    por_municipio: dict[str, dict] = defaultdict(lambda: {"abertas": 0, "vencidas": 0, "total": 0})
    hoje = date.today()
    for d in services.visiveis(db, u):
        loc = geo.localizar(d.municipio, d.bairro)
        m = por_municipio[d.municipio]
        m["total"] += 1
        urg = rules.urgencia(d.prazo, d.status, hoje)
        if rules.aberta(d.status):
            m["abertas"] += 1
            m["vencidas"] += urg["k"] == "venc"
        if not loc:
            continue
        p = pontos.setdefault(loc["rotulo"], {**loc, "demandas": []})
        p["demandas"].append(
            {
                "id": d.id,
                "titulo": d.titulo,
                "status": d.status,
                "prioridade": d.prioridade,
                "tipo": d.tipo,
                "prazo": d.prazo.isoformat(),
                "responsavel": d.responsavel_id,
                "estabelecimento": d.estabelecimento,
                "urgencia": urg,
            }
        )
    return {"pontos": list(pontos.values()), "porMunicipio": por_municipio}


@router.get("/relatorios.pdf")
def relatorio_periodo(
    dias: int = Query(30, ge=1, le=365), u: Usuario = Depends(usuario_atual), db: Session = Depends(get_db)
):
    pdf = relatorios.pdf_periodo(db, u, dias)
    return Response(
        pdf,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="relatorio-visat-{date.today()}-{dias}d.pdf"'},
    )
