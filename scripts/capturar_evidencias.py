"""Gera as evidências de funcionamento (prints) percorrendo a interface no navegador.

Pré-requisito: servidor em http://localhost:8000 com banco recém-criado
(python -m backend.app.seed). Uso: python scripts/capturar_evidencias.py
Requer: pip install playwright && playwright install chromium
"""

import shutil
import subprocess
import sys
from pathlib import Path
from urllib.parse import quote

from playwright.sync_api import sync_playwright

BASE = "http://localhost:8000"
OUT = Path(__file__).resolve().parents[1] / "docs" / "evidencias"
OUT.mkdir(parents=True, exist_ok=True)
erros = []


def foto_exemplo() -> bytes:
    """Imagem de exemplo para o anexo (simula a foto de uma vistoria)."""
    from io import BytesIO

    from PIL import Image, ImageDraw

    img = Image.new("RGB", (640, 400), "#dfe6ee")
    d = ImageDraw.Draw(img)
    d.rectangle([40, 60, 600, 300], outline="#14305a", width=4)
    d.rectangle([70, 90, 260, 270], fill="#b8c4d3")
    d.rectangle([300, 90, 570, 160], fill="#c9d3df")
    d.text((70, 320), "Foto da vistoria - exemplo (dados ficticios)", fill="#14305a")
    buf = BytesIO()
    img.save(buf, "PNG")
    return buf.getvalue()


def shot(page, nome, alto=False, toast=True):
    page.wait_for_timeout(350)
    if not toast:
        page.evaluate("document.getElementById('toast').innerHTML=''")
    vp = page.viewport_size
    if alto:  # janela do tamanho da página, sem repetir a barra fixa
        h = page.evaluate("document.documentElement.scrollHeight")
        page.set_viewport_size({"width": vp["width"], "height": max(vp["height"], h)})
        page.wait_for_timeout(250)
    page.screenshot(path=str(OUT / f"{nome}.png"))
    if alto:
        page.set_viewport_size(vp)
    print("  ✓", nome)


def ir(page, hash_, seletor):
    page.goto(f"{BASE}/{hash_}")
    page.wait_for_selector(seletor)
    page.wait_for_timeout(300)


def trocar(page, perfil):
    page.select_option("#troca", perfil)
    page.wait_for_selector("#toast .toast")
    page.wait_for_timeout(500)


def modal_ok(page):
    page.click(".modal [data-m='ok']")
    page.wait_for_selector(".modal", state="detached")
    page.wait_for_timeout(500)


