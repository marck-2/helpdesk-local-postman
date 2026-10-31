import { request } from "./http";

const BASE = "/clientes/";

export const listarClientes = (opcoes) => request(BASE, opcoes);
export const buscarClientePorId = (id) => request(`${BASE}${id}/`);
export const criarCliente = (dados) => request(BASE, { method: "POST", body: dados });
export const atualizarCliente = (id, dados) => request(`${BASE}${id}/`, { method: "PUT", body: dados });
export const atualizarParcialmenteCliente = (id, dados) =>
  request(`${BASE}${id}/`, { method: "PATCH", body: dados });
export const excluirCliente = (id) => request(`${BASE}${id}/`, { method: "DELETE" });
