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

# 🔎 Status Atual

O VISAT Manager é uma plataforma web para gerenciamento das demandas da VISAT, desenvolvida ao longo de três sprints e publicada em ambiente de produção, com frontend hospedado na Vercel e backend hospedado no Render.

Ao longo do projeto, foram desenvolvidos e integrados os principais recursos da plataforma:

- Cadastro manual e listagem centralizada de demandas;
- Classificação automática e ajuste manual de prioridades;
- Dashboard gerencial com indicadores operacionais;
- Central de Alertas para monitoramento de prazos;
- Indicador de demandas atrasadas;
- Busca e filtros por área, bairro e responsável;
- Atualização do status das demandas;
- Visualização detalhada das demandas;
- Linha do tempo e histórico completo de movimentações;
- Edição dos dados cadastrados;
- Atribuição e remoção de responsáveis;
- Exclusão de demandas com confirmação;
- Controle de acesso por perfis de usuário;
- Registro e acompanhamento de gargalos operacionais;
- Anexação, consulta e download de documentos;
- Arquivamento e consulta de demandas arquivadas.

Na Sprint 03, foi implementado o sistema de autenticação com os perfis **Gestor** e **Inspetor**. O acesso é realizado por e-mail e senha, com validação pelo backend e gerenciamento de sessão através de cookies protegidos.

## Perfis de acesso

### Gestor

Possui acesso às funções administrativas, incluindo:

- Atribuição e remoção de responsáveis;
- Exclusão de demandas;
- Visualização e gerenciamento de gargalos;
- Arquivamento de demandas finalizadas;
- Acompanhamento dos indicadores gerenciais do sistema.

### Inspetor

Possui acesso às funções operacionais, incluindo:

- Cadastro, consulta e atualização de demandas;
- Registro de gargalos operacionais;
- Anexação de documentos;

Sem permissão para atribuir responsáveis ou excluir demandas.

As restrições são aplicadas tanto na interface quanto no backend, impedindo que operações não autorizadas sejam executadas diretamente pela API. O histórico também registra automaticamente o usuário autenticado responsável por cada movimentação realizada.

Além dos testes funcionais realizados durante o desenvolvimento, o projeto passou a contar com testes automatizados de sistema utilizando Playwright, validando funcionalidades críticas como autenticação, cadastro de demandas e registro de gargalos.

# Arquitetura da Aplicação

## Frontend

- React;
- Vite;
- JavaScript;
- React Router DOM;
- Publicação na Vercel.

## Backend

- Python;
- Flask;
- API REST;
- Autenticação por sessão;
- Publicação no Render.

## Banco de Dados

- SQLite;
- Armazenamento de demandas;
- Armazenamento de usuários;
- Armazenamento de históricos;
- Armazenamento de gargalos;
- Armazenamento de documentos anexados;
- Inicialização automática das tabelas necessárias;
- Senhas armazenadas de forma protegida por hash.

O frontend se comunica com o backend por meio da variável de ambiente `VITE_API_URL`. O backend é responsável pela autenticação, autorização, cadastro, consulta, atualização, arquivamento e exclusão das demandas, além do gerenciamento de documentos, gargalos e registros históricos.

✅ **Situação atual do projeto**: todas as funcionalidades previstas para as três sprints foram implementadas, integradas e validadas, resultando em uma aplicação completa para gestão de demandas da VISAT, com autenticação, controle de acesso, indicadores gerenciais, monitoramento de prazos, gargalos operacionais, gestão documental, arquivamento de demandas e testes automatizados de sistema utilizando Playwright.

## 🏃 Sprints

### Sprint 01

Histórias de usuário selecionadas e implementadas nesta sprint:

- **US02 — Listar demandas em painel central**  https://1drv.ms/v/c/1c1c8fc2654f999f/IQBIFN6yAHtWT5DeeIHSx4OsAcJRBHjRzqJRZBpTF3l4PdE?e=OA2KSK
- **US03 — Classificar demandas por prioridade** https://1drv.ms/v/c/1c1c8fc2654f999f/IQCPfIMlI6WAQo-0prqA4nhBAcQcAc9DoJO9v33xvDJfhcU?e=RbQLnT 
- **US09 — Receber alerta de prazo próximo**  https://1drv.ms/v/c/1c1c8fc2654f999f/IQCF5KikdggPRbPeK85XbYSkAXTzlt24iQ3h2T2WcwyJJh8?e=caB7k1
- **US11 — Dashboard gerencial**  https://1drv.ms/v/c/1c1c8fc2654f999f/IQC62kJFFdTITYiDuUGfiYYSAZWCpblojSVy7ya2N9MKDaU?e=Dir3l4
- **US16 — Cadastrar demanda manualmente**  https://1drv.ms/v/c/1c1c8fc2654f999f/IQBxXrr8RVtjRKONxFK1i5wqAcIlP26ChfSZNzqTz-1BWQ8?e=gCHoR6

