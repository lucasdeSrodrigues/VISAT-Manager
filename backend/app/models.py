"""Modelo de dados — espelha o item 4.4 (Banco de Dados) da Definição da Arquitetura."""

import enum
from datetime import date, datetime

from sqlalchemy import Date, DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


class Perfil(str, enum.Enum):
    GESTOR = "GESTOR"
    INSPETOR = "INSPETOR"


class Origem(str, enum.Enum):
    SEI = "SEI"
    MANUAL = "MANUAL"


class Prioridade(str, enum.Enum):
    ALTA = "ALTA"
    MEDIA = "MEDIA"
    BAIXA = "BAIXA"


class TipoOcorrencia(str, enum.Enum):
    REQUISICAO_MPT = "REQUISICAO_MPT"
    DENUNCIA_SINDICAL = "DENUNCIA_SINDICAL"
    DEMANDA_CONSELHO_SAUDE = "DEMANDA_CONSELHO_SAUDE"
    ACIDENTE_GRAVE_FATAL = "ACIDENTE_GRAVE_FATAL"
    DOENCA_TRABALHO = "DOENCA_TRABALHO"
    INSPECAO_AMBIENTE = "INSPECAO_AMBIENTE"
    SOLICITACAO_INFORMACAO = "SOLICITACAO_INFORMACAO"


class Etapa(str, enum.Enum):
    """Etapas da Linha do Tempo, na ordem do wireframe 'Detalhe da demanda'."""

    RECEBIDA = "RECEBIDA"
    TRIAGEM = "TRIAGEM"
    INSPETOR_DESIGNADO = "INSPETOR_DESIGNADO"
    INSPECAO_REALIZADA = "INSPECAO_REALIZADA"
    RELATORIO = "RELATORIO"
    CONCLUIDA = "CONCLUIDA"


class Usuario(Base):
    __tablename__ = "usuarios"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    nome: Mapped[str] = mapped_column(String(120))
    email: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    senha_hash: Mapped[str] = mapped_column(String(200))
    perfil: Mapped[Perfil] = mapped_column(Enum(Perfil))
    ativo: Mapped[bool] = mapped_column(default=True)


class Sessao(Base):
    __tablename__ = "sessoes"
    token: Mapped[str] = mapped_column(String(64), primary_key=True)
    usuario_id: Mapped[int] = mapped_column(ForeignKey("usuarios.id"))
    expira_em: Mapped[datetime] = mapped_column(DateTime)
    usuario: Mapped[Usuario] = relationship()


class Demanda(Base):
    __tablename__ = "demandas"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    codigo: Mapped[str] = mapped_column(String(40), unique=True, index=True)
    origem: Mapped[Origem] = mapped_column(Enum(Origem))
    numero_sei: Mapped[str | None] = mapped_column(String(40), unique=True, nullable=True)
    tipo_ocorrencia: Mapped[TipoOcorrencia] = mapped_column(Enum(TipoOcorrencia))
    orgao_demandante: Mapped[str] = mapped_column(String(160))
    municipio: Mapped[str] = mapped_column(String(80), index=True)
    empresa: Mapped[str | None] = mapped_column(String(160), nullable=True)
    ramo_atividade: Mapped[str | None] = mapped_column(String(120), nullable=True)
    descricao: Mapped[str] = mapped_column(Text, default="")
    prioridade: Mapped[Prioridade] = mapped_column(Enum(Prioridade), default=Prioridade.MEDIA)
    etapa: Mapped[Etapa] = mapped_column(Enum(Etapa), default=Etapa.RECEBIDA, index=True)
    data_entrada: Mapped[date] = mapped_column(Date)
    prazo_legal: Mapped[date] = mapped_column(Date, index=True)
    concluida_em: Mapped[date | None] = mapped_column(Date, nullable=True)
    responsavel_id: Mapped[int | None] = mapped_column(ForeignKey("usuarios.id"), nullable=True)
    criado_por_id: Mapped[int | None] = mapped_column(ForeignKey("usuarios.id"), nullable=True)

    responsavel: Mapped[Usuario | None] = relationship(foreign_keys=[responsavel_id])
    movimentacoes: Mapped[list["Movimentacao"]] = relationship(
        back_populates="demanda", order_by="Movimentacao.id", cascade="all, delete-orphan"
    )
    documentos: Mapped[list["Documento"]] = relationship(
        back_populates="demanda", order_by="Documento.id", cascade="all, delete-orphan"
    )


class Movimentacao(Base):
    """Registro imutável do histórico — base da rastreabilidade."""

    __tablename__ = "movimentacoes"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    demanda_id: Mapped[int] = mapped_column(ForeignKey("demandas.id"), index=True)
    etapa: Mapped[Etapa | None] = mapped_column(Enum(Etapa), nullable=True)  # None = observação
    descricao: Mapped[str] = mapped_column(Text)
    autor_id: Mapped[int | None] = mapped_column(ForeignKey("usuarios.id"), nullable=True)  # None = sistema
    criada_em: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)

    demanda: Mapped[Demanda] = relationship(back_populates="movimentacoes")
    autor: Mapped[Usuario | None] = relationship()


class Documento(Base):
    __tablename__ = "documentos"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    demanda_id: Mapped[int] = mapped_column(ForeignKey("demandas.id"), index=True)
    nome: Mapped[str] = mapped_column(String(200))
    caminho: Mapped[str] = mapped_column(String(300))
    tamanho: Mapped[int] = mapped_column(Integer)
    autor_id: Mapped[int | None] = mapped_column(ForeignKey("usuarios.id"), nullable=True)
    criado_em: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)

    demanda: Mapped[Demanda] = relationship(back_populates="documentos")
    autor: Mapped[Usuario | None] = relationship()
