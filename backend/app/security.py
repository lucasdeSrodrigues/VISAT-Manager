"""Autenticação simples por token de sessão (adequada ao MVP acadêmico).

Senhas com PBKDF2-SHA256 + salt. Em produção: SSO/LDAP da Prefeitura (ver docs/decisoes.md).
"""

import hashlib
import hmac
import secrets
from datetime import datetime, timedelta

from fastapi import Depends, Header, HTTPException
from sqlalchemy.orm import Session

from . import config
from .database import get_db
from .models import Perfil, Sessao, Usuario

_ITER = 120_000


def hash_senha(senha: str) -> str:
    salt = secrets.token_hex(16)
    dig = hashlib.pbkdf2_hmac("sha256", senha.encode(), bytes.fromhex(salt), _ITER).hex()
    return f"pbkdf2${salt}${dig}"


def verificar_senha(senha: str, armazenado: str) -> bool:
    try:
        _, salt, dig = armazenado.split("$")
    except ValueError:
        return False
    calc = hashlib.pbkdf2_hmac("sha256", senha.encode(), bytes.fromhex(salt), _ITER).hex()
    return hmac.compare_digest(calc, dig)


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


def exigir_gestor(usuario: Usuario = Depends(usuario_atual)) -> Usuario:
    if usuario.perfil != Perfil.GESTOR:
        raise HTTPException(403, "Ação restrita ao perfil Gestor.")
    return usuario
