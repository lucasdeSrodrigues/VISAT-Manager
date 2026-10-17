// Telas da Sprint 1 — Login, Dashboard, Lista, Cadastro, Detalhe, Radar, Inspetores.
import { api } from "./api.js";
import { ETAPAS, PRIORIDADES, SAUDE, TIPOS, dataBR, dataHoraBR, esc, ico, pillOrigem, pillPrioridade, pillSaude, toast } from "./ui.js";

const opcoes = (mapa, sel = "", vazio) =>
  (vazio ? `<option value="">${vazio}</option>` : "") +
  Object.entries(mapa).map(([k, v]) => `<option value="${k}" ${k === sel ? "selected" : ""}>${esc(v)}</option>`).join("");

const linkDemanda = d => `<a class="cod" href="#/demandas/${d.id}">${esc(d.codigo)}</a>`;

// ---------------------------------------------------------------- Login (US01)
export function login() {
  return `
  <div class="login-pg">
    <section class="login-card" aria-labelledby="tLogin">
      <div class="marca grande"><span class="logo-v">V</span><span>VISAT <b>Manager</b></span></div>
      <p class="login-sub">Gestão das demandas de Vigilância em Saúde do Trabalhador — Recife</p>
      <h1 id="tLogin" class="sr-only">Entrar</h1>
      <form id="fLogin" novalidate>
        <label>E-mail<input name="email" type="email" autocomplete="username" required></label>
        <label>Senha<input name="senha" type="password" autocomplete="current-password" required></label>
        <p class="erro-form" id="erroLogin" role="alert"></p>
        <button class="btn primario largo" type="submit">Entrar</button>
      </form>
      <div class="demo">
        <span>Acesso de demonstração</span>
        <button class="btn peq" data-demo="gestor@visat.demo">${ico("usuario")} Gestor</button>
        <button class="btn peq" data-demo="rodrigo@visat.demo">${ico("usuario")} Inspetor</button>
      </div>
      <p class="aviso-lgpd">Ambiente acadêmico · todos os dados são fictícios</p>
    </section>
  </div>`;
}

export function ligarLogin(entrar) {
  const f = document.getElementById("fLogin");
  const erro = document.getElementById("erroLogin");
  f.onsubmit = async ev => {
    ev.preventDefault();
    erro.textContent = "";
    const { email, senha } = Object.fromEntries(new FormData(f));
    if (!email || !senha) { erro.textContent = "Informe e-mail e senha."; return; }
    const b = f.querySelector("button[type=submit]");
    b.disabled = true; b.textContent = "Entrando…";
    try { await entrar(email, senha); } catch (e) { erro.textContent = e.message; b.disabled = false; b.textContent = "Entrar"; }
  };
  document.querySelectorAll("[data-demo]").forEach(b => b.onclick = () => {
    f.email.value = b.dataset.demo; f.senha.value = "visat123"; f.requestSubmit();
  });
  f.email.focus();
}

