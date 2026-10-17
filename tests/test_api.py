"""Testes ponta a ponta da API — histórias US01 a US07 da Sprint 1."""

from datetime import date, timedelta


def primeira(client, h, **params):
    r = client.get("/api/demandas", headers=h, params=params)
    assert r.status_code == 200, r.text
    return r.json()["itens"][0]


# ------------------------------------------------------------------ US01
def test_login_invalido(client):
    r = client.post("/api/auth/login", json={"email": "gestor@visat.demo", "senha": "errada"})
    assert r.status_code == 401


def test_rotas_exigem_autenticacao(client):
    assert client.get("/api/demandas").status_code == 401
    assert client.get("/api/dashboard", headers={"Authorization": "Bearer falso"}).status_code == 401


def test_me_retorna_perfil(client, gestor, rodrigo):
    assert client.get("/api/auth/me", headers=gestor).json()["perfil"] == "GESTOR"
    assert client.get("/api/auth/me", headers=rodrigo).json()["perfil"] == "INSPETOR"


def test_logout_invalida_sessao(client, gestor):
    assert client.post("/api/auth/logout", headers=gestor).status_code == 204
    assert client.get("/api/auth/me", headers=gestor).status_code == 401


# ------------------------------------------------------------------ US02
def test_sync_restrita_ao_gestor(client, gestor, rodrigo):
    assert client.post("/api/sync/sei", headers=rodrigo).status_code == 403
    r = client.post("/api/sync/sei", headers=gestor)
    assert r.status_code == 200 and r.json()["novos"] == 8


# ------------------------------------------------------------------ US03
def novo(**kw):
    base = {
        "tipo_ocorrencia": "DENUNCIA_SINDICAL",
        "orgao_demandante": "Sindicato dos Padeiros",
        "municipio": "Recife",
        "empresa": "Panificadora Exemplo",
        "descricao": "Calor excessivo no setor de fornos.",
        "prioridade": "ALTA",
    }
    base.update(kw)
    return base


def test_cadastro_manual_gera_codigo_e_prazo_padrao(client, rodrigo):
    r = client.post("/api/demandas", headers=rodrigo, json=novo())
    assert r.status_code == 201, r.text
    d = r.json()
    ano = date.today().year
    assert d["codigo"].startswith(f"MAN-{ano}-") and d["origem"] == "MANUAL"
    assert d["etapa"] == "RECEBIDA" and d["movimentacoes"][0]["rotulo"] == "Solicitação recebida"
    assert date.fromisoformat(d["prazo_legal"]) == date.today() + timedelta(days=15)
    # inspetor que cadastrou continua vendo a demanda
    assert client.get(f"/api/demandas/{d['id']}", headers=rodrigo).status_code == 200


def test_codigos_manuais_sequenciais(client, gestor):
    a = client.post("/api/demandas", headers=gestor, json=novo()).json()["codigo"]
    b = client.post("/api/demandas", headers=gestor, json=novo()).json()["codigo"]
    assert int(b[-4:]) == int(a[-4:]) + 1


def test_cadastro_valida_campos(client, gestor):
    assert client.post("/api/demandas", headers=gestor, json=novo(descricao="curta")).status_code == 422
    assert client.post("/api/demandas", headers=gestor, json=novo(tipo_ocorrencia="X")).status_code == 422
    ontem = (date.today() - timedelta(days=1)).isoformat()
    r = client.post("/api/demandas", headers=gestor, json=novo(prazo_legal=ontem))
    assert r.status_code == 422 and "prazo legal" in r.text


# ------------------------------------------------------------------ US04
def test_lista_filtra_por_status_prioridade_responsavel_origem(client, gestor):
    todos = client.get("/api/demandas", headers=gestor, params={"por_pagina": 100}).json()
    assert todos["total"] == 16
    alta = client.get("/api/demandas", headers=gestor, params={"prioridade": "ALTA"}).json()["itens"]
    assert alta and all(i["prioridade"] == "ALTA" for i in alta)
    sei = client.get("/api/demandas", headers=gestor, params={"origem": "MANUAL"}).json()["itens"]
    assert sei and all(i["origem"] == "MANUAL" for i in sei)
    tri = client.get("/api/demandas", headers=gestor, params={"etapa": "TRIAGEM"}).json()["itens"]
    assert tri and all(i["etapa"] == "TRIAGEM" for i in tri)
    sem = client.get("/api/demandas", headers=gestor, params={"sem_responsavel": True, "abertas": True}).json()
    assert all(i["responsavel"] is None for i in sem["itens"])


def test_lista_ordenada_por_prazo_e_busca(client, gestor):
    itens = client.get("/api/demandas", headers=gestor, params={"abertas": True}).json()["itens"]
    prazos = [i["prazo_legal"] for i in itens]
    assert prazos == sorted(prazos)
    achou = client.get("/api/demandas", headers=gestor, params={"q": "Frigorífico"}).json()
    assert achou["total"] == 1


def test_inspetor_ve_apenas_suas_demandas(client, gestor, rodrigo):
    itens = client.get("/api/demandas", headers=rodrigo, params={"por_pagina": 100}).json()["itens"]
    assert itens and all(i["responsavel"]["email"] == "rodrigo@visat.demo" for i in itens)
    alheia = primeira(client, gestor, responsavel_id=3)  # camila
    assert client.get(f"/api/demandas/{alheia['id']}", headers=rodrigo).status_code == 403


