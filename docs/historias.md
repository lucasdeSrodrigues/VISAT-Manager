# Histórias de usuário priorizadas — VISAT Manager

> Entregável Sprint 1 · Projeto 2 · Grupo 6 · CESAR School
> Base: Proposta de Solução, Definição da Arquitetura, Definição do Fluxo de Dados, Wireframes (Canva), **protótipo navegável (index.html) apresentado ao professor**, MoSCoW revisado ([moscow.md](moscow.md)) e Cronograma (Trello).

## Personas

| Persona | Quem é | Dor principal |
|---|---|---|
| **Gestor(a) da VISAT** | Coordena a unidade, distribui o trabalho e responde aos órgãos | Não sabe, em tempo real, quais demandas estão vencidas ou perto de vencer; controla tudo em planilhas paralelas ao SEI |
| **Inspetor(a)** | Executa vistorias e inspeções | Recebe demandas por canais diferentes e não tem onde registrar o andamento e anexar evidências |
| *Órgãos e cidadãos demandantes* | Quem abre a demanda | Cobram resposta no prazo (atendidos no futuro pelo Portal) |

## Critério de priorização

1. **MoSCoW revisado**: o que é indispensável para o MVP cumprir o desafio (rastreabilidade + prazos).
2. **Valor × Esforço**: dentro de cada faixa, primeiro o que tem mais valor com menos esforço.
3. **Ordem do fluxo de dados oficial**: entrada → banco → dashboard/lista → detalhe → atualizações → conclusão.
4. **Fidelidade ao protótipo validado**: as telas e os fluxos que o professor já viu são a especificação da interface.

```
               ESFORÇO BAIXO                          ESFORÇO ALTO
VALOR   ┌────────────────────────────────┬────────────────────────────────┐
ALTO    │ FAZER JÁ (Sprint 1)            │ PLANEJAR (Sprint 1)            │
        │ US01 Perfis · US03 Cadastro    │ US02 Sincronização SEI         │
        │ US07 Alertas de prazo          │ US06 Status e conclusão        │
        │ US09 Atribuição · US04 Lista   │ US05 Linha do tempo            │
        ├────────────────────────────────┼────────────────────────────────┤
VALOR   │ ENCAIXAR (Sprint 1 e 2)        │ ADIAR (Sprints 3+ / pós-SR2)   │
MÉDIO   │ US10 Documentos · US13 Equipe  │ US21 SEI real · US18 Analítico │
        │ US11 Mapa · US12 Relatórios    │ Copiloto IA · Portal           │
        └────────────────────────────────┴────────────────────────────────┘
```

## Definition of Ready (DoR)

- formato *Como / quero / para*, com persona;
- critérios de aceite em Gherkin verificáveis;
- estimativa em story points acordada pelo time;
- tela de referência (protótipo ou wireframe) quando houver interface;
- dependência externa (ex.: credencial do SEI) resolvida ou com *mock* definido.

## Definition of Done (DoD)

- critérios de aceite passam e há **teste automatizado** para as regras envolvidas;
- permissões verificadas **no servidor** (mesma matriz `PERMS` do protótipo), não só na tela;
- `ruff check` e `pytest` sem erros;
- tela **fiel ao protótipo**, funcionando em desktop e celular;
- nenhum dado pessoal real (LGPD);
- revisão por outro integrante (Pull Request) e evidência em `docs/evidencias/`.

---

## Sprint 1 — o protótipo funcionando de verdade (ESTA ENTREGA)

**Objetivo da sprint:** transformar o protótipo validado em sistema real: dados no banco, regras e permissões no servidor, coleta do SEI e as primeiras visualizações (mapa e relatórios).

**Comprometido:** 48 pontos · **Entregue:** 58 pontos (inclui US11 Mapa e US12 Relatórios, antecipadas da Sprint 3/4) ✅

