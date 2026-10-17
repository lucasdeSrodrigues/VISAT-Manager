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

# Prazo padrão de uma demanda cadastrada pelo Inspetor (igual ao protótipo: DIAS_PRAZO_PADRAO).
DIAS_PRAZO_PADRAO = int(os.getenv("VISAT_DIAS_PRAZO_PADRAO", "30"))

# Prazo padrão (dias corridos a partir da autuação) das demandas vindas do SEI, por tipo.
# PREMISSA a validar com a coordenação da VISAT.
PRAZO_SEI_POR_TIPO = {
    "Denúncia": 10,
    "Reclamação": 15,
    "Licenciamento": 30,
    "Inspeção": 20,
    "Inspeção de rotina": 30,
    "Solicitação de informação": 15,
}