# ------------------------------------------------------------------ US05
def test_fluxo_completo_da_linha_do_tempo(client, gestor, rodrigo):
    d = client.post("/api/demandas", headers=gestor, json=novo()).json()
    url = f"/api/demandas/{d['id']}"
    assert client.post(f"{url}/avancar", headers=gestor, json={"etapa": "TRIAGEM"}).status_code == 200
    # designação exige responsável
    r = client.post(f"{url}/avancar", headers=gestor, json={"etapa": "INSPETOR_DESIGNADO"})
    assert r.status_code == 409
    # atribuir em triagem avança automaticamente para "Inspetor designado"
    r = client.post(f"{url}/atribuir", headers=gestor, json={"responsavel_id": 2})
    assert r.json()["etapa"] == "INSPETOR_DESIGNADO"
    # inspetor responsável registra inspeção e relatório
    assert (
        client.post(
            f"{url}/avancar", headers=rodrigo, json={"etapa": "INSPECAO_REALIZADA", "descricao": "Vistoria in loco."}
        ).status_code
        == 200
    )
    det = client.post(f"{url}/avancar", headers=rodrigo, json={"etapa": "RELATORIO"}).json()
    assert det["etapas_permitidas"] == []  # inspetor não conclui
    assert client.post(f"{url}/avancar", headers=rodrigo, json={"etapa": "CONCLUIDA"}).status_code == 403
    fim = client.post(f"{url}/avancar", headers=gestor, json={"etapa": "CONCLUIDA"}).json()
    assert fim["etapa"] == "CONCLUIDA" and fim["concluida_em"] == date.today().isoformat()
    rotulos = [m["rotulo"] for m in fim["movimentacoes"] if m["etapa"]]
    assert rotulos == [
        "Solicitação recebida",
        "Triagem",
        "Inspetor designado",
        "Inspeção realizada",
        "Relatório",
        "Concluída",
    ]


def test_nao_pula_etapa_via_api(client, gestor):
    d = client.post("/api/demandas", headers=gestor, json=novo()).json()
    r = client.post(f"/api/demandas/{d['id']}/avancar", headers=gestor, json={"etapa": "RELATORIO"})
    assert r.status_code == 409 and "Transição inválida" in r.json()["detail"]


def test_atribuir_e_editar_sao_do_gestor(client, rodrigo):
    d = primeira(client, rodrigo)
    assert (
        client.post(f"/api/demandas/{d['id']}/atribuir", headers=rodrigo, json={"responsavel_id": 3}).status_code == 403
    )
    assert client.patch(f"/api/demandas/{d['id']}", headers=rodrigo, json={"prioridade": "BAIXA"}).status_code == 403


def test_edicao_fica_no_historico(client, gestor):
    d = primeira(client, gestor, abertas=True)
    det = client.patch(f"/api/demandas/{d['id']}", headers=gestor, json={"prioridade": "BAIXA"}).json()
    assert "prioridade" in det["movimentacoes"][-1]["descricao"]


def test_observacao_e_documento(client, rodrigo):
    d = primeira(client, rodrigo)
    url = f"/api/demandas/{d['id']}"
    assert (
        client.post(f"{url}/observacoes", headers=rodrigo, json={"descricao": "Empresa notificada."}).status_code == 201
    )
    r = client.post(
        f"{url}/documentos", headers=rodrigo, files={"arquivo": ("termo.pdf", b"%PDF-1.4 teste", "application/pdf")}
    )
    assert r.status_code == 201
    doc = r.json()["documentos"][-1]
    baixado = client.get(f"{url}/documentos/{doc['id']}", headers=rodrigo)
    assert baixado.status_code == 200 and baixado.content == b"%PDF-1.4 teste"
    ruim = client.post(
        f"{url}/documentos", headers=rodrigo, files={"arquivo": ("x.exe", b"MZ", "application/octet-stream")}
    )
    assert ruim.status_code == 422


# ------------------------------------------------------------------ US06 / US07
def test_radar_agrupa_nas_quatro_faixas(client, gestor):
    r = client.get("/api/radar", headers=gestor).json()
    g = r["grupos"]
    assert set(g) == {"VENCIDA", "URGENTE", "ATENCAO", "SEGURO"}
    assert all(len(g[f]) > 0 for f in g)  # seed cobre todas as faixas
    assert all(i["dias_restantes"] < 0 for i in g["VENCIDA"])
    assert all(0 <= i["dias_restantes"] <= 3 for i in g["URGENTE"])


def test_dashboard_visao_geral(client, gestor):
    k = client.get("/api/dashboard", headers=gestor).json()
    assert k["recebidas"] == 16 and k["concluidas"] == 4 and k["em_andamento"] == 12
    assert k["alertas"] == k["radar"]["VENCIDA"] + k["radar"]["URGENTE"]
    assert k["pct_concluidas_no_prazo"] == 75  # 3 de 4 no prazo
    assert k["tempo_medio_resposta_dias"] is not None
    assert len(k["carga_por_inspetor"]) == 4


def test_dashboard_do_inspetor_considera_so_as_dele(client, rodrigo):
    k = client.get("/api/dashboard", headers=rodrigo).json()
    assert k["recebidas"] == 3
