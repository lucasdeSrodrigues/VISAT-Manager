# Evidências de funcionamento — Sprint 1

Prints gerados automaticamente por `scripts/capturar_evidencias.py`, que percorre o fluxo completo no navegador (Playwright) sobre o banco de demonstração. **Todos os dados são fictícios.**

| # | Print | O que comprova | História |
|---|---|---|---|
| 01 | [Login](01_login.png) | Acesso com perfis e atalhos de demonstração | US01 |
| 02 | [Dashboard do gestor](02_dashboard_gestor.png) | Visão geral, radar resumido, indicadores, carga por inspetor | US07 · US06 |
| 03 | [Sincronização SEI](03_sincronizacao_sei.png) | 10 lidos · 8 novos · 2 rejeitados com motivo | US02 |
| 04 | [Painel central](04_lista_demandas.png) | SEI e manual na mesma lista, abertas primeiro por prazo | US04 |
| 05 | [Lista filtrada](05_lista_filtrada.png) | Filtros combinados: prioridade Alta + origem SEI + só abertas | US04 |
| 06a | [Validação do cadastro](06a_cadastro_validacao.png) | Campos obrigatórios destacados | US03 |
| 06b | [Cadastro preenchido](06b_cadastro_preenchido.png) | Demanda recebida fora do SEI | US03 |
| 07 | [Demanda recém-cadastrada](07_detalhe_recem_cadastrada.png) | Código MAN-AAAA-NNNN, prazo padrão, linha do tempo iniciada | US03 · US05 |
| 08 | [Triagem e designação](08_detalhe_triagem_e_designacao.png) | Gestor faz triagem e atribui; "Inspetor designado" automático | US05 · US09 |
| 09 | [Dashboard do inspetor](09_dashboard_inspetor.png) | Inspetor vê apenas as próprias demandas | US01 · US07 |
| 10 | [Inspeção e anexo](10_inspetor_registra_inspecao_e_anexa.png) | Inspetor registra a inspeção e anexa documento; não pode concluir | US05 · US08 |
| 11 | [Radar do inspetor](11_radar_inspetor.png) | Radar filtrado pelo perfil | US06 |
| 12 | [Radar de prazos](12_radar_de_prazos_gestor.png) | Vencidas · Urgentes · Atenção · Prazo seguro | US06 |
| 13 | [Inspetores](13_inspetores_carga.png) | Carga, vencidas e urgentes por inspetor | US10 |
| 14 | [Mobile](14_mobile_dashboard.png) | Layout responsivo (390 px) | — |
| 15 | [Coletor no terminal](15_collector_terminal.png) | `python -m collector.run`: importa e é idempotente | US02 |
| 16 | [Testes](16_testes_pytest.png) | 50 testes passando + lint sem erros | DoD |

Vídeo da demo: [demo_visat_manager.mp4](demo_visat_manager.mp4)
