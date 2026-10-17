"""Gera as evidências de funcionamento (prints) percorrendo o fluxo da Sprint 1.

Pré-requisito: servidor rodando em http://localhost:8000 com banco recém-populado
(python -m backend.app.seed). Uso: python scripts/capturar_evidencias.py
"""

import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

BASE = "http://localhost:8000"
OUT = Path(__file__).resolve().parents[1] / "docs" / "evidencias"
OUT.mkdir(parents=True, exist_ok=True)
erros = []


def shot(page, nome, full=False, toasts=False):
    page.wait_for_timeout(350)
    if not toasts:  # avisos de ações anteriores não fazem parte desta cena
        page.evaluate("document.getElementById('toasts') && (document.getElementById('toasts').innerHTML = '')")
    vp = page.viewport_size
    if full:  # aumenta a janela em vez de full_page, para o cabeçalho fixo não se repetir
        altura = page.evaluate("document.documentElement.scrollHeight")
        page.set_viewport_size({"width": vp["width"], "height": max(vp["height"], altura)})
        page.wait_for_timeout(250)
    page.screenshot(path=str(OUT / f"{nome}.png"))
    if full:
        page.set_viewport_size(vp)
    print("  ✓", nome)


def entrar(page, quem):
    page.goto(f"{BASE}/#/login")
    page.click(f"[data-demo='{quem}']")
    page.wait_for_selector(".kpis")


with sync_playwright() as p:
    nav = p.chromium.launch()
    ctx = nav.new_context(viewport={"width": 1440, "height": 900}, device_scale_factor=1, locale="pt-BR")
    page = ctx.new_page()
    page.on("console", lambda m: m.type == "error" and erros.append(m.text))
    page.on("pageerror", lambda e: erros.append(str(e)))

    page.goto(f"{BASE}/#/login")
    page.wait_for_selector("#fLogin")
    shot(page, "01_login")
    entrar(page, "gestor@visat.demo")
    shot(page, "02_dashboard_gestor")
    page.click("#btnSync")
    page.wait_for_selector(".banner")
    page.click(".banner summary")
    shot(page, "03_sincronizacao_sei", toasts=True)
    page.goto(f"{BASE}/#/demandas")
    page.wait_for_selector(".tabela")
    shot(page, "04_lista_demandas", full=True)
    page.goto(f"{BASE}/#/demandas?prioridade=ALTA&origem=SEI&abertas=1")
    page.wait_for_selector(".tabela")
    shot(page, "05_lista_filtrada")

    page.goto(f"{BASE}/#/demandas/nova")
    page.wait_for_selector("#fNova")
    page.click("button[type=submit]")
    shot(page, "06a_cadastro_validacao")
    page.select_option("[name=tipo_ocorrencia]", "DENUNCIA_SINDICAL")
    page.fill("[name=orgao_demandante]", "Sindicato dos Trabalhadores em Panificação")
    page.fill("[name=empresa]", "Panificadora Pão Dourado Ltda")
    page.fill("[name=ramo_atividade]", "Panificação")
    page.select_option("[name=prioridade]", "ALTA")
    page.fill(
        "[name=descricao]", "Denúncia de calor excessivo no setor de fornos e ausência de pausas para hidratação."
    )
    shot(page, "06b_cadastro_preenchido")
    page.click("button[type=submit]")
    page.wait_for_selector(".timeline")
    shot(page, "07_detalhe_recem_cadastrada", full=True, toasts=True)
    page.click("#fAvancar button")
    page.wait_for_selector("#fAtribuir")
    page.wait_for_timeout(300)
    page.select_option("#fAtribuir select", label="Rodrigo Albuquerque")
    page.click("#fAtribuir button")
    page.wait_for_timeout(600)
    shot(page, "08_detalhe_triagem_e_designacao", full=True, toasts=True)
    url_nova = page.url

    page.click("#btnSair")
    page.wait_for_selector("#fLogin")
    entrar(page, "rodrigo@visat.demo")
    shot(page, "09_dashboard_inspetor")
    page.goto(url_nova)
    page.wait_for_selector("#fAvancar")
    page.fill("#fAvancar input", "Vistoria realizada; medição de temperatura de 41 °C junto aos fornos.")
    page.click("#fAvancar button")
    page.wait_for_timeout(600)
    page.set_input_files(
        "#arquivo",
        files=[{"name": "termo_de_inspecao.pdf", "mimeType": "application/pdf", "buffer": b"%PDF-1.4 termo ficticio"}],
    )
    page.wait_for_timeout(800)
    shot(page, "10_inspetor_registra_inspecao_e_anexa", full=True, toasts=True)
    page.goto(f"{BASE}/#/radar")
    page.wait_for_selector(".radar")
    shot(page, "11_radar_inspetor")

    page.click("#btnSair")
    page.wait_for_selector("#fLogin")
    entrar(page, "gestor@visat.demo")
    page.goto(f"{BASE}/#/radar")
    page.wait_for_selector(".radar")
    shot(page, "12_radar_de_prazos_gestor", full=True)
    page.goto(f"{BASE}/#/inspetores")
    page.wait_for_selector(".tabela")
    shot(page, "13_inspetores_carga")
    try:  # o Swagger UI carrega JS de CDN; sem internet, o print é pulado
        page.goto(f"{BASE}/docs")
        page.wait_for_selector(".swagger-ui .opblock", timeout=8000)
        shot(page, "17_api_swagger")
    except Exception:
        print("  - 17_api_swagger pulado (sem acesso à CDN do Swagger UI)")

    m = nav.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2, locale="pt-BR").new_page()
    m.on("pageerror", lambda e: erros.append(str(e)))
    entrar(m, "gestor@visat.demo")
    shot(m, "14_mobile_dashboard")
    nav.close()

print("Erros no console:", erros or "nenhum")
sys.exit(1 if erros else 0)