| ID | História | Épico | MoSCoW | Pts | Status |
|---|---|---|---|---|---|
| US01 | Acesso por perfil (Gestor/Inspetor) | Acesso | MUST | 3 | ✅ |
| US02 | Sincronização com o SEI (coletor) | Entrada | MUST | 8 | ✅ |
| US03 | Cadastro manual de demanda | Entrada | MUST | 3 | ✅ |
| US04 | Lista com filtros, ordenação e paginação | Painel | MUST | 5 | ✅ |
| US05 | Detalhe e linha do tempo | Acompanhamento | MUST | 5 | ✅ |
| US06 | Status, solicitação e aprovação de conclusão | Acompanhamento | MUST | 8 | ✅ |
| US07 | Alertas de prazo | Prazos | MUST | 3 | ✅ |
| US08 | Dashboards do Gestor e do Inspetor | Indicadores | MUST | 5 | ✅ |
| US09 | Atribuição (individual e em lote), prioridade e prazo | Distribuição | MUST | 3 | ✅ |
| US10 | Documentos e observações | Acompanhamento | MUST | 3 | ✅ |
| US13 | Equipe: carga por inspetor | Distribuição | SHOULD | 2 | ✅ |
| US11 | Mapa de demandas *(antecipada)* | Visualização | SHOULD | 5 | ✅ |
| US12 | Relatórios com CSV e PDF *(antecipada)* | Indicadores | SHOULD | 5 | ✅ |

### US01 — Acesso por perfil
**Como** servidor(a) da VISAT, **quero** entrar e ver o sistema conforme meu perfil, **para** acessar apenas o que é da minha responsabilidade.
```gherkin
Cenário: entrada
  Dado o usuário e a senha preenchidos e um perfil escolhido
  Quando clico em Entrar
  Então vejo o Dashboard (Gestor) ou Meu painel (Inspetor)

Cenário: rota protegida
  Dado que não tenho sessão
  Quando chamo qualquer rota da API
  Então recebo 401 e volto ao login

Cenário: visibilidade
  Dado que sou Inspetor
  Então vejo somente as demandas atribuídas a mim, e uma demanda alheia retorna 403
```
> Na Sprint 1 o login segue o protótipo (perfil de demonstração). A autenticação com senha/SSO é a US15 (Sprint 2).

### US02 — Sincronização com o SEI
**Como** Gestor, **quero** que os processos autuados no SEI entrem automaticamente, **para** não redigitar nem manter planilha paralela.
```gherkin
Cenário: importar
  Dado uma exportação do SEI com 10 processos, 8 válidos
  Quando clico em "Sincronizar SEI"
  Então 8 demandas entram como "Nova", sem responsável, com prazo padrão pelo tipo
  E vejo "8 novas demandas importadas do SEI. 2 registros rejeitados na validação."

Cenário: idempotência
  Quando sincronizo de novo
  Então nenhuma demanda é duplicada

Cenário: permissão
  Dado que sou Inspetor
  Então o botão fica bloqueado com "Somente Gestor" e a API responde 403
```

### US03 — Cadastro manual
**Como** Gestor ou Inspetor, **quero** cadastrar uma demanda recebida por outros meios, **para** que ela siga o mesmo fluxo das que vêm do SEI.
```gherkin
Cenário: Gestor cadastra
  Quando preencho título, tipo, local, responsável, prioridade e prazo
  Então a demanda recebe o número MAN-AAAA-NNNN e o histórico registra criação e atribuição

Cenário: Inspetor cadastra
  Então a demanda fica atribuída a ele, com prioridade Média e prazo padrão de 30 dias

Cenário: validação
  Quando o título está vazio ou o prazo está no passado
  Então o cadastro é recusado com a mensagem do campo
```

### US04 — Lista de demandas
**Como** Gestor, **quero** buscar, filtrar (status, prioridade, prazo, origem, responsável), ordenar e paginar as demandas, **para** encontrar rapidamente o que precisa de ação.
```gherkin
Cenário: filtros combinados
  Quando filtro "Vencidas" e origem "SEI"
  Então vejo só as demandas que atendem aos dois critérios, com chips removíveis

Cenário: atalhos
  Quando clico em um card do dashboard (ex.: "Sem responsável")
  Então a lista abre já filtrada
```

### US05 — Detalhe e linha do tempo
**Como** Gestor ou Inspetor, **quero** ver todos os dados da demanda e o histórico de cada ação, **para** ter rastreabilidade do recebimento à conclusão.
```gherkin
Cenário: rastreabilidade
  Então cada criação, atribuição, mudança de status, documento, observação, edição e conclusão
  aparece na linha do tempo com autor, data e hora
  E o histórico nunca é editado, só acrescido
```

