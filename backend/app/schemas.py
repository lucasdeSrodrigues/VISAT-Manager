from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator

from .models import Etapa, Origem, Perfil, Prioridade, TipoOcorrencia


class LoginIn(BaseModel):
    email: str
    senha: str


class UsuarioOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    nome: str
    email: str
    perfil: Perfil


class LoginOut(BaseModel):
    token: str
    usuario: UsuarioOut


class DemandaCriar(BaseModel):
    """Cadastro manual (item 4.6 da arquitetura)."""

    tipo_ocorrencia: TipoOcorrencia
    orgao_demandante: str = Field(min_length=3, max_length=160)
    municipio: str = Field(min_length=2, max_length=80)
    empresa: str | None = Field(default=None, max_length=160)
    ramo_atividade: str | None = Field(default=None, max_length=120)
    descricao: str = Field(min_length=10, max_length=4000)
    prioridade: Prioridade = Prioridade.MEDIA
    data_entrada: date | None = None
    prazo_legal: date | None = None  # se vazio, usa o prazo padrão do tipo

    @field_validator("orgao_demandante", "municipio", "empresa", "ramo_atividade", "descricao")
    @classmethod
    def limpar(cls, v):
        return v.strip() if isinstance(v, str) else v

    @field_validator("prazo_legal")
    @classmethod
    def prazo_coerente(cls, v, info):
        entrada = info.data.get("data_entrada") or date.today()
        if v is not None and v < entrada:
            raise ValueError("O prazo legal não pode ser anterior à data de entrada.")
        return v


class DemandaEditar(BaseModel):
    prioridade: Prioridade | None = None
    prazo_legal: date | None = None
    municipio: str | None = Field(default=None, min_length=2, max_length=80)
    empresa: str | None = Field(default=None, max_length=160)


class AtribuirIn(BaseModel):
    responsavel_id: int


class AvancarIn(BaseModel):
    etapa: Etapa
    descricao: str = Field(default="", max_length=2000)


class ObservacaoIn(BaseModel):
    descricao: str = Field(min_length=3, max_length=2000)


class MovimentacaoOut(BaseModel):
    id: int
    etapa: Etapa | None
    rotulo: str
    descricao: str
    autor: str
    criada_em: datetime


class DocumentoOut(BaseModel):
    id: int
    nome: str
    tamanho: int
    autor: str
    criado_em: datetime


class DemandaResumo(BaseModel):
    id: int
    codigo: str
    origem: Origem
    tipo_ocorrencia: TipoOcorrencia
    orgao_demandante: str
    municipio: str
    empresa: str | None
    prioridade: Prioridade
    etapa: Etapa
    etapa_rotulo: str
    data_entrada: date
    prazo_legal: date
    dias_restantes: int
    saude: str
    prazo_texto: str
    responsavel: UsuarioOut | None


class DemandaDetalhe(DemandaResumo):
    numero_sei: str | None
    ramo_atividade: str | None
    descricao: str
    concluida_em: date | None
    movimentacoes: list[MovimentacaoOut]
    documentos: list[DocumentoOut]
    etapas_permitidas: list[Etapa]
    pode_atribuir: bool


class Pagina(BaseModel):
    itens: list[DemandaResumo]
    total: int
    pagina: int
    por_pagina: int


class SyncOut(BaseModel):
    lidos: int
    novos: int
    duplicados: int
    invalidos: int
    erros: list[str]
    codigos_novos: list[str]
