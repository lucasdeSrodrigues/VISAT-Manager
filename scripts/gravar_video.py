"""Grava o vídeo de demonstração da Sprint 1 (com legendas na tela).

Pré-requisito: servidor em http://localhost:8000 com banco recém-populado.
Uso: python scripts/gravar_video.py   → docs/evidencias/demo_visat_manager.webm
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
    el.style.cssText = 'position:fixed;left:50%;bottom:28px;transform:translateX(-50%);z-index:9999;' +
      'background:rgba(20,23,28,.92);color:#fff;font:600 19px/1.4 system-ui,Segoe UI,sans-serif;' +
      'padding:12px 22px;border-radius:12px;border-left:6px solid #f2c14e;max-width:80%;text-align:center;' +
      'box-shadow:0 8px 30px rgba(0,0,0,.35);transition:opacity .3s';
    document.body.appendChild(el);
  }
  el.textContent = t; el.style.opacity = t ? 1 : 0;
}"""


def legenda(page, texto, espera=2600):
    page.evaluate(LEGENDA_JS, texto)
    page.wait_for_timeout(espera)


def ir(page, hash_, seletor):
    page.goto(f"{BASE}/{hash_}")
    page.wait_for_selector(seletor)
    page.wait_for_timeout(400)


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
        ir(page, "#/login", "#fLogin")
        legenda(page, "VISAT Manager · Sprint 1 — gestão das demandas de Saúde do Trabalhador", 3200)
        legenda(page, "Entrando como Gestora da VISAT", 1600)
        page.click("[data-demo='gestor@visat.demo']")
        page.wait_for_selector(".kpis")
        legenda(page, "Visão geral: recebidas, em andamento, concluídas e vencidas", 3200)
        page.hover(".sino")
        legenda(page, "O sino mostra quantas demandas estão vencidas ou urgentes", 2800)
        legenda(page, "Sincronização com o SEI (coletor)", 1400)
        page.click("#btnSync")
        page.wait_for_selector(".banner")
        page.click(".banner summary")
        legenda(page, "10 processos lidos · 8 importados · 2 rejeitados com o motivo", 3600)
        page.click("#btnSync")
        page.wait_for_selector(".banner")
        page.wait_for_timeout(500)
        legenda(page, "Rodando de novo: nenhuma duplicação (idempotente)", 3000)

        ir(page, "#/radar", ".radar")
        legenda(page, "Radar de prazos: vencidas, urgentes, atenção e prazo seguro", 3200)
        page.mouse.wheel(0, 500)
        legenda(page, "Acidente grave importado do SEI já aparece como vencido", 2800)

        ir(page, "#/demandas?prioridade=ALTA&origem=SEI&abertas=1", ".tabela")
        legenda(page, "Painel central com filtros: prioridade Alta + origem SEI", 3000)

        ir(page, "#/demandas/nova", "#fNova")
        legenda(page, "Cadastro manual para demandas que chegam fora do SEI", 2400)
        page.click("button[type=submit]")
        legenda(page, "Validação dos campos obrigatórios", 2200)
        page.select_option("[name=tipo_ocorrencia]", "DENUNCIA_SINDICAL")
        page.fill("[name=orgao_demandante]", "Sindicato dos Trabalhadores em Panificação")
        page.fill("[name=empresa]", "Panificadora Pão Dourado Ltda")
        page.select_option("[name=prioridade]", "ALTA")
        page.type(
            "[name=descricao]",
            "Calor excessivo no setor de fornos e ausência de pausas para hidratação.",
            delay=18,
        )
        page.click("button[type=submit]")
        page.wait_for_selector(".timeline")
        legenda(page, "Código MAN-AAAA-NNNN e prazo padrão aplicados automaticamente", 3200)
        page.click("#fAvancar button")
        page.wait_for_selector("#fAtribuir")
        legenda(page, "Gestor registra a Triagem…", 2000)
        page.select_option("#fAtribuir select", label="Rodrigo Albuquerque")
        page.click("#fAtribuir button")
        page.wait_for_timeout(700)
        legenda(page, "…e designa o inspetor: tudo fica na linha do tempo", 3200)
        url = page.url

        page.click("#btnSair")
        page.wait_for_selector("#fLogin")
        legenda(page, "Agora como Inspetor", 1400)
        page.click("[data-demo='rodrigo@visat.demo']")
        page.wait_for_selector(".kpis")
        legenda(page, "O inspetor vê apenas as demandas sob sua responsabilidade", 2800)
        page.goto(url)
        page.wait_for_selector("#fAvancar")
        page.fill("#fAvancar input", "Vistoria realizada; 41 °C medidos junto aos fornos.")
        page.click("#fAvancar button")
        page.wait_for_timeout(700)
        page.set_input_files(
            "#arquivo",
            files=[{"name": "termo_de_inspecao.pdf", "mimeType": "application/pdf", "buffer": b"%PDF-1.4 demo"}],
        )
        page.wait_for_timeout(800)
        legenda(page, "Inspeção registrada e termo anexado como evidência", 3000)
        legenda(page, "Concluir é exclusivo do Gestor (validado também na API)", 3000)
        legenda(page, "50 testes automatizados · próximos passos: Sprint 2 (scraper agendado)", 3400)
        legenda(page, "", 400)
        video = page.video
        ctx.close()
        nav.close()
        destino = OUT / "demo_visat_manager.webm"
        Path(video.path()).replace(destino)
    shutil.rmtree(TMP, ignore_errors=True)
    print("Vídeo salvo em", destino)


if __name__ == "__main__":
    main()
