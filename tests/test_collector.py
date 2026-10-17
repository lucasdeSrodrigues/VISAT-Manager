"""US02 — Sincronização com o SEI (coletor/scraper v0)."""

from datetime import date

import pytest
from sqlalchemy import select

from backend.app import config
from backend.app.models import Demanda, Etapa, Origem, Prioridade, TipoOcorrencia
from collector.normalizer import RegistroInvalido, mapear_tipo, normalizar
from collector.pipeline import sincronizar
from collector.sources.base import RegistroBruto
from collector.sources.sei_mock import SeiMockSource


def bruto(**kw):
    base = dict(
        numero_processo="21000.010231/2026-41",
        tipo_processo="Saúde do Trabalhador: Investigação de Acidente de Trabalho",
        especificacao="Queda de altura – Construtora X Ltda – Recife",
        interessado="Ministério Público do Trabalho",
        data_autuacao="09/10/2026",
    )
    base.update(kw)
    return RegistroBruto(**base)


def test_normaliza_registro_valido():
    n = normalizar(bruto())
    assert n.numero_sei == "21000.010231/2026-41"
    assert n.tipo == TipoOcorrencia.ACIDENTE_GRAVE_FATAL
    assert n.empresa == "Construtora X Ltda"
    assert n.municipio == "Recife"
    assert n.data_entrada == date(2026, 10, 9)
    assert n.prioridade == Prioridade.ALTA  # acidente grave entra como ALTA


def test_especificacao_sem_empresa():
    n = normalizar(bruto(especificacao="Pedido de dados do quadrimestre – Recife"))
    assert n.empresa is None and n.municipio == "Recife"


def test_tipo_ignora_acentos_e_maiusculas():
    assert mapear_tipo("SAUDE DO TRABALHADOR: DENÚNCIA SINDICAL") == TipoOcorrencia.DENUNCIA_SINDICAL


@pytest.mark.parametrize(
    "campo,valor,msg",
    [
        ("numero_processo", "2100.10322/26", "fora do padrão"),
        ("tipo_processo", "Licitação: Compra", "não mapeado"),
        ("data_autuacao", "2026-10-09", "data de autuação"),
        ("especificacao", "Sem separador", "sem município"),
        ("interessado", "  ", "interessado"),
    ],
    ids=["numero_fora_do_padrao", "tipo_nao_mapeado", "data_invalida", "sem_municipio", "sem_interessado"],
)
def test_rejeita_registros_invalidos(campo, valor, msg):
    with pytest.raises(RegistroInvalido, match=msg):
        normalizar(bruto(**{campo: valor}))


def test_scraper_le_exportacao_simulada():
    registros = SeiMockSource(config.SEI_EXPORT_PATH).coletar()
    assert len(registros) == 10
    assert registros[0].numero_processo == "21000.010231/2026-41"


def test_scraper_falha_com_layout_inesperado(tmp_path):
    f = tmp_path / "x.html"
    f.write_text("<html><table id='outra'></table></html>", encoding="utf-8")
    with pytest.raises(ValueError, match="layout"):
        SeiMockSource(f).coletar()


def test_pipeline_grava_e_e_idempotente(db):
    fonte = SeiMockSource(config.SEI_EXPORT_PATH)
    r1 = sincronizar(db, fonte)
    assert (r1.lidos, r1.novos, r1.duplicados, r1.invalidos) == (10, 8, 0, 2)
    r2 = sincronizar(db, fonte)  # rodar de novo não duplica
    assert (r2.novos, r2.duplicados) == (0, 8)
    demandas = db.scalars(select(Demanda)).all()
    assert len(demandas) == 8
    d = demandas[0]
    assert d.origem == Origem.SEI and d.etapa == Etapa.RECEBIDA
    assert d.movimentacoes[0].descricao.startswith("Solicitação recebida via sincronização")
    # prazo padrão por tipo aplicado (premissa configurável)
    assert (d.prazo_legal - d.data_entrada).days == config.PRAZO_PADRAO_DIAS[d.tipo_ocorrencia.value]
