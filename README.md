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

## Credenciais para acesso

Para testar as funcionalidades do VISAT Manager, selecione o perfil desejado na tela de login e utilize as credenciais correspondentes:

### Gestor
- **E-mail:** `gestor@visat.com`
- **Senha:** `Gestor@123`

### Inspetor
- **E-mail:** `inspetor@visat.com`
- **Senha:** `Inspetor@123`

> As credenciais são destinadas exclusivamente ao ambiente acadêmico de demonstração. O perfil selecionado deve corresponder ao usuário informado.

## 🔎 Status Atual

O VISAT Manager encontra-se em estágio funcional avançado, com as funcionalidades das Sprints 01 e 02 concluídas e a implementação da Sprint 03 em andamento.

Nas duas primeiras Sprints, foram desenvolvidos e integrados os principais recursos de gerenciamento de demandas:

- Cadastro manual e listagem centralizada de demandas;
- Classificação automática e ajuste manual de prioridades;
- Dashboard gerencial e Central de Alertas de prazos;
- Busca e filtros por área, bairro e responsável;
- Atualização do status das demandas;
- Visualização detalhada, linha do tempo e histórico completo;
- Edição dos dados cadastrados;
- Atribuição de responsáveis;
- Exclusão de demandas com confirmação.

Na Sprint 03, foi implementado o controle de acesso com os perfis **Gestor** e **Inspetor**. O sistema agora possui autenticação por e-mail e senha, com validação realizada pelo backend e sessões protegidas por cookie.

As permissões são diferenciadas conforme o perfil:

- **Gestor:** possui acesso às funções administrativas, incluindo atribuir ou remover responsáveis e excluir demandas;
- **Inspetor:** possui acesso às funções operacionais, como cadastrar, consultar e atualizar demandas, sem permissão para atribuir responsáveis ou realizar exclusões.

As restrições são aplicadas tanto na interface quanto no backend, evitando que operações não autorizadas sejam executadas diretamente pela API. O histórico também registra automaticamente o usuário autenticado responsável por cada movimentação.

A aplicação utiliza a seguinte arquitetura:

### Frontend

- React;
- Vite;
- JavaScript;
- React Router DOM;
- Publicação na Vercel.

### Backend

- Python;
- Flask;
- API REST;
- Autenticação por sessão;
- Publicação no Render.

### Banco de dados

- SQLite;
- Armazenamento de demandas, históricos e usuários;
- Inicialização automática das tabelas necessárias;
- Senhas armazenadas de forma protegida por hash.

O frontend se comunica com o backend pela variável de ambiente `VITE_API_URL`. O backend gerencia autenticação, permissões, cadastro, consulta, atualização e exclusão das demandas.

✅ **Situação atual do projeto:** sistema publicado e integrado, com autenticação, perfis de acesso, permissões diferenciadas, persistência em banco de dados, Dashboard, Central de Alertas, filtros avançados, gestão de status, responsáveis e histórico completo das demandas.

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

- **UH04 — Buscar e filtrar demandas por áreas/bairros** https://1drv.ms/v/c/1c1c8fc2654f999f/IQD1uQj8CVnhRLDJMUISzvOPARj8CbAKcLVWOh3wRuH7u6M?e=8FNPaB
- **UH05 — Filtrar demandas por responsável**  https://1drv.ms/v/c/1c1c8fc2654f999f/IQBdJ68muZ9LSIHNHIfcFvoTAaMowRtS3rQBDjMkhVYq83M?e=qRnsMa
- **UH06 — Atualizar o status da demanda**  https://1drv.ms/v/c/1c1c8fc2654f999f/IQCyvseEJqTbSqg1tMK-sXVPAaTE1hKa8TUlYrFpfNAtKVs?e=MTHjrk
- **UH07 — Visualizar a linha do tempo da demanda**  https://1drv.ms/v/c/1c1c8fc2654f999f/IQA81ndyOXGbSLU0gGlG43VwAZalahyFhvloorHeoBdlWf4?e=4wNPBl
- **UH15 — Consultar o histórico completo da demanda**  https://1drv.ms/v/c/1c1c8fc2654f999f/IQAhqGqRKDzHQZQfnl0RvH58AbvIbOYLPwh4nAERXiNHuA8?e=sKycma
  
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

### Sprint 3

- Login apresenta erro "Failed to fetch" no ambiente publicado
- Atualização incorreta dos campos do formulário da demanda
- Formulário de cadastro com tag de abertura inválida
- Título incorreto no cadastro da demanda

<img width="1246" height="785" alt="Captura de tela 2026-11-07 203145" src="https://github.com/user-attachments/assets/1116fffe-199c-4cab-a28c-314f59793272" />

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
