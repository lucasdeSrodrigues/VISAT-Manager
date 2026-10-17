from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Sessao, Usuario
from ..schemas import LoginIn, LoginOut, UsuarioOut
from ..security import criar_sessao, usuario_atual, verificar_senha

router = APIRouter(prefix="/api/auth", tags=["Acesso e perfis"])


@router.post("/login", response_model=LoginOut)
def login(dados: LoginIn, db: Session = Depends(get_db)):
    u = db.scalar(select(Usuario).where(Usuario.email == dados.email.strip().lower()))
    if not u or not u.ativo or not verificar_senha(dados.senha, u.senha_hash):
        raise HTTPException(401, "E-mail ou senha inválidos.")
    return LoginOut(token=criar_sessao(db, u), usuario=UsuarioOut.model_validate(u))


@router.get("/me", response_model=UsuarioOut)
def me(usuario: Usuario = Depends(usuario_atual)):
    return usuario


@router.post("/logout", status_code=204)
def logout(usuario: Usuario = Depends(usuario_atual), db: Session = Depends(get_db)):
    for s in db.scalars(select(Sessao).where(Sessao.usuario_id == usuario.id)):
        db.delete(s)
    db.commit()