// ------------------------------------------------------------ Dashboard (US07)
export async function dashboard(main, { usuario }) {
  const gestor = usuario.perfil === "GESTOR";
  const [k, radar] = await Promise.all([api.dashboard(), api.radar()]);
  const criticas = [...radar.grupos.VENCIDA, ...radar.grupos.URGENTE, ...radar.grupos.ATENCAO].slice(0, 6);
  const maxCarga = Math.max(1, ...k.carga_por_inspetor.map(c => c.abertas));
  main.dataset.titulo = "Dashboard";
  main.innerHTML = `
  <div class="pagina-topo">
    <div><h2 class="h-sec">Visão geral</h2><p class="sub">${gestor ? "Todas as demandas da VISAT" : "Demandas sob sua responsabilidade"} · atualizado ${new Date().toLocaleTimeString("pt-BR", { timeStyle: "short" })}</p></div>
    <div class="acoes">
      ${gestor ? `<button class="btn" id="btnSync">${ico("sync")} Sincronizar com SEI</button>` : ""}
      <a class="btn primario" href="#/demandas/nova">${ico("mais")} Nova demanda</a>
    </div>
  </div>
  <div id="resSync"></div>
  <div class="kpis">
    <a class="kpi" href="#/demandas"><span class="kpi-n">${k.recebidas}</span><span class="kpi-r">Recebidas</span></a>
    <a class="kpi" href="#/demandas?abertas=1"><span class="kpi-n">${k.em_andamento}</span><span class="kpi-r">Em andamento</span></a>
    <a class="kpi" href="#/demandas?etapa=CONCLUIDA"><span class="kpi-n">${k.concluidas}</span><span class="kpi-r">Concluídas</span></a>
    <a class="kpi alerta" href="#/radar"><span class="kpi-n">${k.radar.VENCIDA}</span><span class="kpi-r">Vencidas</span></a>
  </div>
  <div class="grade g-dash">
    <section class="card">
      <div class="card-topo"><h2>${ico("radar")} Radar de prazos</h2><a href="#/radar">Ver completo</a></div>
      <div class="faixas">
        ${["VENCIDA", "URGENTE", "ATENCAO", "SEGURO"].map(f => `<div class="faixa ${SAUDE[f].classe}"><b>${k.radar[f]}</b><span>${SAUDE[f].rotulo}</span></div>`).join("")}
      </div>
      ${criticas.length ? `<ul class="radar-lista">${criticas.map(d => `
        <li><a href="#/demandas/${d.id}"><span class="dot ${SAUDE[d.saude].classe}"></span>
          <span class="rl-cod">${esc(d.codigo)}</span><span class="rl-txt">${esc(TIPOS[d.tipo_ocorrencia])}</span>
          <span class="rl-prazo">${esc(d.prazo_texto)}</span><span class="rl-insp">${esc(d.responsavel?.nome || "Sem responsável")}</span></a></li>`).join("")}</ul>`
        : `<p class="vazio-mini">Nenhuma demanda em risco de prazo. ${ico("check")}</p>`}
    </section>
    <section class="card">
      <h2>Indicadores</h2>
      <dl class="indic">
        <div><dt>Tempo médio de resposta</dt><dd>${k.tempo_medio_resposta_dias ?? "—"} <small>dias</small></dd></div>
        <div><dt>Concluídas no prazo</dt><dd>${k.pct_concluidas_no_prazo ?? "—"}<small>%</small></dd></div>
        <div><dt>Sem responsável</dt><dd>${k.sem_responsavel}</dd></div>
      </dl>
      ${gestor ? `<h3 class="h-mini">Carga por inspetor (abertas)</h3>
      <ul class="barras">${k.carga_por_inspetor.map(c => `<li><span>${esc(c.nome)}</span><div class="barra"><i style="width:${100 * c.abertas / maxCarga}%"></i></div><b>${c.abertas}</b></li>`).join("")}</ul>` : ""}
      <h3 class="h-mini">Principais tipos de ocorrência</h3>
      <ul class="tipos">${k.por_tipo.slice(0, 4).map(([t, n]) => `<li><span>${esc(TIPOS[t])}</span><b>${n}</b></li>`).join("")}</ul>
    </section>
  </div>`;
  const b = document.getElementById("btnSync");
  if (b) b.onclick = async () => {
    b.disabled = true; b.innerHTML = `${ico("sync", "gira")} Sincronizando…`;
    try {
      const r = await api.sincronizar();
      sessionStorage.setItem("visat.ultimoSync", JSON.stringify(r));
      toast(r.novos ? `${r.novos} nova(s) demanda(s) importada(s) do SEI.` : "Nenhuma demanda nova no SEI.");
      await dashboard(main, { usuario });
      mostrarSync(r);
    } catch (e) { toast(e.message, "erro"); b.disabled = false; b.innerHTML = `${ico("sync")} Sincronizar com SEI`; }
  };
}

