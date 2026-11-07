# ⭐VISAT Manager
Plataforma integrada que organiza, monitora e transforma as demandas recebidas pelo SEI em informações estratégicas para uma gestão mais eficiente da VISAT.

## 🫆Alinhamento com os ODS
Nosso projeto está alinhado principalmente com o **ODS 8 – Trabalho Decente e Crescimento Econômico**, pois busca facilitar e suavizar o trabalho dos profissionais da VISAT, promovendo condições mais seguras e eficientes para a vigilância em saúde do trabalhador.

## ❌Problema 
Como podemos transformar o processo de recebimento, acompanhamento e resposta às demandas de vigilância em saúde do trabalhador do Recife em um fluxo digital rastreável, integrado e orientado por dados, reduzindo atrasos, retrabalho e vulnerabilidade institucional? 

## 🌐 Acesso ao sistema

O frontend do VISAT Manager está publicado na Vercel e pode ser acessado diretamente pelo navegador:

🔗 [Acessar o VISAT Manager](https://visat-manager.vercel.app/)

O backend da aplicação está publicado no Render:

🔗 [Acessar o backend do VISAT Manager](https://visat-manager-backend.onrender.com/)

O frontend utiliza a variável de ambiente VITE\_API\_URL para se comunicar com o backend publicado. As operações de cadastro, consulta, atualização e exclusão são realizadas pela API Flask e armazenadas no banco SQLite do backend.


## 🔎 Status Atual

O VISAT Manager encontra-se atualmente em um estágio funcional avançado, com as funcionalidades planejadas para as Sprints 01 e 02 implementadas e integradas à arquitetura da aplicação.

Durante a Sprint 01 foram desenvolvidas as funcionalidades centrais do sistema, incluindo:

- Cadastro manual de demandas;
- Listagem centralizada de demandas;
- Classificação automática e manual de prioridades;
- Visualização detalhada das demandas;
- Dashboard gerencial;
- Central de Alertas para acompanhamento de prazos.

Com a Sprint 02, o sistema recebeu recursos voltados ao acompanhamento completo do ciclo de vida das demandas, incluindo:

- *UH04:* Buscar e filtrar demandas por áreas e bairros;
- *UH05:* Filtrar demandas por responsável;
- *UH06:* Atualizar o status da demanda;
- *UH07:* Visualizar a linha do tempo da demanda;
- *UH15:* Consultar o histórico completo da demanda.

Além das histórias de usuário previstas, também foram implementadas melhorias evolutivas que aumentaram a rastreabilidade e a usabilidade da plataforma, tais como:

- Edição da descrição e dos detalhes das demandas;
- Controle visual de status com identificação por cores;
- Linha do tempo otimizada para acompanhamento de alterações;
- Histórico completo de modificações realizadas nas demandas;
- Indicadores adicionais no Dashboard para demandas concluídas e em revisão;
- Exclusão segura de demandas com confirmação;
- Sistema de responsáveis vinculado às demandas;
- Melhorias na experiência de navegação e visualização das informações.

A infraestrutura da aplicação também evoluiu significativamente. O armazenamento temporário no localStorage foi substituído por uma arquitetura baseada em frontend, API Flask e banco de dados SQLite.

O frontend publicado na Vercel realiza as requisições ao backend hospedado no Render por meio da variável de ambiente VITE\_API\_URL. O backend gerencia as operações de cadastro, consulta, atualização e exclusão das demandas.

O banco SQLite armazena as informações utilizadas pela aplicação. O backend também possui uma rotina de inicialização automática, responsável por criar as tabelas necessárias quando o arquivo do banco ainda não estiver disponível no ambiente de execução.


Atualmente, a aplicação utiliza a seguinte arquitetura:

### Frontend
- React
- Vite
- JavaScript
- React Router DOM

### Backend
- Python
- Flask
- SQLite

O frontend encontra-se publicado na Vercel, possibilitando acesso ao sistema diretamente pelo navegador. O backend realiza o gerenciamento das operações de cadastro, consulta, atualização e exclusão das demandas, enquanto o banco SQLite garante o armazenamento persistente das informações.

Essa estrutura serve como base para futuras evoluções do sistema, incluindo controle de perfis de usuário, permissões diferenciadas entre Gestores e Inspetores, configurações administrativas e demais funcionalidades previstas no backlog do projeto.

✅ *Situação Atual do Projeto:* Sistema funcional com frontend e backend integrados, persistência em banco de dados, Dashboard gerencial, Central de Alertas, filtros avançados, gestão de status, histórico completo e rastreabilidade das demandas.

## 🏃 Sprints

### Sprint 01

Histórias de usuário selecionadas e implementadas nesta sprint:

- **UH02 — Listar demandas em painel central**  https://1drv.ms/v/c/1c1c8fc2654f999f/IQBIFN6yAHtWT5DeeIHSx4OsAcJRBHjRzqJRZBpTF3l4PdE?e=OA2KSK
- **UH03 — Classificar demandas por prioridade** https://1drv.ms/v/c/1c1c8fc2654f999f/IQCPfIMlI6WAQo-0prqA4nhBAcQcAc9DoJO9v33xvDJfhcU?e=RbQLnT 
- **UH09 — Receber alerta de prazo próximo**  https://1drv.ms/v/c/1c1c8fc2654f999f/IQCF5KikdggPRbPeK85XbYSkAXTzlt24iQ3h2T2WcwyJJh8?e=caB7k1
- **UH11 — Dashboard gerencial**  https://1drv.ms/v/c/1c1c8fc2654f999f/IQC62kJFFdTITYiDuUGfiYYSAZWCpblojSVy7ya2N9MKDaU?e=Dir3l4
- **UH16 — Cadastrar demanda manualmente**  https://1drv.ms/v/c/1c1c8fc2654f999f/IQBxXrr8RVtjRKONxFK1i5wqAcIlP26ChfSZNzqTz-1BWQ8?e=gCHoR6

**Status:** ✅ Concluída

### Sprint 02

Objetivo: Aprimorar o acompanhamento do ciclo de vida das demandas e estruturar a arquitetura definitiva da aplicação com backend e banco de dados.
Histórias de Usuário Implementadas:

- **UH04 — Buscar e filtrar demandas por áreas/bairros**  https://1drv.ms/v/c/1c1c8fc2654f999f/IQC3wTCGJEXzSLMvo5hMKIzRAWUgkddVF-BLcrggd4uwEts?e=rKt6hS
- **UH05 — Filtrar demandas por responsável**  https://1drv.ms/v/c/1c1c8fc2654f999f/IQAeU8IabAxSRKIADOSpN_8tAejMslQH3Disva0qqYa6OM4?e=fyklQJ
- **UH06 — Atualizar o status da demanda**  https://1drv.ms/v/c/1c1c8fc2654f999f/IQDzcq_s0i7gTYHZ-aZ_2VkRAa577Esn_1wE9zQupD9lvwE?e=c37pG7
- **UH07 — Visualizar a linha do tempo da demanda**  https://1drv.ms/v/c/1c1c8fc2654f999f/IQBxcM2OFIVoQ45Mli3ZNJFfAVFf4YBteCAXubJhPXco8_Q?e=PzGSZo
- **UH15 — Consultar o histórico completo da demanda**  https://1drv.ms/v/c/1c1c8fc2654f999f/IQBxcM2OFIVoQ45Mli3ZNJFfAVFf4YBteCAXubJhPXco8_Q?e=PzGSZo
  
Principais entregas da Sprint:

- Sistema de atualização de status das demandas;
- Controle e atribuição de responsáveis;
- Linha do tempo para acompanhamento das alterações;
- Histórico completo e rastreabilidade das demandas;
- Filtros por área, bairro e responsável;
- Edição de descrição e detalhes das demandas;
- Indicadores adicionais no Dashboard para demandas concluídas e em revisão;
- Integração completa entre frontend e backend;
- Implementação da API utilizando Flask;
- Migração do armazenamento local para banco de dados SQLite;
- Operações de cadastro, consulta, edição e exclusão persistentes.
Tecnologias incorporadas nesta Sprint:

- Python
- Flask
- SQLite
Status:
**Status:** ✅ Concluída

## Tela do board/backlog

https://trello.com/invite/b/6a958f5ae0e46b0d0e91853f/ATTI7515ce6337281d37eeb479b51089f280304B3628/projeto-visat

<img width="1517" height="826" alt="Captura de tela 2026-11-06 165836" src="https://github.com/user-attachments/assets/f4cead91-5239-47a9-a4d6-6ffd8b5efc55" />


## 📊Diagramas das UH's

https://www.figma.com/board/CBjudZTIcd7CaVuHgd4o5d/Sem-t%C3%ADtulo?node-id=0-1&t=POQt2YpKTqWM5VYQ-1

## ​💻​Prototipação
https://www.figma.com/proto/LaXeDczTlSIBvWNcISJIjI/Sem-t%C3%ADtulo?node-id=0-1&t=gUWcxJAEMVxyasU8-1

## 🎙️​Screencasts

**Protótipo:**
https://1drv.ms/v/c/1c1c8fc2654f999f/IQDhKngsunz_Q6siTCEosNfHAfA8Gh6V9wxFa7QBFa8Dngw?e=NwtuHh

**VISAT-Manager em produção:**
https://1drv.ms/v/c/1c1c8fc2654f999f/IQBXpBRHCE8VQKP5q6mYUJbwAdWSMmybAmHF0IJjutLuqhI?e=kYHQT9

## Issue/bug tracker

### Sprint 1

- Erro de sintaxe no CSS impede o build de produção
- Atualização de rotar retorna o erro na versão publicada
- Dashboard não considera prioridade manual das demandas

### Sprint 2

- Backend Flask não inicia com Python 3.15 Alpha
- Demandas vindas da API aparecem com campos incompletos no frontend
- Página de detalhes não encontra demanda carregada do SQLite
- Demanda excluída reaparece ao atualizar a página
- Demandas finalizadas permanecem nos indicadores do dashboard
- Banco de dados local aparece como modificado após os testes
- Erro ao acessar demandas após remoção do banco de dados do repositório

## 👥Pair programming

Devido à composição reduzida da equipe, formada por apenas três integrantes, optamos por adaptar a prática tradicional de Pair Programming para um modelo colaborativo em trio durante momentos estratégicos do desenvolvimento. A concepção inicial do projeto, a definição da arquitetura do frontend e a implementação da US16 (Cadastro Manual de Demandas) foram realizadas presencialmente por toda a equipe, permitindo discussões em tempo real, validação conjunta de decisões técnicas e alinhamento dos requisitos da aplicação.

Essa etapa colaborativa estabeleceu uma base sólida para o desenvolvimento das demais histórias de usuário, facilitando a divisão das atividades, reduzindo retrabalho e garantindo maior consistência entre as funcionalidades implementadas. Além das sessões presenciais, os integrantes mantiveram comunicação constante para revisão de soluções, esclarecimento de dúvidas e acompanhamento da evolução das entregas.

Na segunda sprint, também houve uma reunião inicial para definir como seria a estrutura do backend, já dando início, nessa mesma reunião, ao desenvolvimento da base do mesmo. Mais à frente, também nos reunimos para revisar e refinar as US04, US05 e US06 e desenvolver as US07 e US15, obtendo um excelente resultando e contribuindo muito para o desenvolvimento do VISAT Manager.

Em resumo, mesmo com os commits concentrados em uma ou duas pessoas, toda a equipe está contribuindo para o desenvolvimento do projeto, com cada um fazendo a parte designada.

## 👨‍💻Equipe

- Lucas de Souza 
- Artur Holanda 
- Mateus de Lira 
- Osmir Monteiro 
- Rafael de Andrade  
- Lucas Nery 
