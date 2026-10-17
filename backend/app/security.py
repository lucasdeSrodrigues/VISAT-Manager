"""Sessão por token.

Login de DEMONSTRAÇÃO, idêntico ao protótipo: usuário e senha precisam estar preenchidos
e o perfil é escolhido na tela. Autenticação real (SSO/LDAP da Prefeitura) é evolução
planejada — ver docs/decisoes.md.
"""

import secrets
from datetime import datetime, timedelta

from fastapi import Depends, Header, HTTPException
from sqlalchemy.orm import Session

from . import config
from .database import get_db
from .models import Sessao, Usuario


def criar_sessao(db: Session, usuario: Usuario) -> str:
    token = secrets.token_urlsafe(32)
    db.add(Sessao(token=token, usuario_id=usuario.id, expira_em=datetime.now() + timedelta(hours=config.TOKEN_HORAS)))
    db.commit()
    return token


def usuario_atual(authorization: str | None = Header(default=None), db: Session = Depends(get_db)) -> Usuario:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(401, "Não autenticado.")
    sessao = db.get(Sessao, authorization.split(" ", 1)[1].strip())
    if not sessao or sessao.expira_em < datetime.now() or not sessao.usuario.ativo:
        raise HTTPException(401, "Sessão inválida ou expirada.")
    return sessao.usuario
