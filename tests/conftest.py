import os
import tempfile

os.environ["VISAT_DATABASE_URL"] = "sqlite:///:memory:"
os.environ["VISAT_UPLOAD_DIR"] = tempfile.mkdtemp(prefix="visat-uploads-")
os.environ["VISAT_SEI_EXPORT"] = os.path.join(tempfile.mkdtemp(prefix="visat-sei-"), "sei_export.html")

from urllib.parse import quote  # noqa: E402

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from backend.app import seed  # noqa: E402
from backend.app.database import Base, SessionLocal, engine  # noqa: E402
from backend.app.main import app  # noqa: E402


@pytest.fixture()
def db():
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
    s = SessionLocal()
    yield s
    s.close()


@pytest.fixture()
def seeded(db):
    seed.popular(db)
    seed.gerar_exportacao_sei()
    return db


@pytest.fixture()
def client(seeded):
    with TestClient(app) as c:
        yield c


def entrar(client, perfil):
    r = client.post("/api/login", json={"user": "teste", "senha": "teste", "perfil": perfil})
    assert r.status_code == 200, r.text
    return {"Authorization": f"Bearer {r.json()['token']}"}


@pytest.fixture()
def gestor(client):
    return entrar(client, "g1")


@pytest.fixture()
def carlos(client):  # inspetor i1
    return entrar(client, "i1")


@pytest.fixture()
def ana(client):  # inspetora i2
    return entrar(client, "i2")


def url(demanda_id: str, resto: str = "") -> str:
    return f"/api/demandas/{quote(demanda_id, safe='')}{resto}"


def demandas(client, h):
    return client.get("/api/estado", headers=h).json()["demandas"]


def achar(client, h, **filtro):
    return next(d for d in demandas(client, h) if all(d[k] == v for k, v in filtro.items()))