function mostrarSync(r) {
  const el = document.getElementById("resSync");
  if (!el) return;
  el.innerHTML = `
  <div class="banner">
    <div><strong>Sincronização SEI concluída</strong> — lidos ${r.lidos} · <b>novos ${r.novos}</b> · já existentes ${r.duplicados} · rejeitados ${r.invalidos}
    ${r.erros.length ? `<details><summary>Ver registros rejeitados</summary><ul>${r.erros.map(e => `<li>${esc(e)}</li>`).join("")}</ul></details>` : ""}</div>
    <a class="btn peq" href="#/demandas?origem=SEI&ordenar=-entrada">Ver importadas</a>
  </div>`;
}

// -------------------------------------------------------------- Lista (US04)
export async function lista(main, { usuario, query }) {
  const gestor = usuario.perfil === "GESTOR";
  const f = {
    q: query.get("q") || "", etapa: query.get("etapa") || "", prioridade: query.get("prioridade") || "",
    origem: query.get("origem") || "", responsavel_id: query.get("responsavel_id") || "",
    saude: query.get("saude") || "", abertas: query.get("abertas") === "1",
    sem_responsavel: query.get("sem_responsavel") === "1",
    ordenar: query.get("ordenar") || "prazo", pagina: +query.get("pagina") || 1,
  };
  const [pg, insps] = await Promise.all([api.listar({ ...f, por_pagina: 12 }), gestor ? api.inspetores() : []]);
  const paginas = Math.max(1, Math.ceil(pg.total / pg.por_pagina));
  main.innerHTML = `
  <div class="pagina-topo">
    <div><h2 class="h-sec">Painel central de demandas</h2><p class="sub">${pg.total} demanda(s) · SEI e cadastro manual no mesmo fluxo</p></div>
    <a class="btn primario" href="#/demandas/nova">${ico("mais")} Nova demanda</a>
  </div>
  <form class="filtros card" id="fFiltros">
    <label class="busca">Buscar<input name="q" value="${esc(f.q)}" placeholder="Código, órgão, empresa, município…"></label>
    <label>Status<select name="etapa">${opcoes(ETAPAS, f.etapa, "Todos")}</select></label>
    <label>Prioridade<select name="prioridade">${opcoes(PRIORIDADES, f.prioridade, "Todas")}</select></label>
    <label>Origem<select name="origem">${opcoes({ SEI: "SEI", MANUAL: "Manual" }, f.origem, "Todas")}</select></label>
    ${gestor ? `<label>Responsável<select name="responsavel_id"><option value="">Todos</option>${insps.map(i => `<option value="${i.id}" ${String(i.id) === f.responsavel_id ? "selected" : ""}>${esc(i.nome)}</option>`).join("")}</select></label>` : ""}
    <label>Prazo<select name="saude">${opcoes({ VENCIDA: "Vencidas", URGENTE: "Urgentes", ATENCAO: "Atenção", SEGURO: "Prazo seguro" }, f.saude, "Todos")}</select></label>
    <label>Ordenar<select name="ordenar">${opcoes({ prazo: "Prazo mais próximo", "-prazo": "Prazo mais distante", "-entrada": "Entrada mais recente", entrada: "Entrada mais antiga" }, f.ordenar)}</select></label>
    <div class="filtros-acoes">
      <label class="chk"><input type="checkbox" name="abertas" value="1" ${f.abertas ? "checked" : ""}> Só abertas</label>
      ${gestor ? `<label class="chk"><input type="checkbox" name="sem_responsavel" value="1" ${f.sem_responsavel ? "checked" : ""}> Sem responsável</label>` : ""}
      <a class="btn peq" href="#/demandas">Limpar</a>
    </div>
  </form>
  ${pg.itens.length ? `
  <div class="card tabela-wrap">
    <table class="tabela">
      <thead><tr><th>Demanda</th><th>Ocorrência</th><th>Órgão / Empresa</th><th>Município</th><th>Prioridade</th><th>Status</th><th>Prazo legal</th><th>Responsável</th></tr></thead>
      <tbody>${pg.itens.map(d => `
        <tr data-id="${d.id}">
          <td>${linkDemanda(d)}<div>${pillOrigem(d.origem)}</div></td>
          <td>${esc(TIPOS[d.tipo_ocorrencia])}</td>
          <td><div>${esc(d.orgao_demandante)}</div><small class="mut">${esc(d.empresa || "—")}</small></td>
          <td>${esc(d.municipio)}</td>
          <td>${pillPrioridade(d.prioridade)}</td>
          <td><span class="etapa">${esc(d.etapa_rotulo)}</span></td>
          <td><div>${dataBR(d.prazo_legal)}</div>${pillSaude(d.saude, d.prazo_texto)}</td>
          <td>${esc(d.responsavel?.nome || "—")}</td>
        </tr>`).join("")}</tbody>
    </table>
  </div>
  <nav class="paginacao" aria-label="Paginação">
    <button class="btn peq" data-pg="${f.pagina - 1}" ${f.pagina <= 1 ? "disabled" : ""}>Anterior</button>
    <span>Página ${f.pagina} de ${paginas}</span>
    <button class="btn peq" data-pg="${f.pagina + 1}" ${f.pagina >= paginas ? "disabled" : ""}>Próxima</button>
  </nav>` : `<div class="vazio"><h2>Nenhuma demanda encontrada</h2><p>Ajuste os filtros ou cadastre uma nova demanda.</p></div>`}`;

  const form = document.getElementById("fFiltros");
  const aplicar = (pagina = 1) => {
    const p = new URLSearchParams();
    for (const [k, v] of new FormData(form)) if (v && !(k === "ordenar" && v === "prazo")) p.set(k, v);
    if (pagina > 1) p.set("pagina", pagina);
    location.hash = "#/demandas" + (p.toString() ? "?" + p : "");
  };
  form.onchange = () => aplicar();
  form.onsubmit = e => { e.preventDefault(); aplicar(); };
  let t; form.q.oninput = () => { clearTimeout(t); t = setTimeout(aplicar, 450); };
  main.querySelectorAll("[data-pg]").forEach(b => b.onclick = () => aplicar(+b.dataset.pg));
  main.querySelectorAll("tr[data-id]").forEach(tr => tr.onclick = e => { if (!e.target.closest("a")) location.hash = `#/demandas/${tr.dataset.id}`; });
  if (f.q) { form.q.focus(); form.q.setSelectionRange(f.q.length, f.q.length); }
}

