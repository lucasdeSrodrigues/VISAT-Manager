# Decisões técnicas e premissas

## Decisões (ADR resumido)

| # | Decisão | Por quê | Alternativa considerada |
|---|---|---|---|
| D1 | **A interface é o protótipo validado (index.html)**, ligado à API com o mínimo de mudanças | O professor já validou telas e fluxos; a Sprint 1 transforma o protótipo em sistema sem perder essa validação | Reescrever em React (o scaffold iniciado foi substituído: mesma tela, mais tempo e risco) |
| D2 | **Python + FastAPI** no back-end | Mesma linguagem do coletor e do pré-processamento previstos no Trello; documentação automática da API | Node/Express |
| D3 | **SQLite** no MVP, via SQLAlchemy | Zero instalação; ir para PostgreSQL é só mudar `VISAT_DATABASE_URL` | PostgreSQL desde já |
| D4 | **Mesma matriz `PERMS` no servidor** (`rules.py`) | Esconder botão não é segurança: a API recusa com 403 e a mesma mensagem da tela | Controle só na interface |
| D5 | **Coletor separado (`collector/`) atrás da interface `FonteDeDemandas`** | Trocar a fonte simulada pela integração oficial não muda o resto | Importação dentro da API |
| D6 | **Histórico imutável** (tabela `eventos`, só inclusão) | Rastreabilidade e auditoria | Atualizar registros |
| D7 | **Urgência calculada, não gravada** | Depende da data de hoje; gravar exigiria rotina diária | Coluna `situacao_prazo` |
| D8 | **Leaflet e limites do IBGE dentro do repositório** | O mapa funciona sem CDN e até sem internet na apresentação | Google Maps (chave paga, depende de rede) |
| D9 | **PDF gerado no servidor (ReportLab)** | Arquivo igual para todos, pronto para anexar ao SEI | Imprimir a tela |
| D10 | **Login de demonstração** (igual ao protótipo) na Sprint 1 | Fidelidade ao fluxo validado; a sessão por token já é real | Senha na Sprint 1 (fica para a US15, Sprint 2) |

## Premissas (validar com a VISAT na Sprint 5)

| # | Premissa | Onde está | Como validar |
|---|---|---|---|
| P1 | Prazo das demandas do SEI por tipo: Denúncia 10 dias · Reclamação 15 · Inspeção 20 · Solicitação de informação 15 · Licenciamento 30 · Inspeção de rotina 30 | `config.PRAZO_SEI_POR_TIPO` | Entrevista com a coordenação |
| P2 | Prazo padrão do cadastro pelo Inspetor: 30 dias (igual ao protótipo) | `VISAT_DIAS_PRAZO_PADRAO` | Idem |
| P3 | Prioridade inicial do SEI: Denúncia e Reclamação = Alta; Licenciamento e Inspeção = Média; Rotina e Informação = Baixa | `collector/normalizer.py` | Validar critério com a gestão |
| P4 | Especificação do processo no SEI no padrão "Título – Bairro, Município" | `collector/normalizer.py` | Comparar com exportações reais |
| P5 | Posição no mapa pelo bairro (Recife) ou município (RMR), com pontos aproximados | `backend/app/geo.py` | Avaliar se a precisão atende ao planejamento de rotas |

## O que é real e o que é simulado

- ✅ **Real:** banco de dados, regras e permissões no servidor, histórico, upload e download de anexos, scraper (lê HTML de verdade), mapa, relatórios em PDF, testes.
- 🟡 **Simulado:** a *fonte* do SEI é um arquivo local que imita a tela "Controle de Processos"; o login é de demonstração (perfil escolhido na tela), como no protótipo.
- 🔜 **Futuro:** WebServices do SEI (mediante autorização formal), autenticação com senha/SSO, geocodificação por endereço.

## LGPD

- Todos os dados do repositório são **fictícios**.
- Cada inspetor só acessa as próprias demandas; toda alteração fica no histórico (quem, quando, o quê).
- Anexos ficam fora da pasta pública do site e só são entregues a quem tem acesso à demanda.
- Para produção: base legal do tratamento, política de retenção, criptografia do banco e dos anexos.
