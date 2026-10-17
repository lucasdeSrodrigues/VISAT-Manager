"""Regras de negócio puras (sem banco) — fáceis de testar e de explicar.

- Saúde da demanda / Radar de Prazos
- Máquina de estados da Linha do Tempo
- Permissões por perfil
"""

from dataclasses import dataclass
from datetime import date

from . import config
from .models import Etapa, Perfil


class RegraNegocioError(Exception):
    """Violação de regra de negócio (vira HTTP 409/422 na API)."""


class PermissaoNegadaError(Exception):
    """Usuário sem permissão para a ação (vira HTTP 403 na API)."""


# ---------------------------------------------------------------- Saúde / Radar
VENCIDA, URGENTE, ATENCAO, SEGURO, CONCLUIDA = "VENCIDA", "URGENTE", "ATENCAO", "SEGURO", "CONCLUIDA"
FAIXAS_RADAR = (VENCIDA, URGENTE, ATENCAO, SEGURO)


def dias_restantes(prazo: date, hoje: date | None = None) -> int:
    return (prazo - (hoje or date.today())).days


def classificar_prazo(
    prazo: date,
    etapa: Etapa,
    hoje: date | None = None,
    limite_urgente: int | None = None,
    limite_atencao: int | None = None,
) -> str:
    """Classifica a demanda nas faixas do Radar de Prazos (wireframe):
    VENCIDA (<0), URGENTE (0..3), ATENCAO (4..7), SEGURO (>7). Concluídas saem do radar."""
    if etapa == Etapa.CONCLUIDA:
        return CONCLUIDA
    lu = config.LIMITE_URGENTE_DIAS if limite_urgente is None else limite_urgente
    la = config.LIMITE_ATENCAO_DIAS if limite_atencao is None else limite_atencao
    if lu > la:
        raise ValueError("limite_urgente não pode ser maior que limite_atencao")
    d = dias_restantes(prazo, hoje)
    if d < 0:
        return VENCIDA
    if d <= lu:
        return URGENTE
    if d <= la:
        return ATENCAO
    return SEGURO


def texto_prazo(prazo: date, hoje: date | None = None) -> str:
    d = dias_restantes(prazo, hoje)
    if d < 0:
        return f"Venceu há {-d} dia{'s' if d != -1 else ''}"
    if d == 0:
        return "Vence hoje"
    return f"Vence em {d} dia{'s' if d != 1 else ''}"


# ---------------------------------------------------------- Linha do tempo
ORDEM_ETAPAS = list(Etapa)

ROTULO_ETAPA = {
    Etapa.RECEBIDA: "Solicitação recebida",
    Etapa.TRIAGEM: "Triagem",
    Etapa.INSPETOR_DESIGNADO: "Inspetor designado",
    Etapa.INSPECAO_REALIZADA: "Inspeção realizada",
    Etapa.RELATORIO: "Relatório",
    Etapa.CONCLUIDA: "Concluída",
}

# Quem pode levar a demanda PARA cada etapa.
# "RESPONSAVEL" = inspetor designado para a demanda.
QUEM_AVANCA = {
    Etapa.TRIAGEM: {"GESTOR"},
    Etapa.INSPETOR_DESIGNADO: {"GESTOR"},
    Etapa.INSPECAO_REALIZADA: {"GESTOR", "RESPONSAVEL"},
    Etapa.RELATORIO: {"GESTOR", "RESPONSAVEL"},
    Etapa.CONCLUIDA: {"GESTOR"},
}


def proxima_etapa(atual: Etapa) -> Etapa | None:
    i = ORDEM_ETAPAS.index(atual)
    return ORDEM_ETAPAS[i + 1] if i + 1 < len(ORDEM_ETAPAS) else None


@dataclass(frozen=True)
class Ator:
    perfil: Perfil
    eh_responsavel: bool = False

    @property
    def papeis(self) -> set[str]:
        p = {self.perfil.value}
        if self.eh_responsavel:
            p.add("RESPONSAVEL")
        return p


def validar_transicao(atual: Etapa, destino: Etapa, ator: Ator, tem_responsavel: bool) -> None:
    """Garante fluxo sequencial, sem pular etapas, e respeita as permissões por perfil."""
    if atual == Etapa.CONCLUIDA:
        raise RegraNegocioError("Demanda já concluída: não aceita novas etapas.")
    esperado = proxima_etapa(atual)
    if destino != esperado:
        raise RegraNegocioError(
            f"Transição inválida: de '{ROTULO_ETAPA[atual]}' só é possível ir para '{ROTULO_ETAPA[esperado]}'."
        )
    if not (QUEM_AVANCA[destino] & ator.papeis):
        raise PermissaoNegadaError(f"Seu perfil não pode registrar a etapa '{ROTULO_ETAPA[destino]}'.")
    if destino == Etapa.INSPETOR_DESIGNADO and not tem_responsavel:
        raise RegraNegocioError("Atribua um inspetor responsável antes de avançar.")


def etapas_permitidas(atual: Etapa, ator: Ator) -> list[Etapa]:
    """Usado pela interface para mostrar apenas os botões que funcionam."""
    prox = proxima_etapa(atual)
    if prox is None or not (QUEM_AVANCA[prox] & ator.papeis):
        return []
    return [prox]


# ---------------------------------------------------------------- Permissões
def pode_atribuir(perfil: Perfil) -> bool:
    return perfil == Perfil.GESTOR


def pode_sincronizar(perfil: Perfil) -> bool:
    return perfil == Perfil.GESTOR


def pode_ver_demanda(perfil: Perfil, usuario_id: int, responsavel_id: int | None, criado_por_id: int | None) -> bool:
    """Gestor vê tudo; inspetor vê as demandas sob sua responsabilidade ou que ele cadastrou."""
    return perfil == Perfil.GESTOR or usuario_id in (responsavel_id, criado_por_id)
