"""Coordenadas de referência para o Mapa de Demandas.

- Municípios da Região Metropolitana do Recife: centroides calculados a partir dos
  limites municipais do IBGE (frontend/data/rmr_municipios.geojson).
- Bairros do Recife: pontos APROXIMADOS (centro do bairro), suficientes para
  agrupar demandas visualmente. Geocodificação por endereço é evolução futura.
"""

import unicodedata

MUNICIPIOS = {
    "Abreu e Lima": (-7.8794, -35.0184),
    "Araçoiaba": (-7.7929, -35.0759),
    "Cabo de Santo Agostinho": (-8.2690, -35.0848),
    "Camaragibe": (-7.9862, -34.9953),
    "Igarassu": (-7.8175, -34.9600),
    "Ipojuca": (-8.4476, -35.0154),
    "Ilha de Itamaracá": (-7.7593, -34.8548),
    "Itapissuma": (-7.7453, -34.9068),
    "Jaboatão dos Guararapes": (-8.1527, -35.0033),
    "Moreno": (-8.1435, -35.1466),
    "Olinda": (-7.9933, -34.8671),
    "Paulista": (-7.9278, -34.8844),
    "Recife": (-8.0397, -34.9330),
    "São Lourenço da Mata": (-8.0231, -35.1024),
}

BAIRROS_RECIFE = {
    "Afogados": (-8.0760, -34.9100),
    "Água Fria": (-8.0150, -34.8990),
    "Areias": (-8.1000, -34.9300),
    "Barro": (-8.0950, -34.9530),
    "Boa Viagem": (-8.1265, -34.9010),
    "Boa Vista": (-8.0590, -34.8890),
    "Brasília Teimosa": (-8.0870, -34.8780),
    "Campo Grande": (-8.0360, -34.8810),
    "Casa Amarela": (-8.0280, -34.9170),
    "Cidade Universitária": (-8.0510, -34.9510),
    "Cordeiro": (-8.0500, -34.9300),
    "Encruzilhada": (-8.0390, -34.8880),
    "Espinheiro": (-8.0430, -34.8960),
    "Graças": (-8.0460, -34.9030),
    "Ibura": (-8.1180, -34.9420),
    "Imbiribeira": (-8.1090, -34.9130),
    "Iputinga": (-8.0350, -34.9330),
    "Madalena": (-8.0530, -34.9100),
    "Pina": (-8.0890, -34.8850),
    "Recife Antigo": (-8.0630, -34.8710),
    "Santo Amaro": (-8.0460, -34.8800),
    "São José": (-8.0710, -34.8790),
    "Tejipió": (-8.0910, -34.9500),
    "Torre": (-8.0470, -34.9170),
    "Várzea": (-8.0480, -34.9600),
}


def _chave(txt: str) -> str:
    return "".join(c for c in unicodedata.normalize("NFD", txt.lower().strip()) if unicodedata.category(c) != "Mn")


_MUN = {_chave(k): (k, v) for k, v in MUNICIPIOS.items()}
_BAI = {_chave(k): (k, v) for k, v in BAIRROS_RECIFE.items()}


def localizar(municipio: str, bairro: str | None = None) -> dict | None:
    """Devolve {rotulo, lat, lng, nivel} ou None quando o município não é conhecido."""
    mun = _MUN.get(_chave(municipio or ""))
    if not mun:
        return None
    nome_mun, (lat, lng) = mun
    if bairro and nome_mun == "Recife":
        b = _BAI.get(_chave(bairro))
        if b:
            return {"rotulo": f"{b[0]} · Recife", "lat": b[1][0], "lng": b[1][1], "nivel": "bairro"}
    return {"rotulo": nome_mun, "lat": lat, "lng": lng, "nivel": "municipio"}


def bairros_recife() -> list[str]:
    return sorted(BAIRROS_RECIFE)


def municipios() -> list[str]:
    return sorted(MUNICIPIOS)
