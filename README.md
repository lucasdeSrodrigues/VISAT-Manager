# ⭐VISAT Manager
Plataforma integrada que organiza, monitora e transforma as demandas recebidas pelo SEI em informações estratégicas para uma gestão mais eficiente da VISAT.

## 🫆Alinhamento com os ODS
Nosso projeto está alinhado principalmente com o **ODS 8 – Trabalho Decente e Crescimento Econômico**, pois busca facilitar e suavizar o trabalho dos profissionais da VISAT, promovendo condições mais seguras e eficientes para a vigilância em saúde do trabalhador.

## ❌Problema 
Como podemos transformar o processo de recebimento, acompanhamento e resposta às demandas de vigilância em saúde do trabalhador do Recife em um fluxo digital rastreável, integrado e orientado por dados, reduzindo atrasos, retrabalho e vulnerabilidade institucional? 

## 🌐Acesso ao sistema

O frontend do VISAT Manager está publicado e pode ser acessado diretamente pelo navegador:

🔗 **[Acessar o VISAT Manager](https://visat-manager.vercel.app)**

> Nesta versão, os dados são armazenados localmente no navegador. Por isso, cada navegador e dispositivo mantém seus próprios registros.

## 🔎 Status Atual
O VISAT Manager encontra-se atualmente em fase de desenvolvimento incremental da Sprint 02, após a conclusão e validação das funcionalidades previstas para a Sprint 01.

Durante a primeira sprint, foram implementadas as histórias de usuário relacionadas ao cadastro manual de demandas, listagem centralizada, classificação automática e manual de prioridades, visualização detalhada das demandas, Dashboard gerencial e Central de Alertas para acompanhamento de prazos. Essas funcionalidades já se encontram operacionais e acessíveis por meio da interface da aplicação.

O frontend foi desenvolvido com React, Vite e JavaScript e está publicado na Vercel, permitindo o acesso ao sistema diretamente pelo navegador, sem necessidade de execução local. Atualmente, os dados continuam sendo armazenados no localStorage, o que possibilita a persistência das informações apenas no navegador e dispositivo em que foram registradas.

Com o início da Sprint 02, a equipe definiu a implementação das seguintes histórias de usuário:

UH04: Buscar e filtrar demandas por áreas/bairros;
UH05: Filtrar demandas por responsável;
UH06: Atualizar o status da demanda;
UH07: Visualizar a linha do tempo da demanda;
UH15: Consultar o histórico completo da demanda.

Além dessas funcionalidades, a Sprint 02 contemplará a criação da infraestrutura de backend e banco de dados da aplicação. O objetivo é substituir gradualmente o armazenamento local por uma solução centralizada, permitindo compartilhamento de informações entre dispositivos, persistência permanente dos dados e suporte às futuras evoluções do sistema.

A arquitetura definida para essa etapa será composta por React/Vite no frontend, Python com Flask no backend e SQLite como banco de dados. Essa estrutura servirá como base para as funcionalidades de controle de status, responsáveis, histórico e rastreabilidade das demandas, além de preparar o sistema para futuras integrações e funcionalidades previstas no backlog.

## 🏃 Sprints

### Sprint 01

Histórias de usuário selecionadas e implementadas nesta sprint:

- **UH02 — Listar demandas em painel central**  https://1drv.ms/v/c/1c1c8fc2654f999f/IQBIFN6yAHtWT5DeeIHSx4OsAcJRBHjRzqJRZBpTF3l4PdE?e=OA2KSK
- **UH03 — Classificar demandas por prioridade** https://1drv.ms/v/c/1c1c8fc2654f999f/IQCPfIMlI6WAQo-0prqA4nhBAcQcAc9DoJO9v33xvDJfhcU?e=RbQLnT 
- **UH09 — Receber alerta de prazo próximo**  https://1drv.ms/v/c/1c1c8fc2654f999f/IQCF5KikdggPRbPeK85XbYSkAXTzlt24iQ3h2T2WcwyJJh8?e=caB7k1
- **UH11 — Dashboard gerencial**  https://1drv.ms/v/c/1c1c8fc2654f999f/IQC62kJFFdTITYiDuUGfiYYSAZWCpblojSVy7ya2N9MKDaU?e=Dir3l4
- **UH16 — Cadastrar demanda manualmente**  https://1drv.ms/v/c/1c1c8fc2654f999f/IQBxXrr8RVtjRKONxFK1i5wqAcIlP26ChfSZNzqTz-1BWQ8?e=gCHoR6

**Status:** ✅ Concluída

## Tela do board/backlog

<img width="1896" height="874" alt="Captura de tela_23-9-2026_1785_trello com" src="https://github.com/user-attachments/assets/81a99cd2-afe2-4b3f-8a2a-694b90d69669" />

## 📊Diagramas das UH's

https://www.figma.com/board/CBjudZTIcd7CaVuHgd4o5d/Sem-t%C3%ADtulo?node-id=0-1&t=POQt2YpKTqWM5VYQ-1

## ​💻​Prototipação
https://www.figma.com/proto/LaXeDczTlSIBvWNcISJIjI/Sem-t%C3%ADtulo?node-id=0-1&t=gUWcxJAEMVxyasU8-1

## 🎙️​Screencast

https://1drv.ms/v/c/1c1c8fc2654f999f/IQDhKngsunz_Q6siTCEosNfHAfA8Gh6V9wxFa7QBFa8Dngw?e=NwtuHh

## 👥Pair programming

Como nossa equipe na matéria de FDS é restrita a apenas 3 pessoas, decidimos em vez de programar em pares, fazer parte do código em trio. Realizamos a ideação inicial, a base e a US16 em conjunto, em uma reunião presencial. Com isso, o resto do código ficou muito mais simples de ser implementado

## 👨‍💻Equipe

- Lucas de Souza 
- Artur Holanda 
- Mateus de Lira 
- Osmir Monteiro 
- Rafael de Andrade  
- Lucas Nery 
