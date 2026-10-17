"""US06 — Saúde da demanda / Radar de Prazos e US05 — máquina de estados da linha do tempo."""

from datetime import date, timedelta

import pytest

from backend.app.models import Etapa, Perfil
from backend.app.rules import (
    Ator,
    PermissaoNegadaError,
    RegraNegocioError,
    classificar_prazo,
    etapas_permitidas,
    texto_prazo,
    validar_transicao,
)

HOJE = date(2026, 10, 18)


def prazo(d):
    return HOJE + timedelta(days=d)


@pytest.mark.parametrize(
    "dias,esperado",
    [
        (-10, "VENCIDA"),
        (-1, "VENCIDA"),
        (0, "URGENTE"),
        (3, "URGENTE"),  # limite urgente inclusivo
        (4, "ATENCAO"),
        (7, "ATENCAO"),  # limite atenção inclusivo
        (8, "SEGURO"),
        (60, "SEGURO"),
    ],
)
def test_faixas_do_radar(dias, esperado):
    assert classificar_prazo(prazo(dias), Etapa.TRIAGEM, HOJE) == esperado


def test_concluida_sai_do_radar_mesmo_vencida():
    assert classificar_prazo(prazo(-5), Etapa.CONCLUIDA, HOJE) == "CONCLUIDA"


def test_limites_configuraveis():
    assert classificar_prazo(prazo(5), Etapa.RECEBIDA, HOJE, limite_urgente=5, limite_atencao=10) == "URGENTE"


def test_limites_incoerentes_sao_rejeitados():
    with pytest.raises(ValueError):
        classificar_prazo(prazo(5), Etapa.RECEBIDA, HOJE, limite_urgente=10, limite_atencao=5)


def test_texto_prazo():
    assert texto_prazo(prazo(-1), HOJE) == "Venceu há 1 dia"
    assert texto_prazo(prazo(-3), HOJE) == "Venceu há 3 dias"
    assert texto_prazo(prazo(0), HOJE) == "Vence hoje"
    assert texto_prazo(prazo(1), HOJE) == "Vence em 1 dia"


GESTOR = Ator(Perfil.GESTOR)
RESP = Ator(Perfil.INSPETOR, eh_responsavel=True)
OUTRO_INSP = Ator(Perfil.INSPETOR, eh_responsavel=False)


def test_fluxo_completo_respeitando_perfis():
    validar_transicao(Etapa.RECEBIDA, Etapa.TRIAGEM, GESTOR, False)
    validar_transicao(Etapa.TRIAGEM, Etapa.INSPETOR_DESIGNADO, GESTOR, True)
    validar_transicao(Etapa.INSPETOR_DESIGNADO, Etapa.INSPECAO_REALIZADA, RESP, True)
    validar_transicao(Etapa.INSPECAO_REALIZADA, Etapa.RELATORIO, RESP, True)
    validar_transicao(Etapa.RELATORIO, Etapa.CONCLUIDA, GESTOR, True)


def test_nao_pula_etapas():
    with pytest.raises(RegraNegocioError, match="Transição inválida"):
        validar_transicao(Etapa.RECEBIDA, Etapa.INSPECAO_REALIZADA, GESTOR, True)


def test_nao_volta_etapas():
    with pytest.raises(RegraNegocioError):
        validar_transicao(Etapa.RELATORIO, Etapa.TRIAGEM, GESTOR, True)


def test_concluida_e_final():
    with pytest.raises(RegraNegocioError, match="concluída"):
        validar_transicao(Etapa.CONCLUIDA, Etapa.CONCLUIDA, GESTOR, True)


def test_designar_exige_responsavel():
    with pytest.raises(RegraNegocioError, match="responsável"):
        validar_transicao(Etapa.TRIAGEM, Etapa.INSPETOR_DESIGNADO, GESTOR, False)


def test_inspetor_nao_conclui():
    with pytest.raises(PermissaoNegadaError):
        validar_transicao(Etapa.RELATORIO, Etapa.CONCLUIDA, RESP, True)


def test_inspetor_nao_responsavel_nao_registra_inspecao():
    with pytest.raises(PermissaoNegadaError):
        validar_transicao(Etapa.INSPETOR_DESIGNADO, Etapa.INSPECAO_REALIZADA, OUTRO_INSP, True)


def test_etapas_permitidas_alimenta_botoes_da_interface():
    assert etapas_permitidas(Etapa.INSPETOR_DESIGNADO, RESP) == [Etapa.INSPECAO_REALIZADA]
    assert etapas_permitidas(Etapa.RELATORIO, RESP) == []  # só gestor conclui
    assert etapas_permitidas(Etapa.CONCLUIDA, GESTOR) == []
