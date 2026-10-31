// Valores exatamente como o back-end Django espera (veja chamados/models.py).
export const STATUS = [
  { valor: "Aberto", cor: "var(--status-open)", classe: "aberto" },
  { valor: "Em andamento", cor: "var(--status-progress)", classe: "andamento" },
  { valor: "Pendente", cor: "var(--status-pending)", classe: "pendente" },
  { valor: "Resolvido", cor: "var(--status-resolved)", classe: "resolvido" },
];
export const PRIORIDADES = ["Baixa", "Média", "Alta"];
export const TIPOS_INTERACAO = ["Observação", "Atendimento", "Alteração de status", "Solução"];
export const LIMITE_TITULO = 150;

export const classeDoStatus = (valor) => STATUS.find((s) => s.valor === valor)?.classe ?? "aberto";
export const classeDaPrioridade = (p) => ({ Alta: "alta", Média: "media", Baixa: "baixa" })[p] ?? "media";

export const FILTROS_VAZIOS = { busca: "", status: "", prioridade: "", ordem: "recentes" };

export function resumir(lista) {
  const porStatus = Object.fromEntries(STATUS.map((s) => [s.valor, 0]));
  for (const c of lista) if (c.status in porStatus) porStatus[c.status] += 1;
  return { total: lista.length, porStatus };
}

const normalizar = (t) => (t ?? "").toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export function filtrarChamados(lista, filtros, nomeDoCliente = () => "") {
  const termo = normalizar(filtros.busca).trim().replace(/^#/, "");
  const resultado = lista.filter((c) => {
    if (filtros.status && c.status !== filtros.status) return false;
    if (filtros.prioridade && c.prioridade !== filtros.prioridade) return false;
    if (!termo) return true;
    return (
      String(c.id) === termo ||
      normalizar(c.titulo).includes(termo) ||
      normalizar(c.descricao).includes(termo) ||
      normalizar(nomeDoCliente(c.cliente)).includes(termo)
    );
  });
  const fator = filtros.ordem === "antigos" ? 1 : -1;
  return resultado.sort((a, b) => fator * (new Date(a.data_abertura) - new Date(b.data_abertura) || a.id - b.id));
}

export const FORM_VAZIO = { titulo: "", descricao: "", status: "Aberto", prioridade: "Média", cliente: "" };

export const formDoChamado = (c) => ({
  titulo: c.titulo,
  descricao: c.descricao,
  status: c.status,
  prioridade: c.prioridade,
  cliente: c.cliente ?? "",
});

// Só envia campos graváveis: nunca id, data_abertura ou data_atualizacao.
export const payloadDoChamado = (f) => ({
  titulo: f.titulo.trim(),
  descricao: f.descricao.trim(),
  status: f.status,
  prioridade: f.prioridade,
  cliente: f.cliente === "" ? null : Number(f.cliente),
});

export function validarChamado(f) {
  const erros = {};
  const titulo = f.titulo.trim();
  if (!titulo) erros.titulo = "Informe o título do chamado.";
  else if (titulo.length < 3) erros.titulo = "O título precisa ter pelo menos 3 caracteres.";
  else if (titulo.length > LIMITE_TITULO) erros.titulo = `O título pode ter no máximo ${LIMITE_TITULO} caracteres.`;
  if (!f.descricao.trim()) erros.descricao = "Descreva o problema.";
  if (!STATUS.some((s) => s.valor === f.status)) erros.status = "Escolha um status válido.";
  if (!PRIORIDADES.includes(f.prioridade)) erros.prioridade = "Escolha uma prioridade válida.";
  return erros;
}
