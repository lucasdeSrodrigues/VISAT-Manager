"""Fluxos ponta a ponta pela API — as mesmas ações do protótipo, agora com dados persistidos."""

from datetime import date, timedelta

from tests.conftest import achar, demandas, entrar, url

HOJE = date.today()


# ------------------------------------------------------------------ acesso
def test_login_exige_usuario_senha_e_perfil_valido(client):
    assert client.post("/api/login", json={"user": "", "senha": "x", "perfil": "g1"}).status_code == 422
    assert client.post("/api/login", json={"user": "x", "senha": "", "perfil": "g1"}).status_code == 422
    assert client.post("/api/login", json={"user": "x", "senha": "y", "perfil": "zz"}).status_code == 401


def test_rotas_exigem_sessao_e_logout_encerra(client, gestor):
    assert client.get("/api/estado").status_code == 401
    assert client.get("/api/estado", headers=gestor).status_code == 200
    assert client.post("/api/logout", headers=gestor).status_code == 204
    assert client.get("/api/estado", headers=gestor).status_code == 401


def test_dados_de_exemplo_sao_os_do_prototipo(client, gestor):
    e = client.get("/api/estado", headers=gestor).json()
    assert len(e["demandas"]) == 28
    assert {u["nome"] for u in e["usuarios"]} == {
        "Marina Albuquerque",
        "Carlos Menezes",
        "Ana Beatriz Lopes",
        "Rafael Tavares",
    }
    d = achar(client, gestor, titulo="Denúncia de armazenamento inadequado de alimentos")
    assert d["id"] == f"00089.000001/{HOJE.year}-01" and d["status"] == "Em andamento"
    assert [x["nome"] for x in d["docs"]] == ["denuncia_original.pdf", "fotos_local.zip"]


def test_inspetor_ve_somente_as_suas(client, carlos, gestor):
    minhas = demandas(client, carlos)
    assert len(minhas) == 9 and all(d["responsavel"] == "i1" for d in minhas)
    alheia = achar(client, gestor, responsavel="i2")
    assert client.get(url(alheia["id"]), headers=carlos).status_code == 403


# ------------------------------------------------------------------ cadastro
def test_gestor_cadastra_com_responsavel_prioridade_e_prazo(client, gestor):
    prazo = (HOJE + timedelta(days=5)).isoformat()
    r = client.post(
        "/api/demandas",
        headers=gestor,
        json={
            "titulo": "Denúncia de fumaça em padaria",
            "tipo": "Denúncia",
            "estabelecimento": "Padaria X",
            "resp": "i2",
            "prioridade": "Alta",
            "prazo": prazo,
            "municipio": "Recife",
            "bairro": "Torre",
        },
    )
    assert r.status_code == 201, r.text
    d = r.json()
    assert d["id"].startswith(f"MAN-{HOJE.year}-") and d["origem"] == "Manual"
    assert (d["responsavel"], d["prioridade"], d["prazo"], d["bairro"]) == ("i2", "Alta", prazo, "Torre")
    assert [(e["tipo"], e["texto"]) for e in d["historico"]] == [
        ("criacao", "Demanda cadastrada manualmente"),
        ("reatribuicao", "Atribuída a Ana Beatriz Lopes"),
    ]


def test_inspetor_cadastra_atribuida_a_ele_com_padroes(client, carlos):
    d = client.post(
        "/api/demandas",
        headers=carlos,
        json={
            "titulo": "Reclamação em lanchonete",
            "tipo": "Reclamação",
            "resp": "i3",
            "prioridade": "Alta",
            "prazo": HOJE.isoformat(),
        },
    ).json()
    assert (d["responsavel"], d["prioridade"]) == ("i1", "Média")
    assert d["prazo"] == (HOJE + timedelta(days=30)).isoformat()
    assert d["historico"][1]["texto"] == "Atribuída automaticamente a Carlos Menezes"


def test_cadastro_valida_titulo_prazo_e_municipio(client, gestor):
    ontem = (HOJE - timedelta(days=1)).isoformat()
    assert (
        client.post("/api/demandas", headers=gestor, json={"titulo": " ", "prazo": HOJE.isoformat()}).status_code == 409
    )
    r = client.post("/api/demandas", headers=gestor, json={"titulo": "X", "prazo": ontem})
    assert r.status_code == 409 and "passado" in r.json()["detail"]
    r = client.post(
        "/api/demandas", headers=gestor, json={"titulo": "X", "prazo": HOJE.isoformat(), "municipio": "Natal"}
    )
    assert r.status_code == 409