// ----------------------------------------------------- Cadastro manual (US03)
export async function nova(main) {
  const hoje = new Date().toISOString().slice(0, 10);
  main.innerHTML = `
  <div class="pagina-topo"><div><a class="voltar" href="#/demandas">${ico("voltar")} Demandas</a>
    <h2 class="h-sec">Cadastro manual de demanda</h2>
    <p class="sub">Para demandas recebidas fora do SEI (ofício, e-mail, presencial). Após o cadastro, seguem o mesmo fluxo.</p></div></div>
  <form class="card form" id="fNova" novalidate>
    <div class="campos">
      <label class="obr">Tipo de ocorrência<select name="tipo_ocorrencia" required>${opcoes(TIPOS, "", "Selecione…")}</select></label>
      <label class="obr">Órgão demandante<input name="orgao_demandante" required minlength="3" maxlength="160" placeholder="Ex.: Ministério Público do Trabalho"></label>
      <label class="obr">Município<input name="municipio" required minlength="2" maxlength="80" value="Recife"></label>
      <label>Empresa / ambiente de trabalho<input name="empresa" maxlength="160"></label>
      <label>Ramo de atividade (opcional)<input name="ramo_atividade" maxlength="120" placeholder="Ex.: Construção civil"></label>
      <label class="obr">Prioridade<select name="prioridade">${opcoes(PRIORIDADES, "MEDIA")}</select></label>
      <label class="obr">Data de entrada<input type="date" name="data_entrada" value="${hoje}" max="${hoje}" required></label>
      <label>Prazo legal<input type="date" name="prazo_legal" min="${hoje}"><small>Se vazio, aplica o prazo padrão do tipo de ocorrência.</small></label>
      <label class="obr inteiro">Descrição da demanda<textarea name="descricao" rows="4" required minlength="10" maxlength="4000" placeholder="Resumo do que foi solicitado ou denunciado (sem dados pessoais desnecessários)."></textarea></label>
    </div>
    <p class="erro-form" id="erroNova" role="alert"></p>
    <div class="form-acoes"><a class="btn" href="#/demandas">Cancelar</a><button class="btn primario" type="submit">Cadastrar demanda</button></div>
  </form>`;
  const f = document.getElementById("fNova");
  f.data_entrada.onchange = () => { f.prazo_legal.min = f.data_entrada.value; };
  f.onsubmit = async e => {
    e.preventDefault();
    const erro = document.getElementById("erroNova");
    erro.textContent = "";
    f.querySelectorAll(".invalido").forEach(x => x.classList.remove("invalido"));
    const invalidos = [...f.elements].filter(el => el.willValidate && !el.checkValidity());
    if (invalidos.length) {
      invalidos.forEach(el => el.closest("label").classList.add("invalido"));
      erro.textContent = "Preencha corretamente os campos destacados.";
      invalidos[0].focus(); return;
    }
    const dados = Object.fromEntries([...new FormData(f)].filter(([, v]) => v !== ""));
    const b = f.querySelector("button[type=submit]"); b.disabled = true;
    try {
      const d = await api.criar(dados);
      toast(`Demanda ${d.codigo} cadastrada.`);
      location.hash = `#/demandas/${d.id}`;
    } catch (ex) { erro.textContent = ex.message; b.disabled = false; }
  };
}

