"""Coletor do SEI (scraper v0): leitura, validação, normalização e idempotência."""

from datetime import date

import pytest
from sqlalchemy import select

from backend.app import config
from backend.app.models import Demanda
from collector.normalizer import RegistroInvalido, mapear_tipo, normalizar
from collector.pipeline import sincronizar
from collector.sources.base import RegistroBruto
from collector.sources.sei_mock import SeiMockSource


def bruto(**kw):
    base = dict(
        numero_processo="00089.000101/2026-04",
        tipo_processo="Vigilância Sanitária: Denúncia",
        especificacao="Denúncia de manipulação inadequada de carnes – Boa Viagem, Recife",
        interessado="Churrascaria Fogo Alto",
        data_autuacao="09/10/2026",
    )
    base.update(kw)
    return RegistroBruto(**base)


def test_normaliza_registro_valido():
    n = normalizar(bruto())
    assert (n.id_sei, n.tipo, n.prioridade) == ("00089.000101/2026-04", "Denúncia", "Alta")
    assert (n.titulo, n.estabelecimento) == ("Denúncia de manipulação inadequada de carnes", "Churrascaria Fogo Alto")
    assert (n.municipio, n.bairro) == ("Recife", "Boa Viagem")
    assert n.autuacao == date(2026, 10, 9)


def test_titulo_com_travessao_e_local_so_municipio():
    n = normalizar(bruto(especificacao="Pedido de licença sanitária – lanchonete – Olinda"))
    assert n.titulo == "Pedido de licença sanitária – lanchonete"
    assert (n.municipio, n.bairro) == ("Olinda", None)


def test_tipos_com_e_sem_acento():
    assert mapear_tipo("VIGILANCIA SANITARIA: INSPECAO DE ROTINA") == "Inspeção de rotina"
    assert mapear_tipo("Vigilância Sanitária: Inspeção") == "Inspeção"


@pytest.mark.parametrize(
    "campo,valor,msg",
    [
        ("numero_processo", "89.123/26", "fora do padrão"),
        ("tipo_processo", "Licitação: Aquisição de Material", "não mapeado"),
        ("especificacao", "Sem local", "sem local"),
        ("especificacao", "Denúncia – Campinas", "fora da Região Metropolitana"),
        ("data_autuacao", "2026-10-09", "data de autuação"),
        ("interessado", "  ", "interessado"),
    ],
    ids=["numero", "tipo", "sem_local", "municipio", "data", "interessado"],
)
def test_rejeita_registros_invalidos(campo, valor, msg):
    with pytest.raises(RegistroInvalido, match=msg):
        normalizar(bruto(**{campo: valor}))


def test_scraper_falha_com_layout_inesperado(tmp_path):
    f = tmp_path / "x.html"
    f.write_text("<html><table id='outra'></table></html>", encoding="utf-8")
    with pytest.raises(ValueError, match="layout"):
        SeiMockSource(f).coletar()


def test_pipeline_importa_e_e_idempotente(seeded):
    fonte = SeiMockSource(config.SEI_EXPORT_PATH)
    r1 = sincronizar(seeded, fonte)
    assert (r1.lidos, r1.novos, r1.duplicados, r1.invalidos) == (10, 8, 0, 2)
    r2 = sincronizar(seeded, fonte)
    assert (r2.novos, r2.duplicados) == (0, 8)
    d = seeded.get(Demanda, r1.ids_novos[0])
    assert (d.origem, d.status, d.responsavel_id) == ("SEI", "Nova", None)
    assert d.historico[0].texto == "Demanda importada do SEI" and d.historico[0].por == "sei"
    total_sei = len(seeded.scalars(select(Demanda).where(Demanda.origem == "SEI")).all())
    assert total_sei == 20 + 8  # 20 do exemplo + 8 importadas
