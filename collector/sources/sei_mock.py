"""Fonte SIMULADA do SEI (scraper v0).

Lê uma página HTML que imita a tela "Controle de Processos" do SEI exportada pela
unidade VISAT. É um scraper real (BeautifulSoup) sobre um arquivo local, para que a
equipe desenvolva e teste o pipeline sem acesso ao SEI de produção.

Evolução prevista (Sprint 2+): `SeiWebServiceSource`, usando os WebServices do SEI
mediante autorização formal da Prefeitura do Recife. Basta implementar `coletar()`.
"""

from pathlib import Path

from bs4 import BeautifulSoup

from .base import RegistroBruto

COLUNAS_ESPERADAS = ["Processo", "Tipo", "Especificação", "Interessado", "Autuação", "Unidade"]


class SeiMockSource:
    nome = "SEI (simulado)"

    def __init__(self, caminho: str | Path):
        self.caminho = Path(caminho)

    def coletar(self) -> list[RegistroBruto]:
        if not self.caminho.exists():
            raise FileNotFoundError(f"Exportação do SEI não encontrada: {self.caminho}")
        soup = BeautifulSoup(self.caminho.read_text(encoding="utf-8"), "html.parser")
        tabela = soup.find("table", id="tblProcessosRecebidos")
        if tabela is None:
            raise ValueError("Tabela 'tblProcessosRecebidos' não encontrada — layout do SEI mudou?")
        cab = [th.get_text(strip=True) for th in tabela.find("thead").find_all("th")]
        if cab != COLUNAS_ESPERADAS:
            raise ValueError(f"Colunas inesperadas: {cab}")
        registros = []
        for tr in tabela.find("tbody").find_all("tr"):
            c = [td.get_text(" ", strip=True) for td in tr.find_all("td")]
            if len(c) != len(COLUNAS_ESPERADAS):
                continue  # linha malformada: o normalizador nem chega a vê-la
            registros.append(
                RegistroBruto(
                    numero_processo=c[0],
                    tipo_processo=c[1],
                    especificacao=c[2],
                    interessado=c[3],
                    data_autuacao=c[4],
                    unidade=c[5],
                )
            )
        return registros
