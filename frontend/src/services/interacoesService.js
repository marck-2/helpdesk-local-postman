import { request } from "./http";

const BASE = "/interacoes/";

export const listarInteracoes = (chamadoId) =>
  request(chamadoId ? `${BASE}?chamado=${encodeURIComponent(chamadoId)}` : BASE);
export const buscarInteracaoPorId = (id) => request(`${BASE}${id}/`);
export const criarInteracao = (dados) => request(BASE, { method: "POST", body: dados });
export const corrigirInteracao = (id, dados) => request(`${BASE}${id}/`, { method: "PATCH", body: dados });
export const excluirInteracao = (id) => request(`${BASE}${id}/`, { method: "DELETE" });
