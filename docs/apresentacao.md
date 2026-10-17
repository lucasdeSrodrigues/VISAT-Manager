# Roteiro da apresentação: Sprint 1 (20 min · Grupo 6 · 12:40–13:00)

## Antes de começar (checklist 10 min antes)

- [ ] Notebook com o carregador ligado e o projeto aberto
- [ ] **Resetar a demo**: com o servidor parado, rodar `python -m backend.app.seed`, depois `iniciar.bat`
- [ ] Abrir duas abas: `http://localhost:8000` (login) e o terminal na pasta do projeto
- [ ] Vídeo de backup (plano B) aberto e pausado no início
- [ ] Zoom do navegador em 110–125% para a banca enxergar

## Distribuição do tempo e das falas

| Tempo | Slide / bloco | Quem fala | Mensagem-chave |
|---|---|---|---|
| 0:00–2:00 | 1–2 · Problema e desafio | **Lucas Nery** | A VISAT perde prazos legais porque controla demandas do MPT, sindicatos e Conselho em planilhas, sem visibilidade |
| 2:00–4:00 | 3 · O que mudou desde o SR1 | **Lucas Nery** | Detalhamos arquitetura, fluxo de dados e wireframes, e isso nos fez rever a priorização |
| 4:00–7:00 | 4–5 · MoSCoW antes × depois + Valor × Esforço | **Rafael de Andrade** | Radar e Timeline subiram para MUST porque são o núcleo do desafio; Copiloto IA foi para depois porque precisa de dados que ainda não existem |
| 7:00–9:00 | 6 · Histórias e Sprint 1 | **Osmir Monteiro** | 10 histórias, 46 pontos, todas com critérios Gherkin; a Sprint 1 é uma fatia vertical do fluxo de dados oficial |
| 9:00–11:00 | 7 · Arquitetura e origem dos dados | **Mateus de Lira Braga** | Três camadas, como no documento; o "scraper" do Trello é a sincronização com o SEI, hoje sobre uma exportação simulada e pronto para trocar pela fonte real |
| 11:00–17:00 | **DEMO AO VIVO** | **Artur Holanda** (conduz) + **Lucas de Souza Rodrigues** (narra) | Ver roteiro abaixo |
| 17:00–18:30 | 8 · Qualidade | **Lucas de Souza Rodrigues** | 50 testes automatizados, permissões no servidor, LGPD (dados fictícios) |
| 18:30–20:00 | 9 · Próximos passos e riscos | **Rafael de Andrade** | Sprints 2–5 do Trello; principal risco é o acesso ao SEI, com mitigação já desenhada |

## Roteiro da demo (6 min)

1. **Login como Gestor** (botão "Gestor"). *"Cada perfil vê o que é seu; isso é validado no servidor, não só na tela."*
2. **Dashboard**: aponte os 4 cards e o sino vermelho. *"Isto é o que hoje não existe: em 2 segundos a coordenação sabe quantas demandas estão vencidas."*
3. **Sincronizar com SEI**: clique e abra "Ver registros rejeitados". *"Leu 10 processos, importou 8 e rejeitou 2 com o motivo: um número fora do padrão e um processo que não é de saúde do trabalhador. Se eu clicar de novo, não duplica."* (clique de novo e mostre "novos 0")
4. **Radar de prazos**: *"As cores do wireframe: vencidas, urgentes, atenção. O acidente que acabou de chegar do SEI já aparece como vencido, porque o prazo padrão de acidente grave é de 7 dias."*
5. **Demandas → filtro** Prioridade Alta + Origem SEI. *"Mesma lista para SEI e manual: é o fluxo único da arquitetura."*
6. **Nova demanda** (manual): clique em "Cadastrar" vazio para mostrar a validação, preencha e salve. *"Recebe o código MAN-2026-…, e o prazo padrão é aplicado."*
7. **No detalhe**: Registrar **Triagem**, depois **Atribuir** ao Rodrigo. *"Atribuir já registra 'Inspetor designado' na linha do tempo, com data, hora e autor."*
8. **Sair → entrar como Inspetor (Rodrigo)**: abra a mesma demanda e registre **Inspeção realizada** com observação; anexe um PDF. *"O inspetor não vê o botão de concluir: só o gestor conclui. Se tentar pela API, recebe 403."*
9. **Terminal**: `python -m pytest` mostrando *50 passed*.

