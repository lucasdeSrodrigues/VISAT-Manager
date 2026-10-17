# Decisões técnicas e premissas

## Decisões (ADR resumido)

| # | Decisão | Por quê | Alternativa considerada |
|---|---|---|---|
| D1 | **Python + FastAPI** no back-end | Mesma linguagem do scraper e do pré-processamento previstos no Trello; FastAPI gera a documentação da API sozinho e valida dados com Pydantic | Node/Express (exigiria duas linguagens no projeto) |
| D2 | **SQLite** no MVP, via SQLAlchemy | Zero instalação para os 6 integrantes e para a banca; trocar para PostgreSQL é só mudar `VISAT_DATABASE_URL` | PostgreSQL desde já (mais infraestrutura sem ganho na Sprint 1) |
| D3 | **Front-end em HTML/CSS/JS modular**, servido pelo próprio FastAPI | Reaproveita o protótipo; sem etapa de build; um único comando sobe tudo | React/Vite (curva de aprendizado e build extra) |
| D4 | **Coletor separado (`collector/`) com interface `FonteDeDemandas`** | Separação de responsabilidades (princípio da arquitetura); trocar o mock pela integração real não muda o resto | Lógica de importação dentro da API |
| D5 | **Ponto único de entrada (`services.registrar_entrada`)** | Garante o princípio "fluxo único independentemente da origem" | Código separado para SEI e manual |
| D6 | **Saúde/Radar calculados, não gravados** | Dependem da data de hoje; gravar exigiria um job diário e poderia ficar desatualizado | Coluna `status_prazo` atualizada por agendador |
| D7 | **Movimentações imutáveis** (só inclusão) | Rastreabilidade e auditoria: o histórico nunca é editado, só acrescido | Atualizar registros existentes |
| D8 | **Permissões validadas no back-end** (`rules.py` + `exigir_gestor`) | Esconder botão não é segurança; a API recusa com 403 | Controle só na interface |
| D9 | **Token de sessão no banco** (PBKDF2 para senhas) | Simples, revogável no logout, sem dependências extras | JWT (mais complexo de revogar) |

## Premissas (validar com a VISAT na Sprint 5)

| # | Premissa | Onde está | Como validar |
|---|---|---|---|
| P1 | Prazo padrão por tipo (dias corridos): acidente grave/fatal 7 · MPT 15 · sindical 15 · Conselho 20 · doença 30 · inspeção 30 · informação 10 | `config.PRAZO_PADRAO_DIAS` | Entrevista com a coordenação: prazos legais reais por tipo de demanda |
| P2 | Faixas do radar: urgente ≤ 3 dias, atenção ≤ 7 dias | `VISAT_LIMITE_URGENTE` / `VISAT_LIMITE_ATENCAO` | Perguntar com quantos dias de antecedência a equipe precisa ser alertada |
| P3 | Especificação do processo no SEI segue o padrão "Assunto – Empresa – Município" | `collector/normalizer.py` | Verificar exportações reais do SEI da unidade |
| P4 | Acidente grave/fatal e requisição do MPT entram com prioridade ALTA | `normalizer.PRIORIDADE_POR_TIPO` | Validar critério de priorização com a gestão |
| P5 | Inspetor vê só as demandas sob sua responsabilidade ou cadastradas por ele | `rules.pode_ver_demanda` | Confirmar política de acesso da unidade |
| P6 | A exportação HTML simulada reproduz a tela "Controle de Processos" do SEI | `collector/data/sei_export.html` | Comparar com o SEI real; a integração definitiva usará os WebServices, mediante autorização |

## O que é simulado e o que é real

- ✅ **Real:** banco de dados, regras de negócio, permissões, linha do tempo, radar, upload de documentos, scraper (lê e interpreta HTML de verdade), testes.
- 🟡 **Simulado:** a *fonte* do SEI é um arquivo local que imita a exportação. O código de coleta é o mesmo que será usado contra a fonte real.
- 🔜 **Futuro:** integração com os WebServices do SEI (Sprint pós-SR2, depende de autorização formal); SSO da Prefeitura no lugar do login próprio.

## LGPD

Demandas de saúde do trabalhador podem conter **dados pessoais sensíveis** (dados de saúde, art. 11 da Lei 13.709/2018). Por isso:
- todos os dados do repositório são **fictícios** (empresas, pessoas e números de processo);
- o cadastro orienta a não incluir dados pessoais desnecessários na descrição;
- somente perfis autorizados veem cada demanda, e todo acesso que altera dados fica no histórico;
- **próximos passos:** registrar a base legal do tratamento (execução de políticas públicas, art. 11, II, "b"), definir a retenção e criptografar o banco em produção.
