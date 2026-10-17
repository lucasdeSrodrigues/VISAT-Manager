from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from sqlalchemy.pool import StaticPool

from .config import DATABASE_URL


def criar_engine(url: str = DATABASE_URL):
    if url.startswith("sqlite"):
        extra = {"poolclass": StaticPool} if url.endswith(":memory:") else {}
        return create_engine(url, connect_args={"check_same_thread": False}, **extra)
    return create_engine(url, pool_pre_ping=True)


engine = criar_engine()
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
