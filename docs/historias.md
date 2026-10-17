# Histórias de usuário priorizadas — VISAT Manager

> Entregável Sprint 1 · Projeto 2 · Grupo 6 · CESAR School
> Base: Proposta de Solução, Definição da Arquitetura, Definição do Fluxo de Dados, Wireframes (Canva), MoSCoW revisado ([moscow.md](moscow.md)) e Cronograma (Trello).

## Personas

| Persona | Quem é | Dor principal (Matriz CSD / Mapa de Empatia) |
|---|---|---|
| **Gestor(a) da VISAT** | Coordena a unidade, responde aos órgãos demandantes, distribui o trabalho | Não sabe, em tempo real, quais demandas estão perto de vencer o **prazo legal**; controla tudo em planilhas paralelas ao SEI |
| **Inspetor(a) de VISAT** | Técnico que executa inspeções e investigações | Recebe demandas por canais diferentes, não tem um lugar único para registrar o andamento e anexar evidências |
| *Órgão demandante* (stakeholder externo) | MPT, sindicatos, Conselho de Saúde | Cobra respostas no prazo; não tem visibilidade do andamento (atendido no futuro pelo Portal) |

## Critério de priorização

1. **MoSCoW revisado** — o que é indispensável para o MVP cumprir o desafio (rastreabilidade + prazos).
2. **Valor × Esforço** — dentro de cada faixa MoSCoW, primeiro o que tem mais valor com menos esforço.
3. **Dependência técnica** — o fluxo de dados oficial define a ordem: *entrada → banco → lista → detalhe → linha do tempo → conclusão*.

```
               ESFORÇO BAIXO                         ESFORÇO ALTO
VALOR   ┌───────────────────────────────┬───────────────────────────────┐
ALTO    │ FAZER JÁ (Sprint 1)           │ PLANEJAR (Sprints 1–3)        │
        │ US01 Login/perfis  US03 Manual│ US02 Sincronização SEI        │
        │ US06 Radar  US07 Visão geral  │ US05 Linha do tempo           │
        │ US09 Atribuir  US04 Lista     │ US13 Dashboard analítico      │
        ├───────────────────────────────┼───────────────────────────────┤
VALOR   │ ENCAIXAR (Sprints 1–4)        │ ADIAR (pós-SR2)               │
MÉDIO/  │ US08 Documentos/observações   │ US18 Integração real SEI      │
BAIXO   │ US10 Carga por inspetor       │ Copiloto IA · Portal          │
        │ US15 Notificações e-mail      │ Base de Conhecimento          │
        └───────────────────────────────┴───────────────────────────────┘
```

## Definition of Ready (DoR)

Uma história só entra na sprint quando:
- está no formato *Como / quero / para* e cita a persona;
- tem critérios de aceite em Gherkin verificáveis;
- tem estimativa em story points acordada pelo time;
- não depende de algo fora do controle do time (ex.: credencial do SEI) ou a dependência tem *mock* definido;
- tem wireframe ou referência de tela, quando houver interface.

## Definition of Done (DoD)

Uma história só é "feita" quando:
- critérios de aceite passam e há **teste automatizado** para as regras de negócio envolvidas;
- permissões são verificadas **no back-end**, não só escondendo botões;
- `ruff check` e `pytest` passam sem erros;
- a tela segue o wireframe e funciona em desktop e celular;
- não há dado pessoal real (LGPD) no código, seeds ou prints;
- código revisado por outro integrante (Pull Request) e integrado na `main`;
- evidência registrada (print em `docs/evidencias/`).

---

## Sprint 1 — fatia vertical do fluxo de dados (ESTA ENTREGA)

**Objetivo da sprint:** uma demanda entra (pelo SEI ou manualmente), aparece no painel, é acompanhada pela linha do tempo e o gestor enxerga o risco de prazo — o fluxo de dados oficial funcionando de ponta a ponta.

**Capacidade:** 6 integrantes · **Comprometido:** 46 pontos · **Entregue:** 46 pontos ✅

| ID | História | Épico | MoSCoW | Pts | Status |
|---|---|---|---|---|---|
| US01 | Login com perfis Gestor e Inspetor | E1 Acesso | MUST | 3 | ✅ |
| US02 | Sincronização de demandas do SEI (coletor v0) | E2 Entrada | MUST | 8 | ✅ |
| US03 | Cadastro manual de demanda | E2 Entrada | MUST | 3 | ✅ |
| US04 | Painel central com filtros | E3 Painel | MUST | 5 | ✅ |
| US05 | Detalhe da demanda e linha do tempo | E4 Detalhe | MUST | 8 | ✅ |
| US06 | Radar de prazos e alerta no sino | E5 Prazos | MUST | 5 | ✅ |
| US07 | Dashboard — visão geral | E8 Indicadores | MUST | 5 | ✅ |
| US08 | Observações e documentos anexos | E4 Detalhe | MUST | 3 | ✅ |
| US09 | Atribuição de responsável e edição | E6 Distribuição | MUST | 3 | ✅ |
| US10 | Carga de trabalho por inspetor | E6 Distribuição | SHOULD | 3 | ✅ |

