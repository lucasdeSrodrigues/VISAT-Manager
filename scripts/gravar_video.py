"""Grava o vídeo de demonstração (com legendas na tela) percorrendo os fluxos principais.

Pré-requisito: servidor em http://localhost:8000 com banco recém-criado (python -m backend.app.seed).
Uso: python scripts/gravar_video.py  → docs/evidencias/demo_visat_manager.webm
"""

import shutil
from pathlib import Path

from playwright.sync_api import sync_playwright

BASE = "http://localhost:8000"
OUT = Path(__file__).resolve().parents[1] / "docs" / "evidencias"
TMP = OUT / "_video_tmp"

LEGENDA_JS = """(t) => {
  let el = document.getElementById('__legenda');
  if (!el) {
    el = document.createElement('div'); el.id = '__legenda';
    el.style.cssText = 'position:fixed;left:50%;bottom:26px;transform:translateX(-50%);' +
      'z-index:9999;pointer-events:none;' +
      'background:rgba(16,32,58,.94);color:#fff;font:600 19px/1.4 system-ui,Segoe UI,sans-serif;' +
      'padding:12px 22px;border-radius:12px;border-left:6px solid #f59e0b;max-width:80%;text-align:center;' +
      'box-shadow:0 8px 30px rgba(0,0,0,.35)';
    document.body.appendChild(el);
  }
  el.textContent = t; el.style.display = t ? 'block' : 'none';
}"""


def legenda(page, texto, espera=2600):
    page.evaluate(LEGENDA_JS, texto)
    page.wait_for_timeout(espera)


def main():
    shutil.rmtree(TMP, ignore_errors=True)
    with sync_playwright() as p:
        nav = p.chromium.launch()
        ctx = nav.new_context(
            viewport={"width": 1280, "height": 720},
            record_video_dir=str(TMP),
            record_video_size={"width": 1280, "height": 720},
            locale="pt-BR",
        )
        page = ctx.new_page()
        page.goto(f"{BASE}/#/login")
        page.wait_for_selector("#form-login")
        legenda(page, "VISAT Manager · Sprint 1 — o protótipo agora com servidor e banco de dados", 3200)
        page.type("#l-user", "marina.albuquerque", delay=25)
        page.type("#l-pass", "demo", delay=25)
        page.click("#form-login button[type=submit]")
        page.wait_for_selector(".kpis")
        page.evaluate("document.getElementById('toast').innerHTML=''")
        legenda(page, "Dashboard do Gestor: em aberto, sem responsável, vencidas e conclusões a aprovar", 3400)
        page.click("[data-action='sincronizar']")
        page.wait_for_selector("#toast .toast")
        legenda(page, "Sincronização com o SEI: o coletor lê os processos, valida e importa", 3600)

        page.goto(f"{BASE}/#/lista")
        page.wait_for_selector(".tabela")
        page.select_option("#f-resp", "none")
        page.wait_for_timeout(500)
        legenda(page, "Demandas importadas chegam sem responsável", 2200)
        for cb in page.query_selector_all("[data-check='linha']")[:3]:
            cb.check()
            page.wait_for_timeout(250)
        page.click("[data-action='atribuirLote']")
        page.select_option("#m-resp", "i3")
        legenda(page, "Atribuição em lote a um inspetor", 2000)
        page.click(".modal [data-m='ok']")
        page.wait_for_timeout(1200)

        page.goto(f"{BASE}/#/nova")
        page.wait_for_selector("#form-nova")
        legenda(page, "Cadastro manual, para o que chega fora do SEI", 1800)
        page.type("#n-titulo", "Denúncia de fumaça e odor em cozinha de restaurante", delay=12)
        page.fill("#n-estab", "Restaurante Maré Alta")
        page.fill("#n-bairro", "Boa Viagem")
        page.select_option("#n-resp", "i1")
        page.select_option("#n-prior", "Alta")
        page.click("button[data-destino='detalhes']")
        page.wait_for_selector("#h-info")
        legenda(page, "Número MAN-AAAA-NNNN e linha do tempo registrados no banco", 3000)
        url = page.url

        page.select_option("#troca", "i1")
        page.wait_for_timeout(1200)
        page.goto(url)
        page.wait_for_selector("#h-info")
        legenda(page, "Agora como Inspetor: ele só vê as demandas dele", 2600)
        page.select_option("#g-status", "Em andamento")
        page.click("[data-action='atualizarStatus']")
        page.wait_for_timeout(900)
        page.click("[data-action='solicitarConclusao']")
        page.type("#m-obs", "Vistoria realizada: coifa instalada e limpeza comprovada.", delay=12)
        legenda(page, "O inspetor não conclui: solicita a conclusão ao Gestor", 2400)
        page.click(".modal [data-m='ok']")
        page.wait_for_timeout(1400)

        page.select_option("#troca", "g1")
        page.wait_for_timeout(1000)
        page.goto(f"{BASE}/#/dashboard")
        page.wait_for_selector("#h-aprov")
        legenda(page, "O Gestor vê a solicitação e aprova", 2400)
        page.query_selector_all("[data-action='aprovar']")[0].click()
        page.wait_for_timeout(800)
        page.click(".modal [data-m='ok']")
        page.wait_for_timeout(1200)

        page.goto(f"{BASE}/#/mapa")
        page.wait_for_selector(".pino")
        legenda(page, "Mapa de demandas: por bairro do Recife e por município da RMR", 3200)
        page.select_option("#m-prazo", "vencidas")
        page.wait_for_timeout(600)
        page.click("#mapa-locais li.item")
        legenda(page, "Filtro de vencidas: onde agir primeiro", 3000)

        page.goto(f"{BASE}/#/relatorios")
        page.wait_for_selector(".graf")
        legenda(page, "Relatórios por período, com exportação em CSV e PDF", 3200)
        legenda(page, "44 testes automatizados · próximo passo: Sprint 2 (sincronização agendada)", 3400)
        legenda(page, "", 300)
        video = page.video
        ctx.close()
        nav.close()
        destino = OUT / "demo_visat_manager.webm"
        Path(video.path()).replace(destino)
    shutil.rmtree(TMP, ignore_errors=True)
    print("Vídeo salvo em", destino)


if __name__ == "__main__":
    main()