## Plano B

Se algo falhar ao vivo, não tente consertar: diga *"vou mostrar a gravação da mesma sequência"* e dê play no vídeo. Os prints de `docs/evidencias/` também podem ir direto nos slides.

## Roteiro do vídeo (2–3 min)

| Tempo | Tela | Narração |
|---|---|---|
| 0:00 | Login | "VISAT Manager, Sprint 1. Entro como gestora da VISAT." |
| 0:10 | Dashboard | "Visão geral: recebidas, em andamento, concluídas e vencidas. O sino mostra quantas demandas estão em risco de prazo." |
| 0:25 | Sincronizar | "Sincronizo com o SEI: 8 processos novos importados, 2 rejeitados com o motivo." |
| 0:45 | Radar | "O radar agrupa por urgência, com as cores do nosso wireframe." |
| 1:00 | Lista filtrada | "No painel central, filtro por prioridade e origem." |
| 1:15 | Cadastro manual | "Uma denúncia chegou por ofício: cadastro manual, com validação." |
| 1:35 | Detalhe | "Faço a triagem e designo o inspetor. Tudo fica na linha do tempo." |
| 1:55 | Inspetor | "Como inspetor, registro a inspeção e anexo o termo. Ele não consegue concluir: só o gestor." |
| 2:20 | Terminal | "50 testes automatizados passando. Próxima sprint: sincronização agendada e pré-processamento." |

## Perguntas prováveis da banca

**1. "Vocês integraram com o SEI de verdade?"**
Ainda não, e deixamos isso explícito. O coletor é real: lê e interpreta HTML, valida, deduplica e grava. A *fonte* hoje é uma exportação simulada com a estrutura da tela do SEI. Ele foi feito sobre uma interface (`FonteDeDemandas`), então a integração com os WebServices do SEI entra como uma nova fonte, sem mexer no resto. Ela depende de autorização formal da Prefeitura, por isso está no backlog como US18.

**2. "Por que mudaram o MoSCoW?"**
Porque, ao detalhar a arquitetura e os wireframes, vimos que o MoSCoW do SR1 deixava como COULD a linha do tempo, que é a rastreabilidade pedida no desafio, e como MUST um Copiloto IA que não aparece em nenhum documento técnico. Cada mudança está justificada em `docs/moscow.md`, com o documento que a sustenta.

**3. "De onde vêm os prazos? Estão corretos?"**
Hoje são premissas configuráveis, por tipo de ocorrência e pelos limites do radar (3 e 7 dias). Está registrado como premissa P1/P2 em `docs/decisoes.md`, para validar com a coordenação da VISAT na Sprint 5 (entrevistas). Mudar exige só uma variável de ambiente.

**4. "E a LGPD? Vocês estão lidando com dados de saúde."**
Todos os dados são fictícios. Cada inspetor só vê as próprias demandas, as permissões são checadas no servidor e todo o histórico é imutável (auditoria). Para produção, previmos a base legal (art. 11, II, "b"), a política de retenção e a criptografia do banco.

**5. "Como garantem que funciona?"**
São 50 testes automatizados: limites do radar (dia 3 é urgente, dia 4 é atenção), transições proibidas da linha do tempo, permissões por perfil, coletor (registros inválidos e idempotência) e o fluxo completo pela API. Mais lint com ruff. Tudo roda com `python -m pytest`.

**6. "Por que Python/FastAPI e não outra stack?"**
O Trello prevê scraper e pré-processamento, que são naturais em Python. Com uma linguagem só, os 6 conseguem mexer em tudo. O FastAPI documenta a API sozinho (/docs), e o SQLite dispensa instalar banco; para ir ao PostgreSQL, basta mudar a URL.