### US01 — Login com perfis
**Como** servidor(a) da VISAT, **quero** entrar com meu e-mail e senha e ver o sistema conforme meu perfil, **para** acessar apenas o que é da minha responsabilidade.
```gherkin
Cenário: login válido
  Dado um usuário ativo com perfil "Gestor"
  Quando ele informa e-mail e senha corretos
  Então acessa o Dashboard com o menu de Gestor (inclui "Inspetores")

Cenário: credencial inválida
  Quando a senha está errada
  Então vê "E-mail ou senha inválidos." e continua na tela de login

Cenário: rota protegida
  Dado um usuário sem sessão
  Quando chama qualquer rota da API
  Então recebe 401 e é redirecionado ao login
```
*Testes:* `test_login_invalido`, `test_rotas_exigem_autenticacao`, `test_me_retorna_perfil`, `test_logout_invalida_sessao`

### US02 — Sincronização com o SEI
**Como** gestor(a), **quero** que as demandas autuadas no SEI entrem automaticamente no VISAT Manager, **para** não redigitar processos nem manter planilha paralela.
```gherkin
Cenário: importar processos novos
  Dado uma exportação do SEI com 10 processos, 8 válidos
  Quando o gestor clica em "Sincronizar com SEI"
  Então 8 demandas são criadas com origem "SEI" na etapa "Solicitação recebida"
  E o sistema informa lidos, novos, duplicados e rejeitados

Cenário: idempotência
  Quando a sincronização roda pela segunda vez
  Então nenhuma demanda é duplicada (deduplicação pelo número SEI)

Cenário: registro inválido
  Dado um processo com número fora do padrão NNNNN.NNNNNN/AAAA-DD ou tipo não mapeado
  Então ele é rejeitado com o motivo, sem interromper os demais
```
*Testes:* `test_collector.py` (10 testes) + `test_sync_restrita_ao_gestor`

### US03 — Cadastro manual
**Como** inspetor(a) ou gestor(a), **quero** cadastrar uma demanda que chegou por ofício, e-mail ou presencialmente, **para** que ela siga o mesmo fluxo das que vêm do SEI.
```gherkin
Cenário: cadastro válido
  Quando preencho tipo, órgão, município e descrição
  Então a demanda recebe o código MAN-AAAA-NNNN e entra em "Solicitação recebida"
  E, sem prazo informado, recebe o prazo padrão do tipo de ocorrência

Cenário: validação
  Quando a descrição tem menos de 10 caracteres ou o prazo é anterior à entrada
  Então o cadastro é recusado e os campos são destacados
```
*Testes:* `test_cadastro_manual_gera_codigo_e_prazo_padrao`, `test_codigos_manuais_sequenciais`, `test_cadastro_valida_campos`

### US04 — Painel central com filtros
**Como** gestor(a), **quero** ver todas as demandas em uma lista filtrável por status, prioridade, responsável, origem e prazo, **para** encontrar rapidamente o que precisa de ação.
```gherkin
Cenário: filtros combinados
  Quando filtro prioridade "Alta" e origem "SEI"
  Então vejo apenas demandas que atendem aos dois critérios

Cenário: ordem por urgência
  Então as demandas abertas aparecem primeiro, ordenadas pelo prazo mais próximo

Cenário: visibilidade do inspetor
  Dado que sou inspetor
  Então vejo apenas demandas sob minha responsabilidade ou cadastradas por mim
```
*Testes:* `test_lista_filtra_por_status_prioridade_responsavel_origem`, `test_lista_ordenada_por_prazo_e_busca`, `test_inspetor_ve_apenas_suas_demandas`

### US05 — Detalhe e linha do tempo
**Como** gestor(a) ou inspetor(a), **quero** ver todos os dados da demanda e registrar cada etapa da fiscalização, **para** ter rastreabilidade do recebimento até a conclusão.
```gherkin
Cenário: fluxo sequencial
  Dado uma demanda em "Solicitação recebida"
  Então as etapas seguem: Triagem → Inspetor designado → Inspeção realizada → Relatório → Concluída
  E cada etapa registra data, hora e autor

Cenário: não pular etapas
  Quando alguém tenta ir de "Solicitação recebida" direto para "Relatório"
  Então recebe "Transição inválida"

Cenário: permissões por etapa
  Então só o Gestor faz Triagem, designa e conclui
  E só o Inspetor responsável (ou o Gestor) registra Inspeção e Relatório
```
*Testes:* 9 testes em `test_rules.py` + `test_fluxo_completo_da_linha_do_tempo`, `test_nao_pula_etapa_via_api`