### US06 — Status e conclusão
**Como** Inspetor, **quero** atualizar o status e solicitar a conclusão ao Gestor; **como** Gestor, **quero** aprovar, devolver, concluir e reabrir, **para** que nenhuma demanda seja encerrada sem validação.
```gherkin
Cenário: inspetor não conclui
  Quando o Inspetor tenta "Concluída"
  Então recebe 'Inspetor não conclui diretamente: use "Solicitar conclusão" e o Gestor aprova'

Cenário: solicitar → devolver → aprovar
  Dado uma conclusão solicitada com observação
  Quando o Gestor devolve (com motivo) ou aprova
  Então a solicitação é removida ou a demanda é concluída, e o histórico registra

Cenário: reabrir
  Então só o Gestor reabre uma demanda concluída, e o motivo é obrigatório
```

### US07 — Alertas de prazo
**Como** Gestor, **quero** ver o selo de urgência de cada demanda e as vencidas e vencendo em destaque, **para** agir antes de descumprir o prazo.
```gherkin
Cenário: selo
  Então o selo mostra "Vencido há N dias", "Vence hoje", "Vence em N dias" (até 3) ou "No prazo"
  Com ícone e texto, nunca só cor
```

### US08 — Dashboards
**Como** Gestor, **quero** ver em aberto, sem responsável, vencidas, vencendo em 15 dias e conclusões a aprovar; **como** Inspetor, **quero** meus prazos de hoje e da semana e as pendências de documento.

### US09 — Atribuição, prioridade e prazo
**Como** Gestor, **quero** atribuir uma ou várias demandas de uma vez e ajustar prioridade e prazo, **para** distribuir a carga com equilíbrio.
```gherkin
Cenário: lote
  Quando seleciono linhas e escolho "Atribuir a…"
  Então todas recebem o inspetor e cada uma registra a reatribuição

Cenário: edição auditada
  Quando altero prioridade e prazo
  Então o histórico registra "Alterado: prioridade de X para Y; prazo de A para B"
```

### US10 — Documentos e observações
**Como** Inspetor, **quero** anexar arquivos e registrar observações nas minhas demandas em aberto, **para** concentrar as evidências.
```gherkin
Cenário: anexo real
  Quando anexo uma foto ou PDF (até 10 MB)
  Então o arquivo fica guardado e pode ser pré-visualizado ou baixado
```

### US11 — Mapa de demandas *(antecipada da Sprint 3)*
**Como** Gestor, **quero** ver as demandas no mapa da Região Metropolitana, por bairro do Recife ou município, **para** identificar concentrações e planejar rotas de vistoria.
```gherkin
Cenário: filtros
  Quando filtro "Vencidas"
  Então vejo só os locais com demandas vencidas, com o número no pino e a lista ao lado

Cenário: acesso
  Dado que sou Inspetor
  Então vejo somente as minhas demandas no mapa
```

### US12 — Relatórios *(antecipada da Sprint 4)*
**Como** Gestor, **quero** indicadores por período (7, 30 e 90 dias), exportação em CSV e PDF, e o relatório em PDF de cada demanda, **para** prestar contas e responder aos órgãos demandantes.

### US13 — Equipe
**Como** Gestor, **quero** ver, por inspetor, as demandas em aberto, vencidas, aguardando documento e concluídas no mês.

---

## Sprints 2 a 5 — roadmap (alinhado ao Trello)

| Sprint | ID | História | MoSCoW | Pts |
|---|---|---|---|---|
| **2** · refinamento do scraper | US14 | Sincronização agendada com log de execuções | MUST | 5 |
| 2 | US15 | Autenticação real (senha e, depois, SSO da Prefeitura) | MUST | 5 |
| 2 | US16 | Configuração de tipos e prazos padrão pela tela | SHOULD | 3 |
| **3** · dados e visualizações | US17 | Geocodificação por endereço no mapa | SHOULD | 5 |
| 3 | US18 | Dashboard analítico com evolução mensal | SHOULD | 5 |
| **4** · ajustes pós-SR1 | US19 | Notificação por e-mail de prazo próximo | COULD | 5 |
| **5** · validação | US20 | Tempo médio em cada status (gargalos) | COULD | 3 |
| 5 | — | Entrevistas e questionários com a VISAT e ajustes | — | — |
| Futuro | US21 | Integração com os WebServices do SEI (mediante autorização) | COULD | 13 |
| Futuro | — | Copiloto IA · Portal dos Demandantes | WON'T (semestre) | — |

*Backlog importável no Trello: [backlog_trello.csv](backlog_trello.csv).*