// --------------------------------------- Detalhe + linha do tempo (US05)
const ORDEM = Object.keys(ETAPAS);

export async function detalhe(main, { usuario, params }) {
  const id = params[0];
  const d = await api.ver(id);
  const gestor = usuario.perfil === "GESTOR";
  const insps = d.pode_atribuir ? await api.inspetores() : [];
  const idxAtual = ORDEM.indexOf(d.etapa);
  const dataEtapa = Object.fromEntries(d.movimentacoes.filter(m => m.etapa).map(m => [m.etapa, m.criada_em]));
  const prox = d.etapas_permitidas[0];
  const pct = Math.round(100 * idxAtual / (ORDEM.length - 1));
  main.dataset.titulo = `Demanda #${d.codigo}`;
  main.innerHTML = `
  <div class="pagina-topo">
    <div><a class="voltar" href="#/demandas">${ico("voltar")} Demandas</a>
      <h2 class="h-sec">${esc(TIPOS[d.tipo_ocorrencia])}</h2>
      <p class="sub">${pillOrigem(d.origem)} ${d.numero_sei ? `Processo SEI <span class="mono">${esc(d.numero_sei)}</span>` : "Cadastro manual"}</p></div>
    <div class="acoes">${pillPrioridade(d.prioridade)}</div>
  </div>
  <div class="grade g-det">
    <div class="col">
      <section class="card">
        <h2>Ocorrência</h2>
        <dl class="ficha">
          <div><dt>Órgão solicitante</dt><dd>${esc(d.orgao_demandante)}</dd></div>
          <div><dt>Município</dt><dd>${esc(d.municipio)}</dd></div>
          <div><dt>Empresa / ambiente</dt><dd>${esc(d.empresa || "—")}</dd></div>
          <div><dt>Ramo de atividade</dt><dd>${esc(d.ramo_atividade || "—")}</dd></div>
          <div><dt>Data de entrada</dt><dd>${dataBR(d.data_entrada)}</dd></div>
          <div><dt>Prazo legal</dt><dd>${dataBR(d.prazo_legal)}</dd></div>
          <div><dt>Responsável</dt><dd>${esc(d.responsavel?.nome || "Não atribuído")}</dd></div>
          <div><dt>Status</dt><dd>${esc(d.etapa_rotulo)}</dd></div>
        </dl>
        <p class="descricao">${esc(d.descricao)}</p>
      </section>

      <section class="card">
        <h2>Linha do tempo</h2>
        <ol class="timeline">${ORDEM.map((e, i) => `
          <li class="${i < idxAtual || d.etapa === "CONCLUIDA" ? "feito" : i === idxAtual ? "atual" : "pendente"}">
            <span class="marco" aria-hidden="true">${i <= idxAtual ? ico("check") : ""}</span>
            <div><strong>${ETAPAS[e]}</strong><small>${dataEtapa[e] ? dataHoraBR(dataEtapa[e]) : i === idxAtual + 1 && prox ? "Próxima etapa" : "—"}</small></div>
          </li>`).join("")}</ol>
        ${prox ? `
        <form class="avancar" id="fAvancar">
          <label>Observação da etapa (opcional)<input name="descricao" maxlength="2000" placeholder="Ex.: vistoria realizada com o técnico de segurança da empresa"></label>
          <button class="btn primario" type="submit">${ico("check")} Registrar: ${ETAPAS[prox]}</button>
        </form>` : d.etapa === "CONCLUIDA" ? `<p class="nota ok">Demanda concluída em ${dataBR(d.concluida_em)}.</p>`
          : `<p class="nota">${d.etapa === "TRIAGEM" && gestor ? "Atribua um inspetor ao lado para registrar a designação." : d.etapa === "RELATORIO" && !gestor ? "Relatório entregue. Aguardando conclusão pelo gestor." : "A próxima etapa é registrada por outro perfil."}</p>`}
      </section>

      <section class="card">
        <div class="abas" role="tablist">
          <button role="tab" class="aba ativa" data-aba="hist" aria-selected="true">Histórico (${d.movimentacoes.length})</button>
          <button role="tab" class="aba" data-aba="docs" aria-selected="false">Documentos (${d.documentos.length})</button>
        </div>
        <div data-painel="hist">
          <form class="obs" id="fObs"><input name="descricao" placeholder="Registrar observação no histórico…" minlength="3" maxlength="2000" required><button class="btn" type="submit">Registrar</button></form>
          <ul class="historico">${[...d.movimentacoes].reverse().map(m => `
            <li><span class="h-tag ${m.etapa ? "etapa" : ""}">${esc(m.rotulo)}</span>
              <p>${esc(m.descricao)}</p><small>${esc(m.autor)} · ${dataHoraBR(m.criada_em)}</small></li>`).join("")}</ul>
        </div>
        <div data-painel="docs" hidden>
          <label class="upload">${ico("clipe")} Anexar documento <input type="file" id="arquivo" accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.odt,.txt"></label>
          <small class="mut">PDF, imagem ou texto · até 10 MB</small>
          ${d.documentos.length ? `<ul class="docs">${d.documentos.map(x => `
            <li><button class="link" data-doc="${x.id}">${esc(x.nome)}</button><small>${x.tamanho < 1024 ? x.tamanho + " bytes" : (x.tamanho / 1024).toFixed(1) + " KB"} · ${esc(x.autor)} · ${dataHoraBR(x.criado_em)}</small></li>`).join("")}</ul>`
            : `<p class="vazio-mini">Nenhum documento anexado.</p>`}
        </div>
      </section>
    </div>

    <aside class="col">
      <section class="card saude-card ${SAUDE[d.saude].classe}">
        <h2>Saúde da demanda</h2>
        <div class="saude-grande"><span class="sg-dot"></span><div><strong>${SAUDE[d.saude].rotulo}</strong><span>${esc(d.prazo_texto)}</span></div></div>
        <dl class="ficha mini">
          <div><dt>Prazo legal</dt><dd>${dataBR(d.prazo_legal)}</dd></div>
          <div><dt>Etapa atual</dt><dd>${esc(d.etapa_rotulo)}</dd></div>
        </dl>
        <div class="progresso" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" aria-label="Progresso do fluxo"><i style="width:${pct}%"></i></div>
        <small class="mut">${idxAtual} de ${ORDEM.length - 1} etapas concluídas</small>
      </section>
      ${d.pode_atribuir ? `
      <section class="card">
        <h2>Responsável</h2>
        <form id="fAtribuir" class="pilha">
          <select name="responsavel_id" required aria-label="Inspetor responsável"><option value="">Selecione o inspetor…</option>
            ${insps.map(i => `<option value="${i.id}" ${i.id === d.responsavel?.id ? "selected" : ""}>${esc(i.nome)}</option>`).join("")}</select>
          <button class="btn primario" type="submit">${d.responsavel ? "Reatribuir" : "Atribuir"}</button>
        </form>
      </section>
      <section class="card">
        <h2>Editar</h2>
        <form id="fEditar" class="pilha">
          <label>Prioridade<select name="prioridade">${opcoes(PRIORIDADES, d.prioridade)}</select></label>
          <label>Prazo legal<input type="date" name="prazo_legal" value="${d.prazo_legal}" min="${d.data_entrada}"></label>
          <button class="btn" type="submit">Salvar alterações</button>
        </form>
      </section>` : ""}
      <button class="btn largo" disabled title="Planejado para a Sprint 4">${ico("relatorio")} Gerar relatório <small>Sprint 4</small></button>
    </aside>
  </div>`;

  const recarregar = async (novo, msg) => { if (msg) toast(msg); await detalhe(main, { usuario, params }); document.getElementById("tituloPagina").textContent = main.dataset.titulo; };
  const acao = (formId, fn) => {
    const f = document.getElementById(formId);
    if (!f) return;
    f.onsubmit = async e => {
      e.preventDefault();
      const b = f.querySelector("button"); b.disabled = true;
      try { const [r, msg] = await fn(Object.fromEntries(new FormData(f))); await recarregar(r, msg); }
      catch (ex) { toast(ex.message, "erro"); b.disabled = false; }
    };
  };
  acao("fAvancar", async v => [await api.avancar(id, prox, v.descricao), `Etapa "${ETAPAS[prox]}" registrada.`]);
  acao("fAtribuir", async v => [await api.atribuir(id, +v.responsavel_id), "Responsável atualizado."]);
  acao("fEditar", async v => [await api.editar(id, v), "Alterações salvas."]);
  acao("fObs", async v => [await api.observar(id, v.descricao), "Observação registrada."]);
  main.querySelectorAll(".aba").forEach(a => a.onclick = () => {
    main.querySelectorAll(".aba").forEach(x => { x.classList.toggle("ativa", x === a); x.setAttribute("aria-selected", x === a); });
    main.querySelectorAll("[data-painel]").forEach(p => p.hidden = p.dataset.painel !== a.dataset.aba);
  });
  document.getElementById("arquivo").onchange = async e => {
    const arq = e.target.files[0]; if (!arq) return;
    try { await api.anexar(id, arq); await recarregar(null, "Documento anexado."); main.querySelector('[data-aba="docs"]').click(); }
    catch (ex) { toast(ex.message, "erro"); }
  };
  main.querySelectorAll("[data-doc]").forEach(b => b.onclick = () => api.baixar(id, d.documentos.find(x => x.id === +b.dataset.doc)).catch(ex => toast(ex.message, "erro")));
}

