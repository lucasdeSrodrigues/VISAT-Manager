"""Normalização dos registros brutos → formato do VISAT Manager.

Regras:
- Número SEI no padrão NNNNN.NNNNNN/AAAA-DD (validação de formato).
- Tipo do processo SEI → TipoOcorrencia (dicionário de mapeamento).
- Especificação no padrão "Assunto – Empresa – Município" (convenção a combinar com a VISAT).
- Data de autuação dd/mm/aaaa.
"""

import re
import unicodedata
from dataclasses import dataclass
from datetime import date, datetime

from backend.app.models import Prioridade, TipoOcorrencia

from .sources.base import RegistroBruto

PADRAO_SEI = re.compile(r"^\d{5}\.\d{6}/\d{4}-\d{2}$")

MAPA_TIPOS = {
    "requisicao do ministerio publico do trabalho": TipoOcorrencia.REQUISICAO_MPT,
    "requisicao mpt": TipoOcorrencia.REQUISICAO_MPT,
    "denuncia sindical": TipoOcorrencia.DENUNCIA_SINDICAL,
    "demanda do conselho de saude": TipoOcorrencia.DEMANDA_CONSELHO_SAUDE,
    "investigacao de acidente de trabalho": TipoOcorrencia.ACIDENTE_GRAVE_FATAL,
    "investigacao de doenca relacionada ao trabalho": TipoOcorrencia.DOENCA_TRABALHO,
    "inspecao em ambiente de trabalho": TipoOcorrencia.INSPECAO_AMBIENTE,
    "solicitacao de informacao": TipoOcorrencia.SOLICITACAO_INFORMACAO,
}

# Acidentes graves/fatais entram como prioridade ALTA (premissa a validar com a VISAT).
PRIORIDADE_POR_TIPO = {
    TipoOcorrencia.ACIDENTE_GRAVE_FATAL: Prioridade.ALTA,
    TipoOcorrencia.REQUISICAO_MPT: Prioridade.ALTA,
}


class RegistroInvalido(ValueError):
    pass


@dataclass
class DemandaNormalizada:
    numero_sei: str
    tipo: TipoOcorrencia
    orgao: str
    empresa: str | None
    municipio: str
    descricao: str
    data_entrada: date
    prioridade: Prioridade


def _sem_acento(txt: str) -> str:
    return "".join(c for c in unicodedata.normalize("NFD", txt.lower()) if unicodedata.category(c) != "Mn")


def mapear_tipo(tipo_processo: str) -> TipoOcorrencia:
    # SEI usa "Saúde do Trabalhador: <assunto>"
    chave = _sem_acento(tipo_processo.split(":", 1)[-1]).strip()
    for prefixo, tipo in MAPA_TIPOS.items():
        if chave.startswith(prefixo):
            return tipo
    raise RegistroInvalido(f"Tipo de processo não mapeado: '{tipo_processo}'")


def normalizar(r: RegistroBruto) -> DemandaNormalizada:
    numero = r.numero_processo.strip()
    if not PADRAO_SEI.match(numero):
        raise RegistroInvalido(f"Número SEI fora do padrão: '{numero}'")
    tipo = mapear_tipo(r.tipo_processo)
    partes = [p.strip() for p in re.split(r"\s+[–-]\s+", r.especificacao) if p.strip()]
    if len(partes) < 2:
        raise RegistroInvalido(f"{numero}: especificação sem município ('{r.especificacao}')")
    assunto, municipio = partes[0], partes[-1]
    empresa = " – ".join(partes[1:-1]) or None
    try:
        entrada = datetime.strptime(r.data_autuacao.strip(), "%d/%m/%Y").date()
    except ValueError as e:
        raise RegistroInvalido(f"{numero}: data de autuação inválida '{r.data_autuacao}'") from e
    if not r.interessado.strip():
        raise RegistroInvalido(f"{numero}: interessado (órgão demandante) vazio")
    return DemandaNormalizada(
        numero_sei=numero,
        tipo=tipo,
        orgao=r.interessado.strip(),
        empresa=empresa,
        municipio=municipio.title() if municipio.isupper() else municipio,
        descricao=assunto,
        data_entrada=entrada,
        prioridade=PRIORIDADE_POR_TIPO.get(tipo, Prioridade.MEDIA),
    )
