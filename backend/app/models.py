"""Modelo de dados — mesmo formato de demanda usado no protótipo (index.html).

Demanda: id, origem, titulo, descricao, tipo, estabelecimento, prioridade, status,
responsavel, prazo, criada, docs, conclusaoSolicitada, concluidaEm, historico
(+ municipio e bairro, usados pelo Mapa de demandas).
"""

from datetime import date, datetime

from sqlalchemy import Date, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


class Usuario(Base):
    __tablename__ = "usuarios"
    id: Mapped[str] = mapped_column(String(20), primary_key=True)  # g1, i1, i2…
    nome: Mapped[str] = mapped_column(String(120))
    cargo: Mapped[str] = mapped_column(String(120))
    perfil: Mapped[str] = mapped_column(String(20))  # gestor | inspetor
    ativo: Mapped[bool] = mapped_column(default=True)


class Sessao(Base):
    __tablename__ = "sessoes"
    token: Mapped[str] = mapped_column(String(64), primary_key=True)
    usuario_id: Mapped[str] = mapped_column(ForeignKey("usuarios.id"))
    expira_em: Mapped[datetime] = mapped_column(DateTime)
    usuario: Mapped[Usuario] = relationship()


class Parametro(Base):
    """Pares chave/valor do sistema (ex.: data da última sincronização com o SEI)."""

    __tablename__ = "parametros"
    chave: Mapped[str] = mapped_column(String(40), primary_key=True)
    valor: Mapped[str] = mapped_column(String(200))


class Demanda(Base):
    __tablename__ = "demandas"
    id: Mapped[str] = mapped_column(String(40), primary_key=True)  # 00089.000001/2026-01 ou MAN-2026-0001
    origem: Mapped[str] = mapped_column(String(10))  # SEI | Manual
    titulo: Mapped[str] = mapped_column(String(140))
    descricao: Mapped[str] = mapped_column(Text, default="")
    tipo: Mapped[str] = mapped_column(String(40))
    estabelecimento: Mapped[str] = mapped_column(String(120), default="")
    municipio: Mapped[str] = mapped_column(String(80), default="Recife")
    bairro: Mapped[str | None] = mapped_column(String(80), nullable=True)
    prioridade: Mapped[str] = mapped_column(String(10), default="Média")
    status: Mapped[str] = mapped_column(String(30), default="Nova", index=True)
    responsavel_id: Mapped[str | None] = mapped_column(ForeignKey("usuarios.id"), nullable=True, index=True)
    prazo: Mapped[date] = mapped_column(Date, index=True)
    criada: Mapped[datetime] = mapped_column(DateTime)
    concluida_em: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    # conclusão solicitada pelo inspetor, aguardando o Gestor
    sol_por: Mapped[str | None] = mapped_column(String(20), nullable=True)
    sol_em: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    sol_obs: Mapped[str | None] = mapped_column(Text, nullable=True)

    historico: Mapped[list["Evento"]] = relationship(
        back_populates="demanda", order_by="Evento.em, Evento.id", cascade="all, delete-orphan"
    )
    docs: Mapped[list["Documento"]] = relationship(
        back_populates="demanda", order_by="Documento.em, Documento.id", cascade="all, delete-orphan"
    )


class Evento(Base):
    """Linha do tempo / histórico — só inclusão, nunca edição (rastreabilidade)."""

    __tablename__ = "eventos"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    demanda_id: Mapped[str] = mapped_column(ForeignKey("demandas.id"), index=True)
    tipo: Mapped[str] = mapped_column(String(20))  # criacao status documento observacao reatribuicao edicao conclusao
    por: Mapped[str] = mapped_column(String(20))  # id do usuário ou "sei"
    em: Mapped[datetime] = mapped_column(DateTime)
    texto: Mapped[str] = mapped_column(Text)
    demanda: Mapped[Demanda] = relationship(back_populates="historico")


class Documento(Base):
    __tablename__ = "documentos"
    id: Mapped[str] = mapped_column(String(80), primary_key=True)
    demanda_id: Mapped[str] = mapped_column(ForeignKey("demandas.id"), index=True)
    nome: Mapped[str] = mapped_column(String(200))
    tam: Mapped[int] = mapped_column(Integer)
    por: Mapped[str] = mapped_column(String(20))
    em: Mapped[datetime] = mapped_column(DateTime)
    caminho: Mapped[str | None] = mapped_column(String(300), nullable=True)  # None = registro de exemplo sem arquivo
    demanda: Mapped[Demanda] = relationship(back_populates="docs")