// ------------------------------------------------------- Radar de prazos (US06)
export async function radar(main) {
  const r = await api.radar();
  const desc = {
    VENCIDA: "Prazo legal já expirou", URGENTE: `Vencem em até ${r.limites.urgente} dias`,
    ATENCAO: `Vencem em até ${r.limites.atencao} dias`, SEGURO: `Mais de ${r.limites.atencao} dias de prazo`,
  };
  main.innerHTML = `
  <div class="pagina-topo"><div><h2 class="h-sec">Radar de prazos</h2><p class="sub">Demandas abertas agrupadas pela distância até o prazo legal</p></div></div>
  <div class="radar">${["VENCIDA", "URGENTE", "ATENCAO", "SEGURO"].map(f => `
    <section class="grupo ${SAUDE[f].classe}">
      <h2><span class="dot ${SAUDE[f].classe}"></span>${SAUDE[f].rotulo} <b>${r.grupos[f].length}</b><small>${desc[f]}</small></h2>
      ${f === "SEGURO" ? `<p class="seguro-resumo">${r.grupos[f].length} demanda(s) com prazo confortável. <a href="#/demandas?saude=SEGURO">Ver lista</a></p>`
        : r.grupos[f].length ? `<ul>${r.grupos[f].map(d => `
        <li><a href="#/demandas/${d.id}">
          <span class="rg-cod">${esc(d.codigo)}<small>${esc(TIPOS[d.tipo_ocorrencia])}</small></span>
          <span class="rg-prazo">${esc(d.prazo_texto)}<small>${dataBR(d.prazo_legal)}</small></span>
          <span class="rg-insp">${esc(d.responsavel?.nome || "Sem responsável")}<small>${esc(d.etapa_rotulo)}</small></span></a></li>`).join("")}</ul>`
        : `<p class="vazio-mini">Nenhuma demanda nesta faixa.</p>`}
    </section>`).join("")}</div>`;
}