**Status:** ✅ Concluída

### Sprint 02

Objetivo: Aprimorar o acompanhamento do ciclo de vida das demandas e estruturar a arquitetura definitiva da aplicação com backend e banco de dados.
Histórias de Usuário Implementadas:

- **US04 — Buscar e filtrar demandas por áreas/bairros** https://1drv.ms/v/c/1c1c8fc2654f999f/IQD1uQj8CVnhRLDJMUISzvOPARj8CbAKcLVWOh3wRuH7u6M?e=8FNPaB
- **US05 — Filtrar demandas por responsável**  https://1drv.ms/v/c/1c1c8fc2654f999f/IQBdJ68muZ9LSIHNHIfcFvoTAaMowRtS3rQBDjMkhVYq83M?e=qRnsMa
- **US06 — Atualizar o status da demanda**  https://1drv.ms/v/c/1c1c8fc2654f999f/IQCyvseEJqTbSqg1tMK-sXVPAaTE1hKa8TUlYrFpfNAtKVs?e=MTHjrk
- **US07 — Visualizar a linha do tempo da demanda**  https://1drv.ms/v/c/1c1c8fc2654f999f/IQA81ndyOXGbSLU0gGlG43VwAZalahyFhvloorHeoBdlWf4?e=4wNPBl
- **US15 — Consultar o histórico completo da demanda**  https://1drv.ms/v/c/1c1c8fc2654f999f/IQAhqGqRKDzHQZQfnl0RvH58AbvIbOYLPwh4nAERXiNHuA8?e=sKycma
  
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

<h3>Sprint 03</h3>

<p><strong>Objetivo:</strong> fortalecer a gestão das demandas através de controle de acesso, monitoramento gerencial, registro de gargalos, gestão documental e arquivamento de processos concluídos.</p>

<p><strong>Histórias de Usuário Implementadas:</strong></p>

- **US01 - Perfis gestor e inspetor** https://drive.google.com/file/d/1j6O8IzGRIT597E3WFHdQf0mYoOT-M5b3/view?usp=sharing

<ul>
  <li>
    <strong>US08 — Arquivar e consultar demandas arquivadas</strong><br>
    Permite que demandas finalizadas sejam arquivadas e posteriormente consultadas em modo somente leitura, preservando histórico e documentos vinculados.<br>
    https://1drv.ms/v/c/1c1c8fc2654f999f/IQCNjrvVAWpqQpENT1SOWi6YAe6JVVuB0_cJN8ERo5FLfzk?e=GhpS8g
  </li>

  <li>
    <strong>US10 — Receber alerta de demanda atrasada</strong><br>
    Destaca demandas com prazo ultrapassado, auxiliando gestores na rápida identificação de situações críticas e prioritárias.<br>
    https://1drv.ms/v/c/1c1c8fc2654f999f/IQBjS1VlXMW9TJ1z5O86-lFeAXyKmtUYDY7TwS0MNxboz4U?e=gVbjBl
  </li>

  <li>
    <strong>US12 — Visualizar indicadores gerenciais</strong><br>
    Amplia os indicadores do Dashboard para fornecer uma visão mais clara da situação das demandas e apoiar a tomada de decisão.<br>
    https://1drv.ms/v/c/1c1c8fc2654f999f/IQBLm0A7hEq1SoQ94aqWoH6QAdJZ7Xstzg3ruXlYtnOeLxI?e=jL0c03
  </li>

  <li>
    <strong>US13 — Registrar gargalos operacionais</strong><br>
    Permite que inspetores registrem dificuldades encontradas durante a execução das demandas e que gestores acompanhem esses registros para apoiar a resolução dos problemas identificados.<br>
    https://1drv.ms/v/c/1c1c8fc2654f999f/IQAwOz9sN3oGQ7hQy0re_jS8AYlsaMDWhZ2JwDefGoPlMDg?e=sVzdP4
  </li>

  <li>
    <strong>US14 — Anexar documentos à demanda</strong><br>
    Permite incluir documentos relacionados às demandas, informando tipo e descrição, facilitando a organização das evidências e consultas futuras.<br>
    https://1drv.ms/v/c/1c1c8fc2654f999f/IQBPJSZopacYToJVPM-zfimrAXSvLAq4jDYahyKmQ6V6Ars?e=QtejzY
  </li>
</ul>

<p><strong>Principais entregas da Sprint:</strong></p>

