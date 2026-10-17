from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Sessao, Usuario
from ..security import criar_sessao, usuario_atual

router = APIRouter(prefix="/api", tags=["Acesso"])


class LoginIn(BaseModel):
    user: str = ""
    senha: str = ""
    perfil: str  # id do usuário escolhido em "Perfil (demonstração)"


def usuario_json(u: Usuario) -> dict:
    return {"id": u.id, "nome": u.nome, "cargo": u.cargo, "perfil": u.perfil}


@router.post("/login")
def login(dados: LoginIn, db: Session = Depends(get_db)):
    """Login de demonstração, igual ao protótipo: usuário e senha preenchidos + perfil escolhido."""
    if not dados.user.strip():
        raise HTTPException(422, "Informe o usuário.")
    if not dados.senha:
        raise HTTPException(422, "Informe a senha.")
    u = db.get(Usuario, dados.perfil)
    if not u or not u.ativo:
        raise HTTPException(401, "Perfil inválido.")
    return {"token": criar_sessao(db, u), "usuario": usuario_json(u)}


@router.post("/logout", status_code=204)
def logout(u: Usuario = Depends(usuario_atual), db: Session = Depends(get_db)):
    for s in db.scalars(select(Sessao).where(Sessao.usuario_id == u.id)):
        db.delete(s)
    db.commit()


@router.get("/usuarios")
def usuarios(db: Session = Depends(get_db)):
    """Lista pública dos perfis de demonstração (alimenta o seletor da tela de login)."""
    return [usuario_json(u) for u in db.scalars(select(Usuario).where(Usuario.ativo).order_by(Usuario.id))]