### US06 — Radar de prazos
**Como** gestor(a), **quero** ver as demandas agrupadas em Vencidas, Urgentes, Atenção e Prazo seguro, com um alerta no topo da tela, **para** agir antes de descumprir o prazo legal.
```gherkin
Cenário: classificação
  Dado o prazo legal de uma demanda aberta
  Então ela é "Vencida" se o prazo passou, "Urgente" se faltam até 3 dias,
       "Atenção" se faltam até 7 dias e "Prazo seguro" acima disso
  E concluídas saem do radar

Cenário: alerta
  Então o sino mostra o total de Vencidas + Urgentes em todas as telas
```
*Testes:* `test_faixas_do_radar` (8 casos de limite), `test_concluida_sai_do_radar_mesmo_vencida`, `test_limites_configuraveis`, `test_radar_agrupa_nas_quatro_faixas`

### US07 — Dashboard: visão geral
**Como** gestor(a), **quero** ver os totais de demandas recebidas, em andamento, concluídas e vencidas, além do tempo médio de resposta e do % concluído no prazo, **para** acompanhar o desempenho da unidade.
```gherkin
Cenário: indicadores
  Então vejo Recebidas, Em andamento, Concluídas e Vencidas
  E o tempo médio de resposta (dias entre entrada e conclusão)
  E o % de demandas concluídas dentro do prazo legal

Cenário: perfil inspetor
  Então os mesmos indicadores consideram apenas as minhas demandas
```
*Testes:* `test_dashboard_visao_geral`, `test_dashboard_do_inspetor_considera_so_as_dele`

### US08 — Observações e documentos
**Como** inspetor(a), **quero** registrar observações e anexar documentos (termos, fotos, relatórios), **para** concentrar as evidências da fiscalização na demanda.
```gherkin
Cenário: anexo permitido
  Quando anexo um PDF de até 10 MB
  Então ele aparece em "Documentos" e o histórico registra o anexo

Cenário: anexo bloqueado
  Quando tento anexar um .exe
  Então recebo "Tipo de arquivo não permitido"
```
*Testes:* `test_observacao_e_documento`

### US09 — Atribuição e edição
**Como** gestor(a), **quero** atribuir ou reatribuir o inspetor responsável e ajustar prioridade e prazo, **para** distribuir a carga de trabalho com equilíbrio.
```gherkin
Cenário: atribuir em triagem
  Dado uma demanda em "Triagem"
  Quando atribuo um inspetor
  Então a etapa "Inspetor designado" é registrada automaticamente

Cenário: auditoria
  Quando altero a prioridade
  Então o histórico registra o valor anterior e o novo

Cenário: permissão
  Quando um inspetor tenta atribuir ou editar
  Então recebe 403
```
*Testes:* `test_atribuir_e_editar_sao_do_gestor`, `test_edicao_fica_no_historico`

### US10 — Carga por inspetor
**Como** gestor(a), **quero** ver quantas demandas abertas, vencidas e urgentes cada inspetor tem, **para** redistribuir antes que alguém fique sobrecarregado.
```gherkin
Cenário: distribuição
  Então vejo, por inspetor, o total de abertas, vencidas e urgentes
  E um atalho para as demandas sem responsável
```

---

## Sprints 2 a 5 — roadmap (alinhado ao Trello)

| Sprint (Trello) | ID | História | MoSCoW | Pts |
|---|---|---|---|---|
| **2** — refinamento do scraper e pré-processamento | US11 | Como gestor, quero que a sincronização rode sozinha em intervalos e registre um log de execuções, para não depender de clique manual | MUST | 5 |
| 2 | US12 | Como gestor, quero que o mapeamento de tipos e o prazo padrão sejam configuráveis por tela, para ajustar às regras da VISAT sem mudar código | SHOULD | 5 |
| 2 | — | Atualização do Google Sites e do cronograma | — | — |
| **3** — integração parcial dos dados e primeiras visualizações | US13 | Como gestor, quero um dashboard analítico com evolução mensal e filtros por período, para planejar a capacidade da equipe | SHOULD | 8 |
| 3 | US14 | Como gestor, quero ver as demandas em um mapa por município e bairro, para planejar rotas de inspeção | SHOULD | 5 |
| **4** — ajustes pós-SR1 e incrementos | US15 | Como inspetor, quero receber e-mail quando uma demanda minha ficar urgente, para não depender de abrir o sistema | COULD | 5 |
| 4 | US16 | Como gestor, quero gerar um relatório da demanda (PDF) com a linha do tempo, para responder ao órgão demandante | SHOULD | 5 |
| **5** — validação com o cliente | US17 | Como gestor, quero ver o tempo médio por etapa, para identificar gargalos do fluxo | COULD | 5 |
| 5 | — | Entrevistas/questionários com a VISAT e ajustes do MVP | — | — |
| Futuro (pós-SR2) | US18 | Integração real com os WebServices do SEI (depende de autorização formal da Prefeitura) | COULD | 13 |
| Futuro | — | Copiloto IA, Base de Conhecimento, Portal dos Demandantes | WON'T (neste semestre) | — |

*O backlog em formato importável está em [backlog_trello.csv](backlog_trello.csv).*