<ul>
  <li>Sistema de autenticação com perfis Gestor e Inspetor;</li>
  <li>Controle de permissões aplicado no frontend e backend;</li>
  <li>Indicador de demandas atrasadas no Dashboard;</li>
  <li>Registro e acompanhamento de gargalos operacionais;</li>
  <li>Anexação, consulta e download de documentos;</li>
  <li>Arquivamento manual de demandas finalizadas;</li>
  <li>Consulta de demandas arquivadas em modo somente leitura;</li>
  <li>Registro de histórico de arquivamentos e movimentações dos usuários;</li>
  <li>Validação de sessão através de autenticação integrada entre frontend e backend;</li>
  <li>Publicação da aplicação em ambiente de produção (Vercel + Render).</li>
</ul>

<p><strong>Tecnologias incorporadas nesta Sprint:</strong></p>

<ul>
  <li>Autenticação baseada em sessão;</li>
  <li>Cookies HttpOnly;</li>
  <li>Controle de acesso por perfis;</li>
  <li>React;</li>
  <li>Flask;</li>
  <li>SQLite.</li>
</ul>

### Diferença entre UH09 e US10

UH09 atua preventivamente,
alertando demandas próximas do vencimento.

US10 atua corretivamente,
destacando demandas cujo prazo já foi ultrapassado.

<p><strong>Status:</strong> ✅ Concluída</p>

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

**Testes automatizados:**
https://drive.google.com/file/d/1Pl21pXr37QeVpTf1cDGaXr6Q38SjYKGR/view?usp=sharing

**Screencast final**
https://drive.google.com/file/d/1wsw9KOmu94s4--hRh98Nf8QVnhnY4sHg/view?usp=drive_link

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
- Backend retorna erro 500 após deploy sem as tabelas do banco SQLite
- Campo de responsável exibido sem estilização na página de detalhes

<img width="1207" height="798" alt="Captura de tela 2026-11-22 135744" src="https://github.com/user-attachments/assets/00e4192f-fb55-4e96-ac3d-c9403e3479b4" />

## Uso de Ferramentas de Inteligência Artificial

Durante o desenvolvimento do projeto, ferramentas de inteligência artificial generativa foram utilizadas de forma pontual como apoio às atividades de documentação, revisão de textos, esclarecimento de dúvidas técnicas e consulta de boas práticas de desenvolvimento.

Todas as decisões de projeto, implementação, validação dos requisitos, testes, correções e integração das funcionalidades foram realizadas e revisadas pela equipe, que manteve a responsabilidade integral sobre o produto final entregue.

## 👥Pair programming

👥 Pair Programming

Devido à composição reduzida da equipe, optamos por adaptar a prática tradicional de Pair Programming para um modelo colaborativo em grupo durante momentos estratégicos do desenvolvimento. A concepção inicial do projeto, a definição da arquitetura do frontend e a implementação da US16 (Cadastro Manual de Demandas) foram realizadas de forma conjunta, permitindo discussões em tempo real, validação colaborativa das decisões técnicas e alinhamento dos requisitos do sistema.

Essa etapa colaborativa estabeleceu uma base sólida para o desenvolvimento das demais histórias de usuário, facilitando a divisão das atividades, reduzindo retrabalho e garantindo maior consistência entre as funcionalidades implementadas. Além dos encontros dedicados ao desenvolvimento, os integrantes mantiveram comunicação constante para revisão de soluções, esclarecimento de dúvidas, validação de requisitos e acompanhamento da evolução do projeto.

Na Sprint 02, a equipe realizou reuniões para planejar e estruturar a arquitetura definitiva do backend, iniciando o desenvolvimento da API e da persistência de dados. Também foram promovidas sessões de revisão e refinamento das histórias relacionadas aos filtros, atualização de status, linha do tempo e histórico completo das demandas, contribuindo diretamente para a integração entre frontend e backend.

Já na Sprint 03, a colaboração da equipe esteve concentrada na implementação e validação das funcionalidades finais do sistema.

Também foram realizados testes de sistema com Playwright para validação de fluxos críticos da aplicação, abrangendo autenticação, cadastro de demandas e registro de gargalos, contribuindo para aumentar a confiabilidade da solução.

Em resumo, mesmo com parte dos commits concentrados em integrantes específicos em determinados momentos do desenvolvimento, todo o grupo participou ativamente das decisões, validações, revisões e implementações necessárias para a evolução do VISAT Manager, colaborando para a entrega de uma solução integrada, funcional e publicada em produção.

## 👨‍💻Equipe

- Lucas de Souza 
- Artur Holanda 
- Mateus de Lira 
- Osmir Monteiro 
- Rafael de Andrade  
- Lucas Nery 
