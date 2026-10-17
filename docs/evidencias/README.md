# Evidências de funcionamento — Sprint 1

Prints gerados por `scripts/capturar_evidencias.py`, que percorre a interface no navegador (Playwright) com o banco de demonstração. **Todos os dados são fictícios.**

| # | Print | O que comprova | História |
|---|---|---|---|
| 01 | [Login](01_login.png) | Mesma tela do protótipo, perfis vindos do servidor | US01 |
| 02 | [Dashboard do Gestor](02_dashboard_gestor.png) | KPIs, conclusões a aprovar, carga por inspetor | US08 |
| 03 | [Sincronização SEI](03_sincronizacao_sei.png) | 8 importadas, 2 rejeitadas na validação | US02 |
| 04 | [Lista](04_lista_demandas.png) | Demandas do SEI e manuais no mesmo fluxo | US04 |
| 05 | [Lista filtrada](05_lista_filtrada_vencidas.png) | Filtro de prazo "Vencidas" com chip | US04 · US07 |
| 06 | [Atribuição em lote](06_atribuicao_em_lote.png) | 3 demandas sem responsável atribuídas de uma vez | US09 |
| 07 | [Nova demanda](07_nova_demanda.png) | Cadastro manual com município e bairro | US03 |
| 08 | [Detalhe](08_detalhe_demanda.png) | Número MAN-AAAA-NNNN, histórico e botão de PDF | US05 |
| 09 | [Painel do Inspetor](09_painel_inspetor.png) | Inspetor vê só as próprias demandas | US01 · US08 |
| 10 | [Anexo real](10_inspetor_anexo_real.png) | Arquivo enviado e pré-visualizado | US10 |
| 11 | [Solicitar conclusão](11_inspetor_solicita_conclusao.png) | Inspetor não conclui: solicita ao Gestor | US06 |
| 12 | [Linha do tempo](12_detalhe_com_linha_do_tempo.png) | Cada ação com autor, data e hora | US05 · US06 |
| 13 | [Aprovar conclusão](13_gestor_aprova_conclusao.png) | Gestor aprova pelo dashboard | US06 |
| 14 | [Mapa](14_mapa_de_demandas.png) | Demandas por bairro/município da RMR | US11 |
| 15 | [Mapa · vencidas](15_mapa_vencidas.png) | Filtro de vencidas e detalhe do local | US11 · US07 |
| 16 | [Relatórios](16_relatorios.png) | Indicadores de 90 dias, CSV e PDF | US12 |
| 17 | [PDF do período](17_relatorio_pdf.png) | Relatório gerencial em PDF | US12 |
| 18 | [PDF da demanda](18_relatorio_demanda_pdf.png) | Ficha, linha do tempo e documentos | US12 |
| 19 | [Equipe](19_equipe.png) | Carga por inspetor | US13 |
| 20 | [Celular](20_mobile.png) | Layout responsivo (390 px) | — |
| 21 | [Coletor no terminal](21_coletor_terminal.png) | `python -m collector.run`: importa e é idempotente | US02 |
| 22 | [Testes](22_testes.png) | 44 testes passando + lint sem erros | DoD |

Vídeo da demo: [demo_visat_manager.mp4](demo_visat_manager.mp4)

Na apresentação, com internet, o mapa mostra também as ruas (OpenStreetMap). Os prints foram gerados num ambiente sem acesso externo, por isso aparecem só os limites dos municípios.
