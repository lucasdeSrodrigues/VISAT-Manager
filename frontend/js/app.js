// Roteador (hash) e casca da aplicação — segue o layout dos wireframes:
// barra superior escura com título, sino do Radar de Prazos e perfil; menu lateral.
import { api, sessao } from "./api.js";
import { esc, ico, toast } from "./ui.js";
import * as V from "./views.js";

const MENU = [
  { href: "#/dashboard", rotulo: "Dashboard", icone: "painel" },
  { href: "#/demandas", rotulo: "Demandas", icone: "lista" },
  { href: "#/inspetores", rotulo: "Inspetores", icone: "equipe", soGestor: true },
  { href: "#/radar", rotulo: "Radar de prazos", icone: "radar" },
  { rotulo: "Mapa", icone: "mapa", sprint: 3 },
  { rotulo: "Relatórios", icone: "relatorio", sprint: 4 },
];

const ROTAS = [
  [/^#\/dashboard$/, V.dashboard, "Dashboard"],
  [/^#\/demandas$/, V.lista, "Demandas"],
  [/^#\/demandas\/nova$/, V.nova, "Nova demanda"],
  [/^#\/demandas\/(\d+)$/, V.detalhe, "Demanda"],
  [/^#\/radar$/, V.radar, "Radar de prazos"],
  [/^#\/inspetores$/, V.inspetores, "Inspetores"],
];

function casca(usuario, titulo, alertas) {
  const gestor = usuario.perfil === "GESTOR";
  const rota = location.hash.split("?")[0];
  const itens = MENU.filter(m => !m.soGestor || gestor).map(m => m.sprint
    ? `<li><span class="nav-item desativado" title="Planejado para a Sprint ${m.sprint}">${ico(m.icone)}${m.rotulo}<small>Sprint ${m.sprint}</small></span></li>`
    : `<li><a class="nav-item ${rota.startsWith(m.href) ? "ativo" : ""}" href="${m.href}">${ico(m.icone)}${m.rotulo}</a></li>`).join("");
  return `
  <div class="app ${gestor ? "perfil-gestor" : "perfil-inspetor"}">
    <header class="topo">
      <button class="btn-icone menu-btn" id="btnMenu" aria-label="Abrir menu">${ico("menu")}</button>
      <a class="marca" href="#/dashboard" aria-label="VISAT Manager — início"><span class="logo-v">V</span><span>VISAT <b>Manager</b></span></a>
      <h1 class="titulo-pagina" id="tituloPagina" tabindex="-1">${esc(titulo)}</h1>
      <a class="sino" href="#/radar" title="Radar de prazos: demandas vencidas e urgentes">
        <span class="sino-n ${alertas ? "" : "zero"}">${alertas}</span>${ico("sino")}<span class="sino-txt">Radar de<br>prazos</span>
      </a>
      <div class="quem">${ico("usuario")}<div><strong>${gestor ? "Gestor" : "Inspetor"}</strong><span>${esc(usuario.nome)}</span></div></div>
      <button class="btn-icone" id="btnSair" title="Sair">${ico("sair")}<span class="sr-only">Sair</span></button>
    </header>
    <nav class="lateral" id="lateral" aria-label="Menu principal"><ul>${itens}</ul>
      <p class="lateral-rodape">Sprint 1 · v0.1<br>Dados fictícios (LGPD)</p></nav>
    <main id="conteudo" tabindex="-1"><div class="carregando">Carregando…</div></main>
  </div>`;
}

async function render() {
  const s = sessao.get();
  const hash = location.hash || "#/dashboard";
  const app = document.getElementById("app");
  if (!s || hash === "#/login") {
    if (s && hash === "#/login") { location.hash = "#/dashboard"; return; }
    app.innerHTML = V.login();
    V.ligarLogin(async (email, senha) => {
      const r = await api.login(email, senha);
      sessao.set(r);
      location.hash = "#/dashboard";
    });
    return;
  }
  const [rx, view, titulo] = ROTAS.find(([r]) => r.test(hash.split("?")[0])) || [];
  if (!view) { location.hash = "#/dashboard"; return; }
  let alertas = 0;
  try { alertas = (await api.dashboard()).alertas; } catch { /* 401 já redireciona */ if (!sessao.get()) return; }
  app.innerHTML = casca(s.usuario, titulo, alertas);
  document.getElementById("btnSair").onclick = async () => {
    try { await api.logout(); } catch { /* */ }
    sessao.limpar(); location.hash = "#/login";
  };
  document.getElementById("btnMenu").onclick = () => document.getElementById("lateral").classList.toggle("aberto");
  const main = document.getElementById("conteudo");
  try {
    await view(main, { usuario: s.usuario, params: hash.split("?")[0].match(rx).slice(1), query: new URLSearchParams(hash.split("?")[1] || ""), recarregar: render });
  } catch (e) {
    main.innerHTML = `<div class="vazio erro"><h2>Não foi possível carregar</h2><p>${esc(e.message)}</p><a class="btn" href="#/dashboard">Voltar ao dashboard</a></div>`;
    if (e.status !== 401) toast(e.message, "erro");
  }
  document.getElementById("tituloPagina").textContent = main.dataset.titulo || titulo;
}

window.addEventListener("hashchange", render);
render();