# ------------------------------------------------------------------ atribuição e gestão
def test_atribuicao_em_lote_somente_gestor(client, gestor, carlos):
    sem = [d["id"] for d in demandas(client, gestor) if not d["responsavel"]]
    assert client.post("/api/demandas/atribuir", headers=carlos, json={"ids": sem, "resp": "i1"}).status_code == 403
    r = client.post("/api/demandas/atribuir", headers=gestor, json={"ids": sem, "resp": "i3"})
    assert r.json()["alteradas"] == len(sem) == 5
    d = client.get(url(sem[0]), headers=gestor).json()
    assert d["historico"][-1]["texto"] == "Atribuída a Rafael Tavares"


def test_salvar_gestao_registra_edicao_e_valida(client, gestor, carlos):
    d = achar(client, gestor, responsavel="i1", status="Nova")
    novo_prazo = (HOJE + timedelta(days=40)).isoformat()
    corpo = {"resp": "i1", "prioridade": "Alta", "prazo": novo_prazo}
    assert client.post(url(d["id"], "/gestao"), headers=carlos, json=corpo).status_code == 403
    r = client.post(url(d["id"], "/gestao"), headers=gestor, json=corpo).json()
    assert r["historico"][-1]["tipo"] == "edicao" and "prioridade de Média para Alta" in r["historico"][-1]["texto"]
    assert (
        client.post(url(d["id"], "/gestao"), headers=gestor, json=corpo).json()["detail"]
        == "Nenhuma alteração para salvar."
    )
    ontem = (HOJE - timedelta(days=1)).isoformat()
    assert (
        "passado"
        in client.post(url(d["id"], "/gestao"), headers=gestor, json={**corpo, "prazo": ontem}).json()["detail"]
    )


# ------------------------------------------------------------------ status e conclusão
def test_inspetor_muda_status_mas_nao_conclui(client, carlos):
    d = achar(client, carlos, status="Nova")
    r = client.post(url(d["id"], "/status"), headers=carlos, json={"status": "Em análise"}).json()
    assert r["status"] == "Em análise" and r["historico"][-1]["texto"] == "Alterado de Nova para Em análise"
    r = client.post(url(d["id"], "/status"), headers=carlos, json={"status": "Concluída", "obs": "feito"})
    assert r.status_code == 403 and "Solicitar conclusão" in r.json()["detail"]


def test_fluxo_solicitar_devolver_e_aprovar_conclusao(client, carlos, gestor):
    d = achar(client, carlos, status="Em análise")
    assert client.post(url(d["id"], "/solicitar-conclusao"), headers=carlos, json={"obs": ""}).status_code == 409
    r = client.post(url(d["id"], "/solicitar-conclusao"), headers=carlos, json={"obs": "Vistoria ok."}).json()
    assert r["conclusaoSolicitada"]["obs"] == "Vistoria ok."
    assert client.post(url(d["id"], "/solicitar-conclusao"), headers=carlos, json={"obs": "de novo"}).status_code == 409
    assert client.post(url(d["id"], "/aprovar"), headers=carlos).status_code == 403
    assert client.post(url(d["id"], "/devolver"), headers=gestor, json={"obs": ""}).status_code == 409
    r = client.post(url(d["id"], "/devolver"), headers=gestor, json={"obs": "Falta o laudo."}).json()
    assert r["conclusaoSolicitada"] is None and "Falta o laudo." in r["historico"][-1]["texto"]
    client.post(url(d["id"], "/solicitar-conclusao"), headers=carlos, json={"obs": "Laudo anexado."})
    r = client.post(url(d["id"], "/aprovar"), headers=gestor).json()
    assert r["status"] == "Concluída" and r["concluidaEm"]
    assert r["historico"][-1] == {
        **r["historico"][-1],
        "tipo": "conclusao",
        "texto": "Demanda concluída. Observação: Laudo anexado. (aprovada pelo Gestor)",
    }


def test_gestor_conclui_e_reabre_com_justificativa(client, gestor, carlos):
    d = achar(client, gestor, status="Aguardando documento")
    assert client.post(url(d["id"], "/status"), headers=gestor, json={"status": "Concluída"}).status_code == 409
    assert (
        client.post(url(d["id"], "/status"), headers=gestor, json={"status": "Concluída", "obs": "ok"}).json()["status"]
        == "Concluída"
    )
    if d["responsavel"] == "i1":
        assert client.post(url(d["id"], "/status"), headers=carlos, json={"status": "Em andamento"}).status_code == 403
    assert client.post(url(d["id"], "/status"), headers=gestor, json={"status": "Em andamento"}).status_code == 409
    r = client.post(
        url(d["id"], "/status"), headers=gestor, json={"status": "Em andamento", "obs": "Faltou vistoria"}
    ).json()
    assert r["status"] == "Em andamento" and r["concluidaEm"] is None
    assert r["historico"][-1]["texto"] == "Demanda reaberta (Em andamento). Motivo: Faltou vistoria"


