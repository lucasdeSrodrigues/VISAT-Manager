# Checklist da entrega — Sprint 1

Enunciado (Prof. Danilo Barbosa): *Priorização de histórias de usuários. Início do desenvolvimento das primeiras histórias. Entregável: histórias priorizadas e início do código (repositório). Código inicial do projeto. Evidência do funcionamento (prints ou vídeo).*

| Item do enunciado | Status | Onde está |
|---|---|---|
| Priorização de histórias de usuário | ✅ | `docs/historias.md` (13 histórias na Sprint 1, 8 no roadmap, critério explícito, DoR/DoD), `docs/moscow.md` (antes × depois), `docs/backlog_trello.csv` |
| Início do desenvolvimento das primeiras histórias | ✅ | US01–US13 implementadas de ponta a ponta |
| Início do código no repositório | ✅ | Histórico em Conventional Commits; README com instalação em ≤ 5 comandos |
| Código inicial do projeto | ✅ | API FastAPI, coletor do SEI, interface do protótipo ligada ao servidor, mapa, relatórios PDF, 44 testes |
| Código inicial do scraper (Trello) | ✅ | `collector/` + `python -m collector.run` + botão "Sincronizar SEI" |
| Evidência: prints | ✅ | `docs/evidencias/` (20 prints e 2 saídas de terminal, indexados por história) |
| Evidência: vídeo | ✅ | `docs/evidencias/demo_visat_manager.mp4` (≈55 s, com legendas) |
| Apresentação | ✅ | Deck "VISAT Manager — Sprint 1" + `docs/apresentacao.md` |

## Fidelidade ao que já foi apresentado

| Artefato | Como foi respeitado |
|---|---|
| Protótipo (index.html) | Mesmo layout, cores, textos, telas, status, matriz de permissões e mensagens. Mudou só a camada de dados; entraram a tela Mapa e os botões de PDF |
| Proposta de solução | Complementa o SEI; classificação, linha do tempo, alertas de prazo, dashboard e mapa |
| Arquitetura | 3 camadas, 2 entradas, perfis Gestor e Inspetor |
| Fluxo de dados | SEI/Manual → banco → dashboard/lista → detalhe → atualizações → conclusão |
| Trello | Itens da Sprint 1 cumpridos; mapa e visualizações antecipados |

## Antes de entregar (para o grupo)

- [ ] Enviar ao GitHub (script `enviar_para_github.bat` ou Pull Request)
- [ ] Importar `docs/backlog_trello.csv` no Trello ou atualizar os cartões
- [ ] Atualizar o Google Sites com o link do repositório, os prints e o vídeo
- [ ] Ensaiar a demo com o banco recém-criado
