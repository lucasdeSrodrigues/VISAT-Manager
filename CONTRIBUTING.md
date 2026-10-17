# Como contribuir

## Fluxo de trabalho

1. Pegue um cartão no Trello (coluna da sprint atual) e mova para "Em andamento".
2. Crie uma branch a partir da `main`: `feat/US11-sync-agendada`, `fix/radar-limite`, `docs/historias-sprint2`.
3. Faça commits pequenos no padrão **Conventional Commits**:
   - `feat(radar): agrupa demandas por faixa de prazo`
   - `fix(collector): aceita especificação sem empresa`
   - `test(api): cobre permissão de conclusão`
   - `docs: atualiza MoSCoW revisado`
   - `chore: configura ruff`
4. Antes de abrir o PR: `python -m pytest` e `ruff check .` sem erros.
5. Abra um Pull Request com o ID da história no título. **Outro integrante revisa** antes do merge (faz parte do Definition of Done).

## Divisão sugerida por épico

| Integrante | Épico / responsabilidade | Sprint 1 | Próximas sprints |
|---|---|---|---|
| Lucas de Souza Rodrigues | E1 Acesso e segurança | US01 | US12 configurações |
| Mateus de Lira Braga | E2 Coletor / dados | US02 | US11 agendamento, US18 SEI real |
| Lucas Nery | PO · indicadores · documentação | US07, US10, MoSCoW, histórias | US13 dashboard analítico, US17 |
| Artur Holanda | E4 Detalhe e linha do tempo | US05, US08 | US16 relatório PDF |
| Osmir Monteiro | E3 Painel e cadastro | US03, US04 | US14 mapa |
| Rafael de Andrade | E5/E6 Prazos e distribuição · testes | US06, US09 | US15 notificações |

> A divisão é uma sugestão. Ajustem conforme os papéis do documento "Papéis e responsabilidades".

## Regras de ouro

- Regra de negócio fica em `backend/app/rules.py` e **sempre tem teste**.
- Toda demanda nova entra por `services.registrar_entrada()`, seja do SEI ou manual.
- Nenhum dado pessoal real no repositório (LGPD).