// ------------------------------------------------------------ Inspetores
export async function inspetores(main, { usuario }) {
  if (usuario.perfil !== "GESTOR") { location.hash = "#/dashboard"; return; }
  const [k, insps, abertas] = await Promise.all([api.dashboard(), api.inspetores(), api.listar({ abertas: true, por_pagina: 100 })]);
  const stats = Object.fromEntries(insps.map(i => [i.id, { vencidas: 0, urgentes: 0, total: 0 }]));
  abertas.itens.forEach(d => { const s = d.responsavel && stats[d.responsavel.id]; if (!s) return; s.total++; if (d.saude === "VENCIDA") s.vencidas++; if (d.saude === "URGENTE") s.urgentes++; });
  const max = Math.max(1, ...Object.values(stats).map(s => s.total));
  main.innerHTML = `
  <div class="pagina-topo"><div><h2 class="h-sec">Inspetores</h2><p class="sub">Distribuição da carga de trabalho · ${k.sem_responsavel} demanda(s) aberta(s) sem responsável</p></div>
    ${k.sem_responsavel ? `<a class="btn" href="#/demandas?sem_responsavel=1&abertas=1">Distribuir pendentes</a>` : ""}</div>
  <div class="card tabela-wrap"><table class="tabela">
    <thead><tr><th>Inspetor</th><th>Demandas abertas</th><th>Vencidas</th><th>Urgentes</th><th></th></tr></thead>
    <tbody>${insps.map(i => `<tr>
      <td><strong>${esc(i.nome)}</strong><br><small class="mut">${esc(i.email)}</small></td>
      <td><div class="barra-cel"><div class="barra"><i style="width:${100 * stats[i.id].total / max}%"></i></div><b>${stats[i.id].total}</b></div></td>
      <td>${stats[i.id].vencidas ? pillSaude("VENCIDA", String(stats[i.id].vencidas)) : "0"}</td>
      <td>${stats[i.id].urgentes ? pillSaude("URGENTE", String(stats[i.id].urgentes)) : "0"}</td>
      <td><a class="btn peq" href="#/demandas?responsavel_id=${i.id}&abertas=1">Ver demandas</a></td></tr>`).join("")}</tbody>
  </table></div>`;
}
