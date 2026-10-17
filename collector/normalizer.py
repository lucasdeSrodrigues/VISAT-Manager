"""Normalização dos registros brutos do SEI → formato de demanda do VISAT Manager.

Regras:
- Número SEI no padrão NNNNN.NNNNNN/AAAA-DD.
- "Tipo do processo" do SEI → um dos TIPOS do sistema.
- Especificação no padrão "Título – Local", sendo Local "Bairro, Município" ou "Município"
  (convenção a combinar com a unidade; o município precisa ser da Região Metropolitana do Recife).
- Interessado = estabelecimento.
- Data de autuação dd/mm/aaaa.
"""

import re
import unicodedata
from dataclasses import dataclass
from datetime import date, datetime

from backend.app import geo

from .sources.base import RegistroBruto

PADRAO_SEI = re.compile(r"^\d{5}\.\d{6}/\d{4}-\d{2}$")

MAPA_TIPOS = {
    "denuncia": "Denúncia",
    "licenciamento": "Licenciamento",
    "inspecao de rotina": "Inspeção de rotina",  # antes de "inspecao" (prefixo mais longo primeiro)
    "inspecao": "Inspeção",
    "reclamacao": "Reclamação",
    "solicitacao de informacao": "Solicitação de informação",
}

# Prioridade inicial por tipo (premissa a validar com a unidade).
PRIORIDADE_POR_TIPO = {
    "Denúncia": "Alta",
    "Reclamação": "Alta",
    "Licenciamento": "Média",
    "Inspeção": "Média",
    "Inspeção de rotina": "Baixa",
    "Solicitação de informação": "Baixa",
}


class RegistroInvalido(ValueError):
    pass


@dataclass
class DemandaNormalizada:
    id_sei: str
    titulo: str
    tipo: str
    estabelecimento: str
    prioridade: str
    municipio: str
    bairro: str | None
    autuacao: date


def _sem_acento(txt: str) -> str:
    return "".join(c for c in unicodedata.normalize("NFD", txt.lower()) if unicodedata.category(c) != "Mn")


def mapear_tipo(tipo_processo: str) -> str:
    # O SEI usa "Vigilância Sanitária: <assunto>"; só aceitamos processos da área.
    if ":" not in tipo_processo or not _sem_acento(tipo_processo.split(":", 1)[0]).strip().startswith("vigilancia"):
        raise RegistroInvalido(f"Tipo de processo não mapeado: '{tipo_processo}'")
    chave = _sem_acento(tipo_processo.split(":", 1)[1]).strip()
    for prefixo, tipo in MAPA_TIPOS.items():
        if chave.startswith(prefixo):
            return tipo
    raise RegistroInvalido(f"Tipo de processo não mapeado: '{tipo_processo}'")


def separar_local(local: str) -> tuple[str, str | None]:
    partes = [p.strip() for p in local.split(",") if p.strip()]
    municipio = partes[-1]
    bairro = partes[0] if len(partes) > 1 else None
    if not geo.localizar(municipio):
        raise RegistroInvalido(f"Município fora da Região Metropolitana do Recife: '{municipio}'")
    return geo.localizar(municipio)["rotulo"], bairro


def normalizar(r: RegistroBruto) -> DemandaNormalizada:
    numero = r.numero_processo.strip()
    if not PADRAO_SEI.match(numero):
        raise RegistroInvalido(f"Número SEI fora do padrão: '{numero}'")
    tipo = mapear_tipo(r.tipo_processo)
    partes = [p.strip() for p in re.split(r"\s+[–-]\s+", r.especificacao) if p.strip()]
    if len(partes) < 2:
        raise RegistroInvalido(f"{numero}: especificação sem local ('{r.especificacao}')")
    titulo = " – ".join(partes[:-1])
    municipio, bairro = separar_local(partes[-1])
    try:
        autuacao = datetime.strptime(r.data_autuacao.strip(), "%d/%m/%Y").date()
    except ValueError as e:
        raise RegistroInvalido(f"{numero}: data de autuação inválida '{r.data_autuacao}'") from e
    if not r.interessado.strip():
        raise RegistroInvalido(f"{numero}: interessado (estabelecimento) vazio")
    return DemandaNormalizada(
        id_sei=numero,
        titulo=titulo[:140],
        tipo=tipo,
        estabelecimento=r.interessado.strip()[:120],
        prioridade=PRIORIDADE_POR_TIPO[tipo],
        municipio=municipio,
        bairro=bairro,
        autuacao=autuacao,
    )
