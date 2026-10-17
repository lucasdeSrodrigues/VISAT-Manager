# ⭐VISAT Manager
Plataforma integrada que organiza, monitora e transforma as demandas recebidas pelo SEI em informações estratégicas para uma gestão mais eficiente da VISAT.

> CESAR School · Projeto 2 · **Grupo 6** · Prof. Danilo Barbosa
> Entrega atual: **Sprint 1** (histórias priorizadas + código + evidências) · versão `0.2.0`

![Dashboard do Gestor](docs/evidencias/02_dashboard_gestor.png)

## 🫆Alinhamento com os ODS
Nosso projeto está alinhado principalmente com o **ODS 8 – Trabalho Decente e Crescimento Econômico**, pois busca facilitar e suavizar o trabalho dos profissionais da VISAT, promovendo condições mais seguras e eficientes para a vigilância em saúde do trabalhador.

## ❌Problema
Como podemos transformar o processo de recebimento, acompanhamento e resposta às demandas de vigilância em saúde do trabalhador do Recife em um fluxo digital rastreável, integrado e orientado por dados, reduzindo atrasos, retrabalho e vulnerabilidade institucional?

## 🔎 Status Atual
O projeto está no **desenvolvimento do MVP (Sprint 1)**. O protótipo navegável apresentado no SR1 virou sistema: os dados ficam num banco, as permissões são conferidas no servidor, as demandas do SEI entram por um coletor e entraram o **Mapa de demandas** e os **Relatórios em PDF**. A interface é a mesma que foi validada.

## ✅ O que já funciona

| | Funcionalidade | História |
|---|---|---|
| 🔐 | Perfis **Gestor** e **Inspetor**, com a mesma matriz de permissões do protótipo, conferida no servidor | US01 |
| 🔄 | **Sincronização com o SEI**: o coletor lê, valida, deduplica e importa | US02 |
| ✍️ | **Cadastro manual** (`MAN-AAAA-NNNN`), com município e bairro | US03 |
| 📋 | **Lista** com busca, filtros, chips, ordenação, paginação e atribuição em lote | US04 · US09 |
| 🕒 | **Linha do tempo** de cada demanda, com autor, data e hora | US05 |
| ✔️ | **Status e conclusão**: o Inspetor solicita, o Gestor aprova ou devolve, e só o Gestor reabre | US06 |
| 🚦 | **Alertas de prazo**: vencidas, vencendo hoje e em até 3 dias | US07 |
| 📊 | **Dashboards** do Gestor e do Inspetor, e tela **Equipe** | US08 · US13 |
| 📎 | **Anexos reais** (até 10 MB), com pré-visualização, e observações | US10 |
| 🗺️ | **Mapa de demandas** da Região Metropolitana do Recife (Leaflet + limites do IBGE) | US11 |
| 📄 | **Relatórios** por período, CSV, PDF do período e PDF de cada demanda | US12 |

## ▶️ Como rodar

**Pré-requisito:** Python 3.11 ou superior ([python.org](https://www.python.org/downloads/); no Windows, marque *Add python.exe to PATH*).

- **Windows:** dois cliques em `iniciar.bat`
- **Linux/macOS:** `./iniciar.sh`

Depois, abra **http://localhost:8000**, preencha usuário e senha (qualquer valor, como no protótipo) e escolha o perfil.

Manualmente:

```bash
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python -m backend.app.seed                           # dados de exemplo (os mesmos do protótipo)
python -m uvicorn backend.app.main:app --reload      # http://localhost:8000
```

Outros comandos:

```bash
python -m collector.run   # coletor do SEI pelo terminal: Lidos 10 | Novos 8 | Duplicados 0 | Inválidos 2
python -m pytest          # 44 testes automatizados
ruff check .              # lint
```

A documentação da API fica em http://localhost:8000/docs.

## 🧱 Estrutura

```
VISAT-Manager/
├── frontend/
│   ├── index.html       # o protótipo validado, agora ligado à API
│   ├── vendor/leaflet/  # biblioteca do mapa (sem depender de CDN)
│   └── data/            # limites municipais da RMR (IBGE)
├── backend/app/
│   ├── rules.py         # matriz PERMS, status e urgência do prazo
│   ├── services.py      # uma função para cada ação do protótipo
│   ├── relatorios.py    # PDFs
│   ├── geo.py           # coordenadas de municípios e bairros
│   ├── routers/         # endpoints REST
│   └── seed.py          # dados de exemplo
├── collector/           # sincronização SEI (scraper v0)
├── tests/               # pytest
├── docs/                # histórias, MoSCoW, arquitetura, decisões, evidências, apresentação
└── scripts/             # evidências, vídeo e envio ao GitHub
```

## 📚 Documentação da Sprint 1

- [Histórias de usuário priorizadas](docs/historias.md) e [backlog para o Trello](docs/backlog_trello.csv)
- [MoSCoW revisado: antes × depois](docs/moscow.md)
- [Arquitetura implementada](docs/arquitetura.md) · [Decisões e premissas](docs/decisoes.md)
- [Evidências de funcionamento](docs/evidencias/) · [vídeo da demo](docs/evidencias/demo_visat_manager.mp4)
- [Roteiro da apresentação](docs/apresentacao.md) · [Checklist da entrega](docs/checklist_entrega.md)
- [Como contribuir](CONTRIBUTING.md)

## 🗓️ Roadmap

| Sprint | Foco (Trello) | Histórias |
|---|---|---|
| **1** ✅ | Priorização, código, scraper inicial, evidências | US01–US13 (Mapa e Relatórios antecipados) |
| 2 | Refinamento do scraper e segurança | US14 sincronização agendada · US15 autenticação real · US16 configurações |
| 3 | Dados e visualizações | US17 geocodificação · US18 dashboard analítico |
| 4 | Ajustes pós-SR1 | US19 notificações por e-mail |
| 5 | Validação com o cliente | US20 gargalos + ajustes das entrevistas |
| Futuro | Integração oficial com o SEI | US21 |

## Tela do board/backlog

<img width="1896" height="874" alt="Captura de tela_23-9-2026_1785_trello com" src="https://github.com/user-attachments/assets/81a99cd2-afe2-4b3f-8a2a-694b90d69669" />

## 📊Diagramas das UH's

https://www.figma.com/board/CBjudZTIcd7CaVuHgd4o5d/Sem-t%C3%ADtulo?node-id=0-1&t=POQt2YpKTqWM5VYQ-1

## ​💻​Prototipação
https://www.figma.com/proto/LaXeDczTlSIBvWNcISJIjI/Sem-t%C3%ADtulo?node-id=0-1&t=gUWcxJAEMVxyasU8-1

## 🎙️​Screencast

https://1drv.ms/v/c/1c1c8fc2654f999f/IQDhKngsunz_Q6siTCEosNfHAfA8Gh6V9wxFa7QBFa8Dngw?e=NwtuHh

## 👨‍💻Equipe

- Lucas de Souza Rodrigues
- Artur Holanda
- Mateus de Lira Braga
- Osmir Monteiro
- Rafael de Andrade
- Lucas Nery

> ⚠️ **Todos os dados do repositório são fictícios.** O mapa usa limites municipais do IBGE e, com internet, o mapa de ruas do © OpenStreetMap.
