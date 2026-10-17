import os
import tempfile

os.environ["VISAT_DATABASE_URL"] = "sqlite:///:memory:"
os.environ["VISAT_UPLOAD_DIR"] = tempfile.mkdtemp(prefix="visat-uploads-")

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from backend.app.database import Base, SessionLocal, engine  # noqa: E402
from backend.app.main import app  # noqa: E402
from backend.app.seed import SENHA_DEMO, popular  # noqa: E402


@pytest.fixture()
def db():
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
    s = SessionLocal()
    yield s
    s.close()


@pytest.fixture()
def seeded(db):
    popular(db)
    return db


@pytest.fixture()
def client(seeded):
    return TestClient(app)


def _login(client, email):
    r = client.post("/api/auth/login", json={"email": email, "senha": SENHA_DEMO})
    assert r.status_code == 200, r.text
    return {"Authorization": f"Bearer {r.json()['token']}"}


@pytest.fixture()
def gestor(client):
    return _login(client, "gestor@visat.demo")


@pytest.fixture()
def rodrigo(client):
    return _login(client, "rodrigo@visat.demo")


@pytest.fixture()
def camila(client):
    return _login(client, "camila@visat.demo")
