# MoSCoW revisado — antes × depois

## Por que revisar

Depois do SR1, o grupo detalhou a **Arquitetura**, o **Fluxo de Dados** e os **Wireframes**. Ao cruzar esses documentos com o MoSCoW original, apareceram três inconsistências:

1. **O núcleo do problema estava como SHOULD/COULD.** O desafio fala em "reduzir atrasos" e "fluxo rastreável". O Radar de Prazos e a Linha do Tempo resolvem exatamente isso e estão nos wireframes, mas tinham prioridade baixa.
2. **Havia MUSTs que não aparecem em nenhum documento técnico.** Copiloto IA e Base de Conhecimento não estão na arquitetura, no fluxo de dados nem nas telas do MVP, e dependem de um histórico de dados que ainda não existe.
3. **As entradas de dados não estavam priorizadas.** A arquitetura define duas entradas obrigatórias (sincronização SEI e cadastro manual), mas elas nem constavam do MoSCoW.

## Antes (MoSCoW do SR1)

| MUST | SHOULD | COULD | WON'T |
|---|---|---|---|
| Painel Central de Demandas · Mapa de Demandas · Dashboard Estratégico · Base de Conhecimento · Copiloto IA da VISAT | Radar de Prazos · Saúde das Demandas · Geração Assistida de Relatórios · Priorização Inteligente · Acompanhamento de Solicitações · Distribuição de Inspeções | Timeline da Fiscalização · Notificações Inteligentes · Portal dos Demandantes | Detecção de Gargalos |

## Depois (revisado para o MVP)

| Item | Antes | Depois | Justificativa | Documento que sustenta |
|---|---|---|---|---|
| Sincronização SEI (coletor) | — | **MUST** | Uma das duas entradas obrigatórias, evita redigitação | Arquitetura 4.5 · Fluxo de dados |
| Cadastro manual | — | **MUST** | Segunda entrada obrigatória, para demandas fora do SEI | Arquitetura 4.6 · Fluxo de dados |
| Acesso por perfil (Gestor/Inspetor) | — | **MUST** | Perfis com permissões diferentes | Arquitetura 4.1 |
| Painel Central de Demandas | MUST | **MUST** | Mantido: é a "Lista de Demandas" do fluxo | Fluxo de dados · Wireframe Demandas |
| Timeline da Fiscalização | COULD | **MUST** ⬆ | É a rastreabilidade pedida no desafio; está no wireframe do Detalhe | Proposta · Fluxo de dados · Wireframe Detalhe |
| Radar de Prazos | SHOULD | **MUST** ⬆ | Resolve a dor nº 1 (prazos legais); tem tela própria e sino no topo | Proposta (monitoramento de prazos) · Wireframe Radar |
| Saúde das Demandas | SHOULD | **MUST** ⬆ | Mesmo cálculo do Radar, exibido no Detalhe | Wireframe Detalhe |
| Distribuição de Inspeções | SHOULD | **MUST** ⬆ | Sem atribuição de responsável, a etapa "Inspetor designado" não existe | Wireframe Detalhe · Linha do tempo |
| Dashboard — visão geral | MUST | **MUST** | Mantido na forma do wireframe (Recebidas/Andamento/Concluídas) | Wireframe Dashboard |
| Dashboard estratégico (analítico) | MUST | **SHOULD** ⬇ | Precisa de histórico acumulado; Trello prevê "dashboard com dados reais" na Sprint 3 | Trello Sprint 3 |
| Mapa de Demandas | MUST | **SHOULD** ⬇ | Útil para rotas, mas não atua sobre prazo; depende de geocodificação | Trello Sprint 3 ("primeiras visualizações") |
| Geração Assistida de Relatórios | SHOULD | **SHOULD** | Mantido (botão "Gerar relatório" do wireframe, Sprint 4) | Wireframe Detalhe |
| Acompanhamento de Solicitações | SHOULD | **COULD** ⬇ | Visão do órgão externo; depende de acesso externo seguro | — |
| Notificações Inteligentes | COULD | **COULD** | Mantido: o sino já cobre o alerta interno; e-mail fica para a Sprint 4 | — |
| Priorização Inteligente | SHOULD | **COULD** ⬇ | Hoje é regra simples (acidente grave e MPT entram como ALTA); "inteligente" exige dados | — |
| Detecção de Gargalos | WON'T | **COULD** ⬆ | A linha do tempo já guarda data/hora de cada etapa, o que torna o cálculo viável na Sprint 5 | Modelo de dados (Movimentação) |
| Base de Conhecimento | MUST | **COULD** ⬇ | Fora da arquitetura e das telas do MVP | Arquitetura (não citada) |
| Copiloto IA da VISAT | MUST | **WON'T (neste semestre)** ⬇ | Exige base de dados histórica, análise LGPD (dados de saúde) e validação; risco alto para o MVP | LGPD art. 11 |
| Portal dos Demandantes | COULD | **WON'T (neste semestre)** | Acesso externo amplia superfície de ataque e escopo | — |

## Resultado

| MUST (MVP) | SHOULD | COULD | WON'T (agora) |
|---|---|---|---|
| Sincronização SEI · Cadastro manual · Acesso por perfil · Painel Central · Timeline · Radar de Prazos · Saúde das Demandas · Distribuição de Inspeções · Dashboard (visão geral) | Dashboard analítico · Mapa de Demandas · Geração de Relatórios | Notificações · Priorização Inteligente · Detecção de Gargalos · Acompanhamento de Solicitações · Base de Conhecimento | Copiloto IA · Portal dos Demandantes |

**Todos os MUST foram entregues na Sprint 1.** Com isso, as Sprints 2 a 5 ficam livres para refinar dados (scraper, pré-processamento), visualizações e validação com a VISAT, como previsto no Trello.
