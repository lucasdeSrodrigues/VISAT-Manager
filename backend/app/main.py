"""VISAT Manager — API + interface web (o protótipo index.html, agora com dados reais).

Rodar:  python -m uvicorn backend.app.main:app --reload   → http://localhost:8000
Docs interativas da API: http://localhost:8000/docs
"""

from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy import inspect

from . import seed
from .database import Base, SessionLocal, engine
from .models import Usuario
from .routers import auth, demandas, painel

FRONTEND = Path(__file__).resolve().parents[2] / "frontend"


def preparar_banco() -> None:
    """Cria as tabelas; se o banco estiver vazio ou num formato antigo, carrega os dados de exemplo."""
    insp = inspect(engine)
    if insp.has_table("demandas") and "titulo" not in {c["name"] for c in insp.get_columns("demandas")}:
        Base.metadata.drop_all(engine)  # banco de uma versão anterior do MVP
    Base.metadata.create_all(engine)
    with SessionLocal() as db:
        vazio = db.query(Usuario).count() == 0
    if vazio:
        seed.recriar_banco()
        seed.gerar_exportacao_sei()


@asynccontextmanager
async def lifespan(_: FastAPI):
    preparar_banco()
    yield


app = FastAPI(
    lifespan=lifespan,
    title="VISAT Manager API",
    version="0.2.0-sprint1",
    description="Gestão das demandas da VISAT Recife. Complementa o SEI — não o substitui.",
)

app.include_router(auth.router)
app.include_router(painel.router)
app.include_router(demandas.router)


@app.get("/api/saude", tags=["Infra"])
def healthcheck():
    return {"status": "ok"}


app.mount("/static", StaticFiles(directory=FRONTEND), name="static")


@app.get("/", include_in_schema=False)
def index():
    return FileResponse(FRONTEND / "index.html")
