# Checklist da entrega — Sprint 1

Enunciado (Prof. Danilo Barbosa): *Priorização de histórias de usuários. Início do desenvolvimento das primeiras histórias. Entregável: histórias priorizadas e início do código (repositório). Código inicial do projeto. Evidência do funcionamento (prints ou vídeo).*

| Item do enunciado | Status | Onde está |
|---|---|---|
| Priorização de histórias de usuário | ✅ | `docs/historias.md` (10 histórias da Sprint 1 + 8 do roadmap, critério explícito, DoR/DoD), `docs/moscow.md` (antes × depois justificado), `docs/backlog_trello.csv` |
| Início do desenvolvimento das primeiras histórias | ✅ | US01–US10 implementadas de ponta a ponta (`backend/`, `collector/`, `frontend/`) |
| Histórias priorizadas | ✅ | Tabela da Sprint 1 com MoSCoW, pontos e status; matriz Valor × Esforço |
| Início do código no repositório | ✅ | Histórico de commits em Conventional Commits; README com instalação em ≤ 5 comandos |
| Código inicial do projeto | ✅ | API FastAPI, coletor SEI (scraper v0), interface web seguindo os wireframes, 50 testes |
| Código inicial do scraper (Trello) | ✅ | `collector/` + `python -m collector.run` |
| Evidência do funcionamento: prints | ✅ | `docs/evidencias/` (17 prints, indexados por história) |
| Evidência do funcionamento: vídeo | ✅ | `docs/evidencias/demo_visat_manager.mp4` (65 s, com legendas) |
| Apresentação (20 min) | ✅ | Deck "VISAT Manager — Sprint 1" + `docs/apresentacao.md` (falas, demo, plano B, perguntas) |

## Coerência com os artefatos anteriores

| Artefato | Como foi respeitado |
|---|---|
| Proposta de solução | Complementa o SEI sem substituí-lo; classificação, linha do tempo, alertas de prazo e dashboard implementados |
| Definição da arquitetura | 3 camadas (interface, lógica, banco), 2 entradas, perfis Gestor e Inspetor, telas do MVP |
| Definição do fluxo de dados | SEI/Manual → banco → dashboard/lista → detalhe → linha do tempo → conclusão; o mesmo fluxo para as duas origens |
| Wireframes (Canva) | Barra escura com sino "Radar de prazos" e perfil, menu lateral, "Visão geral", "Saúde da demanda", etapas da linha do tempo, faixas coloridas do radar |
| Trello | Itens da Sprint 1 cumpridos; Sprints 2–5 mapeadas para US11–US17 |
| MoSCoW do SR1 | Revisado com justificativa documento a documento |

## Antes de entregar (para o grupo)

- [ ] Subir o repositório no GitHub da equipe (`git remote add origin … && git push -u origin main`)
- [ ] Importar `docs/backlog_trello.csv` no Trello ou atualizar os cartões
- [ ] Atualizar o Google Sites: link do repositório, prints e vídeo na página SR2/Sprint 1
- [ ] Ensaiar a demo uma vez com o banco recém-criado (`python -m backend.app.seed`)
- [ ] Cada integrante ler a parte que vai falar em `docs/apresentacao.md`
