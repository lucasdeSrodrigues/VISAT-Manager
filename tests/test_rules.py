"""Matriz de permissões (PERMS do protótipo) e selo de urgência do prazo — regras puras."""

from datetime import date, timedelta

import pytest

from backend.app.rules import (
    PermissaoNegadaError,
    RegraNegocioError,
    pode_conteudo,
    pode_ver,
    status_permitidos,
    urgencia,
    validar_mudanca_status,
)

HOJE = date(2026, 10, 18)


def prazo(n):
    return HOJE + timedelta(days=n)


def test_gestor_pode_todos_os_status():
    assert "Concluída" in status_permitidos("gestor", "Em andamento")
    assert "Em análise" in status_permitidos("gestor", "Concluída")  # gestor reabre


def test_inspetor_nao_conclui_e_nao_reabre():
    assert "Concluída" not in status_permitidos("inspetor", "Em andamento")
    assert status_permitidos("inspetor", "Concluída") == ()


def test_inspetor_concluir_direto_e_negado_com_o_motivo_do_prototipo():
    with pytest.raises(PermissaoNegadaError, match="Solicitar conclusão"):
        validar_mudanca_status("inspetor", "Em andamento", "Concluída", "feito")


def test_concluir_exige_observacao():
    with pytest.raises(RegraNegocioError, match="obrigatória para concluir"):
        validar_mudanca_status("gestor", "Em andamento", "Concluída", "  ")
    assert validar_mudanca_status("gestor", "Em andamento", "Concluída", "ok") == "concluir"


def test_reabrir_somente_gestor_e_com_motivo():
    with pytest.raises(PermissaoNegadaError, match="reabrir"):
        validar_mudanca_status("inspetor", "Concluída", "Em andamento", "motivo")
    with pytest.raises(RegraNegocioError, match="motivo da reabertura"):
        validar_mudanca_status("gestor", "Concluída", "Em andamento", "")
    assert validar_mudanca_status("gestor", "Concluída", "Em andamento", "faltou laudo") == "reabrir"


def test_mesmo_status_e_status_invalido():
    with pytest.raises(RegraNegocioError, match="já é"):
        validar_mudanca_status("gestor", "Nova", "Nova", None)
    with pytest.raises(RegraNegocioError, match="inválido"):
        validar_mudanca_status("gestor", "Nova", "Arquivada", None)


def test_visibilidade():
    assert pode_ver("gestor", "g1", "i2")
    assert pode_ver("inspetor", "i1", "i1")
    assert not pode_ver("inspetor", "i1", "i2")
    assert not pode_ver("inspetor", "i1", None)


def test_conteudo_somente_nas_proprias_em_aberto():
    assert pode_conteudo("gestor", "g1", "i2", "Concluída")
    assert pode_conteudo("inspetor", "i1", "i1", "Em andamento")
    assert not pode_conteudo("inspetor", "i1", "i1", "Concluída")
    assert not pode_conteudo("inspetor", "i1", "i2", "Em andamento")


@pytest.mark.parametrize(
    "dias,k,texto",
    [
        (-5, "venc", "Vencido há 5 dias"),
        (-1, "venc", "Vencido há 1 dia"),
        (0, "breve", "Vence hoje"),
        (1, "breve", "Vence em 1 dia"),
        (3, "breve", "Vence em 3 dias"),
        (4, "ok", "No prazo"),
    ],
)
def test_selo_de_urgencia_igual_ao_prototipo(dias, k, texto):
    assert urgencia(prazo(dias), "Em andamento", HOJE) == {"k": k, "t": texto}


def test_concluida_nao_tem_urgencia():
    assert urgencia(prazo(-10), "Concluída", HOJE)["k"] == "neutro"
