# Roteiro da apresentação — Sprint 1 (20 min · Grupo 6 · 12:40–13:00)

## Antes de começar (10 min antes)

- [ ] Notebook no carregador, com internet (para o mapa de ruas; sem internet o mapa mostra só os limites dos municípios)
- [ ] **Resetar a demo**: com o servidor parado, rode `python -m backend.app.seed` e depois `iniciar.bat`. Também dá para usar o botão "Restaurar dados de exemplo" no menu.
- [ ] Abas abertas: `http://localhost:8000` e o terminal na pasta do projeto
- [ ] Vídeo de backup (`docs/evidencias/demo_visat_manager.mp4`) pausado no início
- [ ] Zoom do navegador em 110–125%

## Tempo e falas

| Tempo | Bloco | Quem fala | Mensagem-chave |
|---|---|---|---|
| 0:00–2:00 | Problema e desafio | **Lucas Nery** | A VISAT perde prazos porque controla as demandas em planilhas paralelas ao SEI |
| 2:00–4:00 | O que mudou desde o SR1 | **Lucas Nery** | O protótipo que vocês viram agora é sistema: servidor, banco, permissões e coleta do SEI |
| 4:00–7:00 | MoSCoW antes × depois + Valor × Esforço | **Rafael de Andrade** | Prazos, linha do tempo e aprovação de conclusão viraram MUST; Copiloto IA ficou para depois |
| 7:00–9:00 | Histórias e Sprint 1 | **Osmir Monteiro** | 13 histórias, 58 pontos; Mapa e Relatórios foram antecipados |
| 9:00–11:00 | Arquitetura e origem dos dados | **Mateus de Lira Braga** | 3 camadas; o "scraper" do Trello é a sincronização com o SEI (fonte simulada, pronta para trocar) |
| 11:00–17:00 | **DEMO AO VIVO** | **Artur Holanda** conduz · **Lucas de Souza Rodrigues** narra | Roteiro abaixo |
| 17:00–18:30 | Qualidade | **Lucas de Souza Rodrigues** | 44 testes, permissões no servidor, LGPD |
| 18:30–20:00 | Próximos passos e riscos | **Rafael de Andrade** | Sprint 2: sincronização agendada e autenticação real |

## Roteiro da demo (6 min)

1. **Login como Gestor** (Marina). *"É o mesmo protótipo que mostramos, mas agora cada clique grava no banco."*
2. **Dashboard**: aponte "Vencidas" e "Conclusões a aprovar".
3. **Sincronizar SEI**: *"O coletor leu a exportação do SEI: 8 processos importados e 2 rejeitados na validação. Se eu clicar de novo, não duplica."* (clique de novo)
4. **Demandas** → filtro Responsável "Sem responsável" → selecione 3 → **Atribuir a…** Rafael.
5. **Nova demanda** com bairro Boa Viagem → abre o detalhe com o número MAN-… e a linha do tempo.
6. **Trocar perfil → Carlos (Inspetor)**: abra a demanda, mude o status, **anexe uma foto** e **solicite a conclusão**. *"O Inspetor não conclui sozinho; se tentar pela API, recebe 403."*
7. **Trocar perfil → Marina**: no dashboard, **Aprovar** a conclusão.
8. **Mapa de demandas** → filtro "Vencidas" → clique num local da lista.
9. **Relatórios** → 90 dias → **Baixar PDF**; no detalhe de uma demanda, **Gerar relatório (PDF)**.
10. **Atualize a página (F5)**: *"Os dados continuam lá: estão no servidor, não no navegador."*

## Plano B

Se algo falhar, não tente consertar ao vivo: *"vou mostrar a gravação da mesma sequência"* e dê play no vídeo. Os prints de `docs/evidencias/` também servem.

## Perguntas prováveis da banca

**1. "O que mudou em relação ao protótipo do SR1?"**
A tela é a mesma, de propósito. Antes os dados ficavam no navegador de quem abria. Agora estão num banco, as permissões são conferidas no servidor, o SEI é lido por um coletor, os anexos são guardados de verdade e entraram o Mapa e os Relatórios em PDF.

**2. "Vocês integraram com o SEI de verdade?"**
Ainda não, e isso está explícito. O coletor é real: lê e interpreta a tela de processos, valida, deduplica e grava. A fonte hoje é uma exportação simulada. A integração oficial (WebServices do SEI) entra como uma nova fonte da mesma interface e depende de autorização da Prefeitura (US21).

**3. "O login aceita qualquer senha?"**
Na Sprint 1, sim, como no protótipo, para a demonstração dos perfis. A sessão por token e as permissões já são reais. A autenticação com senha é a primeira história da Sprint 2 (US15).

**4. "Por que mudaram o MoSCoW?"**
Porque o original deixava como COULD a linha do tempo, que é a rastreabilidade pedida no desafio, e como MUST um Copiloto IA que não aparece em nenhum documento técnico. Cada mudança está justificada em `docs/moscow.md`.

**5. "E a LGPD?"**
Os dados são fictícios. Cada inspetor só vê as próprias demandas, todo acesso é conferido no servidor, o histórico é imutável e os anexos só são entregues a quem tem acesso.

**6. "Como garantem que funciona?"**
São 44 testes automatizados: a matriz de permissões, o selo de prazo, o fluxo de conclusão, o coletor (inválidos e duplicados), o mapa, os PDFs e a restauração. Tudo roda com `python -m pytest`.
