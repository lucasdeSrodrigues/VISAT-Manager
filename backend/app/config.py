"""Configurações centrais do VISAT Manager.

Todos os valores podem ser sobrescritos por variáveis de ambiente (ver .env.example).
"""

import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[2]

DATABASE_URL = os.getenv("VISAT_DATABASE_URL", f"sqlite:///{BASE_DIR / 'visat.db'}")
UPLOAD_DIR = Path(os.getenv("VISAT_UPLOAD_DIR", BASE_DIR / "uploads"))
SEI_EXPORT_PATH = Path(os.getenv("VISAT_SEI_EXPORT", BASE_DIR / "collector" / "data" / "sei_export.html"))
TOKEN_HORAS = int(os.getenv("VISAT_TOKEN_HORAS", "8"))

# Faixas do Radar de Prazos / Saúde da demanda (dias restantes até o prazo legal).
# vencida: < 0 | urgente: 0..URGENTE | atenção: URGENTE+1..ATENCAO | seguro: > ATENCAO
LIMITE_URGENTE_DIAS = int(os.getenv("VISAT_LIMITE_URGENTE", "3"))
LIMITE_ATENCAO_DIAS = int(os.getenv("VISAT_LIMITE_ATENCAO", "7"))

# Prazo padrão (dias corridos) por tipo de ocorrência, usado quando a fonte não
# informa prazo. PREMISSA: valores a validar com a coordenação da VISAT (Sprint 5).
PRAZO_PADRAO_DIAS = {
    "ACIDENTE_GRAVE_FATAL": 7,
    "REQUISICAO_MPT": 15,
    "DENUNCIA_SINDICAL": 15,
    "DEMANDA_CONSELHO_SAUDE": 20,
    "DOENCA_TRABALHO": 30,
    "INSPECAO_AMBIENTE": 30,
    "SOLICITACAO_INFORMACAO": 10,
}
