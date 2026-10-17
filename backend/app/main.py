"""VISAT Manager — API + interface web.

Rodar:  uvicorn backend.app.main:app --reload   → http://localhost:8000
Docs interativas da API: http://localhost:8000/docs
"""

from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from .database import Base, engine
from .routers import auth, demandas, painel

FRONTEND = Path(__file__).resolve().parents[2] / "frontend"


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(engine)
    yield


app = FastAPI(
    lifespan=lifespan,
    title="VISAT Manager API",
    version="0.1.0-sprint1",
    description="Gestão das demandas de Vigilância em Saúde do Trabalhador (VISAT Recife). "
    "Complementa o SEI — não o substitui.",
)


app.include_router(auth.router)
app.include_router(demandas.router)
app.include_router(painel.router)


@app.get("/api/saude", tags=["Infra"])
def healthcheck():
    return {"status": "ok"}


app.mount("/static", StaticFiles(directory=FRONTEND), name="static")


@app.get("/", include_in_schema=False)
def index():
    return FileResponse(FRONTEND / "index.html")
