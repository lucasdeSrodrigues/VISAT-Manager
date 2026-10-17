// Utilitários de interface: escape, formatação, rótulos de domínio, toasts e ícones.
export const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export const dataBR = iso => iso ? new Date(iso.length === 10 ? iso + "T12:00:00" : iso).toLocaleDateString("pt-BR") : "—";
export const dataHoraBR = iso => iso ? new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : "—";

export const TIPOS = {
  REQUISICAO_MPT: "Requisição do MPT",
  DENUNCIA_SINDICAL: "Denúncia sindical",
  DEMANDA_CONSELHO_SAUDE: "Demanda do Conselho de Saúde",
  ACIDENTE_GRAVE_FATAL: "Acidente de trabalho grave/fatal",
  DOENCA_TRABALHO: "Doença/agravo relacionado ao trabalho",
  INSPECAO_AMBIENTE: "Inspeção em ambiente de trabalho",
  SOLICITACAO_INFORMACAO: "Solicitação de informação",
};
export const ETAPAS = {
  RECEBIDA: "Solicitação recebida", TRIAGEM: "Triagem", INSPETOR_DESIGNADO: "Inspetor designado",
  INSPECAO_REALIZADA: "Inspeção realizada", RELATORIO: "Relatório", CONCLUIDA: "Concluída",
};
export const PRIORIDADES = { ALTA: "Alta", MEDIA: "Média", BAIXA: "Baixa" };
export const SAUDE = {
  VENCIDA: { rotulo: "Vencida", classe: "vencida" },
  URGENTE: { rotulo: "Urgente", classe: "urgente" },
  ATENCAO: { rotulo: "Atenção", classe: "atencao" },
  SEGURO: { rotulo: "Prazo seguro", classe: "seguro" },
  CONCLUIDA: { rotulo: "Concluída", classe: "concluida" },
};

export const pillPrioridade = p => `<span class="pill prio-${p.toLowerCase()}">${PRIORIDADES[p]}</span>`;
export const pillSaude = (s, texto) => `<span class="saude ${SAUDE[s].classe}"><i aria-hidden="true"></i>${esc(texto || SAUDE[s].rotulo)}</span>`;
export const pillOrigem = o => `<span class="pill origem">${o === "SEI" ? "SEI" : "Manual"}</span>`;

export function toast(msg, tipo = "ok") {
  const el = document.createElement("div");
  el.className = `toast ${tipo}`;
  el.textContent = msg;
  document.getElementById("toasts").append(el);
  setTimeout(() => el.classList.add("sai"), 3800);
  setTimeout(() => el.remove(), 4300);
}

const P = {
  painel: '<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
  lista: '<path d="M8 6h13M8 12h13M8 18h13"/><circle cx="3.5" cy="6" r="1"/><circle cx="3.5" cy="12" r="1"/><circle cx="3.5" cy="18" r="1"/>',
  equipe: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5"/><circle cx="17.5" cy="9" r="2.5"/><path d="M17 14.5c2.4.2 4 1.8 4.6 4.5"/>',
  mapa: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  radar: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><path d="M12 12l6-6"/>',
  relatorio: '<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 13h7M9 17h5"/>',
  sino: '<path d="M6 16V11a6 6 0 1 1 12 0v5l2 2H4z"/><path d="M10 21h4"/>',
  usuario: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4.4 4.2-6.5 8-6.5s7 2.1 8 6.5"/>',
  sair: '<path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h11"/>',
  sync: '<path d="M20 11a8 8 0 0 0-14.3-4.3L4 9M4 4v5h5M4 13a8 8 0 0 0 14.3 4.3L20 15M20 20v-5h-5"/>',
  mais: '<path d="M12 5v14M5 12h14"/>',
  voltar: '<path d="M15 6l-6 6 6 6"/>',
  clipe: '<path d="M20 11.5l-8 8a5 5 0 0 1-7-7l8.5-8.5a3.3 3.3 0 0 1 4.7 4.7L9.7 17.2a1.7 1.7 0 0 1-2.4-2.4L15 7"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
};
export const ico = (n, cls = "") => `<svg class="ico ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n]}</svg>`;
