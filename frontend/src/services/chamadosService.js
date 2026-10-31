import { request } from "./http";

const BASE = "/chamados/";

export const listarChamados = (opcoes) => request(BASE, opcoes);
export const buscarChamadoPorId = (id) => request(`${BASE}${id}/`);
export const criarChamado = (dados) => request(BASE, { method: "POST", body: dados });
export const atualizarChamado = (id, dados) => request(`${BASE}${id}/`, { method: "PUT", body: dados });
export const atualizarParcialmenteChamado = (id, dados) =>
  request(`${BASE}${id}/`, { method: "PATCH", body: dados });
export const excluirChamado = (id) => request(`${BASE}${id}/`, { method: "DELETE" });