# ------------------------------------------------------------------ conteúdo
def test_observacao_e_anexo_respeitam_permissao(client, carlos):
    aberta = achar(client, carlos, status="Em andamento")
    concluida = achar(client, carlos, status="Concluída")
    assert client.post(url(concluida["id"], "/observacoes"), headers=carlos, json={"texto": "x"}).status_code == 403
    assert client.post(url(aberta["id"], "/observacoes"), headers=carlos, json={"texto": " "}).status_code == 409
    r = client.post(url(aberta["id"], "/observacoes"), headers=carlos, json={"texto": "Empresa notificada."}).json()
    assert r["historico"][-1]["tipo"] == "observacao"
    r = client.post(
        url(aberta["id"], "/documentos"),
        headers=carlos,
        files={"arquivo": ("termo de inspeção.pdf", b"%PDF-1.4 teste", "application/pdf")},
    )
    assert r.status_code == 201
    doc = r.json()["docs"][-1]
    assert doc["arquivo"] and doc["tam"] == 14
    baixado = client.get(url(aberta["id"], f"/documentos/{doc['id']}"), headers=carlos)
    assert baixado.status_code == 200 and baixado.content == b"%PDF-1.4 teste"
    ruim = client.post(
        url(aberta["id"], "/documentos"),
        headers=carlos,
        files={"arquivo": ("x.exe", b"MZ", "application/octet-stream")},
    )
    assert ruim.status_code == 422


def test_documento_de_exemplo_sem_arquivo(client, gestor):
    d = achar(client, gestor, titulo="Denúncia de armazenamento inadequado de alimentos")
    r = client.get(url(d["id"], f"/documentos/{d['docs'][0]['id']}"), headers=gestor)
    assert r.status_code == 404 and "exemplo" in r.json()["detail"]


# ------------------------------------------------------------------ SEI, mapa, relatórios, restaurar
def test_sincronizacao_sei(client, gestor, carlos):
    assert client.post("/api/sync/sei", headers=carlos).status_code == 403
    r = client.post("/api/sync/sei", headers=gestor).json()
    assert (r["novos"], r["invalidos"]) == (8, 2)
    assert client.post("/api/sync/sei", headers=gestor).json()["novos"] == 0
    nova = achar(client, gestor, titulo="Denúncia de manipulação inadequada de carnes")
    assert (nova["origem"], nova["status"], nova["prioridade"], nova["bairro"]) == ("SEI", "Nova", "Alta", "Boa Viagem")


def test_mapa_agrupa_por_local_e_respeita_perfil(client, gestor, carlos):
    m = client.get("/api/mapa", headers=gestor).json()
    assert sum(len(p["demandas"]) for p in m["pontos"]) == 28
    assert all(-8.6 < p["lat"] < -7.6 and -35.3 < p["lng"] < -34.8 for p in m["pontos"])
    recife = [p for p in m["pontos"] if p["nivel"] == "bairro"]
    assert recife and all(p["rotulo"].endswith("· Recife") for p in recife)
    meu = client.get("/api/mapa", headers=carlos).json()
    assert sum(len(p["demandas"]) for p in meu["pontos"]) == 9


def test_relatorios_pdf(client, gestor, carlos):
    d = achar(client, gestor, responsavel="i2")
    r = client.get(url(d["id"], "/relatorio.pdf"), headers=gestor)
    assert r.status_code == 200 and r.content.startswith(b"%PDF") and r.headers["content-type"] == "application/pdf"
    assert client.get(url(d["id"], "/relatorio.pdf"), headers=carlos).status_code == 403
    for h in (gestor, carlos):
        r = client.get("/api/relatorios.pdf?dias=90", headers=h)
        assert r.status_code == 200 and r.content.startswith(b"%PDF")


def test_restaurar_dados_de_exemplo(client, gestor):
    client.post("/api/demandas", headers=gestor, json={"titulo": "Temporária", "prazo": HOJE.isoformat()})
    assert len(demandas(client, gestor)) == 29
    assert client.post("/api/restaurar", headers=gestor).status_code == 200
    h = entrar(client, "g1")
    assert len(demandas(client, h)) == 28