with sync_playwright() as p:
    nav = p.chromium.launch()
    ctx = nav.new_context(viewport={"width": 1440, "height": 900}, locale="pt-BR", accept_downloads=True)
    page = ctx.new_page()
    page.on("pageerror", lambda e: erros.append(str(e)))
    page.on(
        "console",
        lambda m: m.type == "error" and "openstreetmap" not in m.text and "ERR_" not in m.text and erros.append(m.text),
    )

    ir(page, "#/login", "#form-login")
    shot(page, "01_login")
    page.fill("#l-user", "marina.albuquerque")
    page.fill("#l-pass", "demo")
    page.click("#form-login button[type=submit]")
    page.wait_for_selector(".kpis")
    shot(page, "02_dashboard_gestor", toast=False)

    page.click("[data-action='sincronizar']")
    page.wait_for_selector("#toast .toast")
    page.wait_for_timeout(600)
    shot(page, "03_sincronizacao_sei")

    ir(page, "#/lista", ".tabela")
    shot(page, "04_lista_demandas", alto=True, toast=False)
    page.select_option("#f-prazo", "vencidas")
    page.wait_for_timeout(400)
    shot(page, "05_lista_filtrada_vencidas", toast=False)

    page.click("[data-action='limparFiltros']")
    page.select_option("#f-resp", "none")
    page.wait_for_timeout(400)
    for cb in page.query_selector_all("[data-check='linha']")[:3]:
        cb.check()
    page.click("[data-action='atribuirLote']")
    page.select_option("#m-resp", "i3")
    shot(page, "06_atribuicao_em_lote", toast=False)
    modal_ok(page)

    ir(page, "#/nova", "#form-nova")
    page.fill("#n-titulo", "Denúncia de fumaça e odor em cozinha de restaurante")
    page.select_option("#n-tipo", "Denúncia")
    page.fill("#n-estab", "Restaurante Maré Alta")
    page.select_option("#n-mun", "Recife")
    page.fill("#n-bairro", "Boa Viagem")
    page.select_option("#n-resp", "i1")
    page.select_option("#n-prior", "Alta")
    page.fill("#n-desc", "Moradores relatam fumaça e odor forte vindos da cozinha, sem coifa aparente.")
    shot(page, "07_nova_demanda", toast=False)
    page.click("button[data-destino='detalhes']")
    page.wait_for_selector("#h-info")
    shot(page, "08_detalhe_demanda", alto=True)
    nova_url = page.url

    trocar(page, "i1")
    ir(page, "#/dashboard", ".kpis")
    shot(page, "09_painel_inspetor", toast=False)
    page.goto(nova_url)
    page.wait_for_selector("#h-info")
    page.select_option("#g-status", "Em andamento")
    page.click("[data-action='atualizarStatus']")
    page.wait_for_timeout(700)
    page.click("[data-action='anexar']")
    page.set_input_files(
        "#m-arq", files=[{"name": "foto_vistoria.png", "mimeType": "image/png", "buffer": foto_exemplo()}]
    )
    modal_ok(page)
    page.query_selector_all("[data-action='previa']")[-1].click()
    page.wait_for_selector(".modal .previa-real")
    shot(page, "10_inspetor_anexo_real", toast=False)
    page.click(".modal [data-m='cancel']")
    page.click("[data-action='solicitarConclusao']")
    page.fill("#m-obs", "Vistoria realizada: coifa instalada e limpeza comprovada por foto.")
    shot(page, "11_inspetor_solicita_conclusao", toast=False)
    modal_ok(page)
    shot(page, "12_detalhe_com_linha_do_tempo", alto=True)

    trocar(page, "g1")
    ir(page, "#/dashboard", "#h-aprov")
    page.query_selector_all("[data-action='aprovar']")[0].click()
    shot(page, "13_gestor_aprova_conclusao", toast=False)
    page.click(".modal [data-m='cancel']")

    ir(page, "#/mapa", ".pino")
    page.wait_for_timeout(900)
    shot(page, "14_mapa_de_demandas", toast=False)
    page.select_option("#m-prazo", "vencidas")
    page.wait_for_timeout(500)
    page.click("#mapa-locais li.item")
    page.wait_for_timeout(700)
    shot(page, "15_mapa_vencidas", toast=False)

    ir(page, "#/relatorios", ".graf")
    page.check("input[name='periodo'][value='90']", force=True)
    page.wait_for_timeout(500)
    shot(page, "16_relatorios", alto=True, toast=False)
    with page.expect_download() as dl:
        page.click("[data-action='pdfPeriodo']")
    pdf = OUT / "_relatorio.pdf"
    dl.value.save_as(pdf)
    if shutil.which("pdftoppm"):
        subprocess.run(
            [
                "pdftoppm",
                "-png",
                "-r",
                "80",
                "-f",
                "1",
                "-l",
                "1",
                "-singlefile",
                str(pdf),
                str(OUT / "17_relatorio_pdf"),
            ],
            check=True,
        )
        print("  ✓ 17_relatorio_pdf")
    pdf.unlink()

    primeira = page.evaluate("estado.demandas.find(d => d.docs.length && d.historico.length > 4).id")
    ir(page, f"#/demanda/{quote(primeira, safe='')}", "#h-info")
    with page.expect_download() as dl:
        page.click("[data-action='pdfDemanda']")
    pdf = OUT / "_demanda.pdf"
    dl.value.save_as(pdf)
    if shutil.which("pdftoppm"):
        subprocess.run(
            [
                "pdftoppm",
                "-png",
                "-r",
                "80",
                "-f",
                "1",
                "-l",
                "1",
                "-singlefile",
                str(pdf),
                str(OUT / "18_relatorio_demanda_pdf"),
            ],
            check=True,
        )
        print("  ✓ 18_relatorio_demanda_pdf")
    pdf.unlink()

    ir(page, "#/equipe", "[data-action='verDoInspetor']")
    shot(page, "19_equipe", toast=False)

    m = nav.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2, locale="pt-BR").new_page()
    m.on("pageerror", lambda e: erros.append(str(e)))
    m.goto(f"{BASE}/#/login")
    m.wait_for_selector("#form-login")
    m.fill("#l-user", "marina")
    m.fill("#l-pass", "demo")
    m.click("#form-login button[type=submit]")
    m.wait_for_selector(".kpis")
    shot(m, "20_mobile", toast=False)
    nav.close()

print("Erros no console:", erros or "nenhum")
sys.exit(1 if erros else 0)
