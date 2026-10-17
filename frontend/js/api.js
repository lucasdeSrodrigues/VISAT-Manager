// Cliente da API REST do VISAT Manager. Guarda o token da sessão no sessionStorage.
const CHAVE = "visat.sessao";

export const sessao = {
  get() { try { return JSON.parse(sessionStorage.getItem(CHAVE)); } catch { return null; } },
  set(s) { try { sessionStorage.setItem(CHAVE, JSON.stringify(s)); } catch { /* modo privado */ } },
  limpar() { try { sessionStorage.removeItem(CHAVE); } catch { /* */ } },
};

export class ErroApi extends Error {
  constructor(status, msg) { super(msg); this.status = status; }
}

function mensagem(corpo, status) {
  const d = corpo && corpo.detail;
  if (Array.isArray(d)) return d.map(e => (e.msg || "").replace(/^Value error, /, "")).join(" ");
  if (typeof d === "string") return d;
  return `Erro ${status}`;
}

async function req(metodo, caminho, { json, form, params } = {}) {
  const url = new URL(caminho, location.origin);
  if (params) for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "" || v === false) continue;
    (Array.isArray(v) ? v : [v]).forEach(x => url.searchParams.append(k, x));
  }
  const headers = {};
  const s = sessao.get();
  if (s) headers.Authorization = `Bearer ${s.token}`;
  let body;
  if (json !== undefined) { headers["Content-Type"] = "application/json"; body = JSON.stringify(json); }
  if (form) body = form;
  const r = await fetch(url, { method: metodo, headers, body });
  if (r.status === 204) return null;
  const corpo = await r.json().catch(() => null);
  if (!r.ok) {
    if (r.status === 401 && caminho !== "/api/auth/login") {
      sessao.limpar();
      location.hash = "#/login";
    }
    throw new ErroApi(r.status, mensagem(corpo, r.status));
  }
  return corpo;
}

export const api = {
  login: (email, senha) => req("POST", "/api/auth/login", { json: { email, senha } }),
  logout: () => req("POST", "/api/auth/logout"),
  dashboard: () => req("GET", "/api/dashboard"),
  radar: () => req("GET", "/api/radar"),
  inspetores: () => req("GET", "/api/inspetores"),
  sincronizar: () => req("POST", "/api/sync/sei"),
  listar: params => req("GET", "/api/demandas", { params }),
  criar: dados => req("POST", "/api/demandas", { json: dados }),
  ver: id => req("GET", `/api/demandas/${id}`),
  editar: (id, dados) => req("PATCH", `/api/demandas/${id}`, { json: dados }),
  avancar: (id, etapa, descricao) => req("POST", `/api/demandas/${id}/avancar`, { json: { etapa, descricao } }),
  atribuir: (id, responsavel_id) => req("POST", `/api/demandas/${id}/atribuir`, { json: { responsavel_id } }),
  observar: (id, descricao) => req("POST", `/api/demandas/${id}/observacoes`, { json: { descricao } }),
  anexar: (id, arquivo) => { const f = new FormData(); f.append("arquivo", arquivo); return req("POST", `/api/demandas/${id}/documentos`, { form: f }); },
  async baixar(id, doc) {
    const r = await fetch(`/api/demandas/${id}/documentos/${doc.id}`, { headers: { Authorization: `Bearer ${sessao.get().token}` } });
    if (!r.ok) throw new ErroApi(r.status, "Não foi possível baixar o documento.");
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(await r.blob()), download: doc.nome });
    a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  },
};
