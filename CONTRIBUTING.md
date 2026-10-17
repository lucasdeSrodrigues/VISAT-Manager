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
| Lucas de Souza Rodrigues | Acesso e segurança | US01 | US15 autenticação real, US16 |
| Mateus de Lira Braga | Coletor / dados | US02 | US14 sincronização agendada, US21 SEI oficial |
| Lucas Nery | PO · indicadores · documentação | US08, US12, US13, MoSCoW | US18 dashboard analítico, US20 |
| Artur Holanda | Detalhe, status e conclusão | US05, US06, US10 | US19 |
| Osmir Monteiro | Lista, cadastro e mapa | US03, US04, US11 | US17 geocodificação |
| Rafael de Andrade | Prazos, distribuição e testes | US07, US09 | US19 notificações |

> A divisão é uma sugestão. Ajustem conforme os papéis do documento "Papéis e responsabilidades".

## Regras de ouro

- Regra de permissão fica em `backend/app/rules.py` (a mesma matriz `PERMS` do `frontend/index.html`) e **sempre tem teste**.
- A interface segue o protótipo validado: mudanças visuais são combinadas com o grupo antes.
- Nenhum dado pessoal real no repositório (LGPD).
