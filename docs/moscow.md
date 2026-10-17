# MoSCoW revisado — antes × depois

## Por que revisar

Depois do SR1 o grupo detalhou a **Arquitetura**, o **Fluxo de Dados**, os **Wireframes** e o **protótipo navegável**. Ao cruzar esses documentos com o MoSCoW original, apareceram três inconsistências:

1. **O núcleo do problema estava como SHOULD/COULD.** O desafio fala em "reduzir atrasos" e "fluxo rastreável". Os alertas de prazo e a linha do tempo resolvem exatamente isso e já estavam no protótipo.
2. **Havia MUSTs sem respaldo técnico.** Copiloto IA e Base de Conhecimento não aparecem na arquitetura nem no protótipo, e dependem de um histórico de dados que ainda não existe.
3. **As entradas de dados não estavam priorizadas.** A arquitetura define duas entradas obrigatórias (sincronização SEI e cadastro manual), mas elas não constavam do MoSCoW.

## Antes (MoSCoW do SR1)

| MUST | SHOULD | COULD | WON'T |
|---|---|---|---|
| Painel Central de Demandas · Mapa de Demandas · Dashboard Estratégico · Base de Conhecimento · Copiloto IA da VISAT | Radar de Prazos · Saúde das Demandas · Geração Assistida de Relatórios · Priorização Inteligente · Acompanhamento de Solicitações · Distribuição de Inspeções | Timeline da Fiscalização · Notificações Inteligentes · Portal dos Demandantes | Detecção de Gargalos |

## Depois (revisado)

| Item | Antes | Depois | Justificativa | Onde se apoia | Situação |
|---|---|---|---|---|---|
| Sincronização SEI (coletor) | — | **MUST** | Uma das duas entradas obrigatórias | Arquitetura 4.5 · Fluxo de dados | ✅ Sprint 1 |
| Cadastro manual | — | **MUST** | Segunda entrada obrigatória | Arquitetura 4.6 · Fluxo de dados | ✅ Sprint 1 |
| Acesso por perfil | — | **MUST** | Gestor e Inspetor com permissões diferentes | Arquitetura 4.1 · `PERMS` do protótipo | ✅ Sprint 1 |
| Painel Central de Demandas | MUST | **MUST** | É a "Lista de Demandas" do fluxo | Fluxo de dados · protótipo | ✅ Sprint 1 |
| Timeline da Fiscalização | COULD | **MUST** ⬆ | É a rastreabilidade pedida no desafio | Proposta · "Observações e histórico" do protótipo | ✅ Sprint 1 |
| Radar de Prazos / Saúde das Demandas | SHOULD | **MUST** ⬆ | Dor nº 1: prazo descumprido | Proposta · selo de urgência e "Vencidas e vencendo" do protótipo | ✅ Sprint 1 |
| Distribuição de Inspeções | SHOULD | **MUST** ⬆ | Sem responsável não há execução; o protótipo tem atribuição em lote | Protótipo · tela Equipe | ✅ Sprint 1 |
| Acompanhamento de Solicitações (aprovação de conclusão) | SHOULD | **MUST** ⬆ | O inspetor não pode encerrar sozinho: o Gestor aprova | Fluxo "Solicitar conclusão" do protótipo | ✅ Sprint 1 |
| Dashboard (visão da equipe) | MUST | **MUST** | KPIs de abertas, vencidas e a aprovar | Protótipo | ✅ Sprint 1 |
| Mapa de Demandas | MUST | **SHOULD** ⬇ | Útil para rotas, mas não atua sobre prazo | Trello Sprint 3 | ✅ **antecipado** |
| Geração de Relatórios | SHOULD | **SHOULD** | Prestação de contas e resposta ao órgão | Botão "Gerar relatório" do wireframe | ✅ **antecipado** (CSV + PDF) |
| Dashboard analítico (séries históricas) | MUST | **SHOULD** ⬇ | Precisa de histórico acumulado | Trello Sprint 3 | Sprint 3 |
| Notificações Inteligentes | COULD | **COULD** | O painel já alerta; e-mail fica para depois | — | Sprint 4 |
| Priorização Inteligente | SHOULD | **COULD** ⬇ | Hoje é regra simples (Denúncia/Reclamação entram como Alta); "inteligente" exige dados | — | Sprint 5+ |
| Detecção de Gargalos | WON'T | **COULD** ⬆ | O histórico já registra cada mudança de status com data e hora | Modelo de dados (Evento) | Sprint 5 |
| Base de Conhecimento | MUST | **COULD** ⬇ | Fora da arquitetura e do protótipo | — | Futuro |
| Copiloto IA da VISAT | MUST | **WON'T (semestre)** ⬇ | Exige base histórica, análise LGPD e validação | LGPD art. 11 | — |
| Portal dos Demandantes | COULD | **WON'T (semestre)** | Acesso externo amplia escopo e riscos | — | — |

## Resultado

| MUST (MVP) | SHOULD | COULD | WON'T (agora) |
|---|---|---|---|
| Sincronização SEI · Cadastro manual · Acesso por perfil · Painel Central · Timeline · Alertas de prazo · Distribuição · Aprovação de conclusão · Dashboard | Mapa ✅ · Relatórios ✅ · Dashboard analítico | Notificações · Priorização inteligente · Gargalos · Base de Conhecimento | Copiloto IA · Portal dos Demandantes |

**Todos os MUST foram entregues na Sprint 1, e dois SHOULD (Mapa e Relatórios) foram antecipados.** As Sprints 2 a 5 ficam para qualidade dos dados (scraper agendado, autenticação real), visualizações analíticas e validação com a VISAT.
