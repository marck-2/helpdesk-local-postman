import { API_BASE_URL } from "../config/api";

export class ApiError extends Error {
  constructor(status, data, message) {
    super(message);
    this.name = "ApiError";
    this.status = status; // 0 = sem conexão
    this.data = data;
  }
}

function mensagemPorStatus(status, data) {
  if (data && typeof data.detail === "string") return data.detail;
  if (status === 0) return "Não foi possível conectar à API.";
  if (status === 400) return "Dados inválidos. Revise os campos destacados.";
  if (status === 404) return "Registro não encontrado. Ele pode ter sido excluído.";
  if (status === 405) return "Operação não permitida para este recurso.";
  if (status >= 500) return "Erro interno do servidor. Tente novamente.";
  return `A API respondeu com o código ${status}.`;
}

export async function request(path, { method = "GET", body, signal } = {}) {
  let resposta;
  try {
    resposta = await fetch(`${API_BASE_URL}${path}`, {
      method,
      signal,
      headers: { Accept: "application/json", ...(body ? { "Content-Type": "application/json" } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (e) {
    if (e.name === "AbortError") throw e;
    throw new ApiError(0, null, mensagemPorStatus(0));
  }

  // 204 No Content (DELETE): corpo vazio, não converter para JSON.
  if (resposta.status === 204) return null;

  let dados = null;
  const texto = await resposta.text();
  if (texto) {
    try {
      dados = JSON.parse(texto);
    } catch {
      dados = null;
    }
  }
  if (!resposta.ok) throw new ApiError(resposta.status, dados, mensagemPorStatus(resposta.status, dados));
  return dados;
}

// Transforma o 400 do DRF ({campo: ["mensagem"]}) em {campo: "mensagem"}.
export function errosPorCampo(erro) {
  const d = erro?.data;
  if (erro?.status !== 400 || !d || typeof d !== "object" || Array.isArray(d)) return {};
  const saida = {};
  for (const [campo, valor] of Object.entries(d)) {
    saida[campo] = Array.isArray(valor) ? valor.join(" ") : String(valor);
  }
  return saida;
}

// Verificação real de conectividade: consulta a raiz da API.
export function verificarApi(opcoes) {
  return request("/", opcoes);
}
