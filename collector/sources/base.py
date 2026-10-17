"""Contrato comum das fontes de demandas.

Qualquer fonte (mock do SEI hoje; API/WebServices do SEI no futuro; planilha) implementa
`FonteDeDemandas.coletar()` e devolve registros BRUTOS. A normalização é separada,
então trocar a fonte não muda o resto do sistema (princípio da arquitetura: separação
de responsabilidades).
"""

from dataclasses import dataclass, field
from typing import Protocol


@dataclass
class RegistroBruto:
    """Registro como veio da fonte — ainda sem validação."""

    numero_processo: str
    tipo_processo: str
    especificacao: str
    interessado: str
    data_autuacao: str
    unidade: str = ""
    extras: dict = field(default_factory=dict)


class FonteDeDemandas(Protocol):
    nome: str

    def coletar(self) -> list[RegistroBruto]: ...
