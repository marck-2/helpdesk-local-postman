import { useCallback, useEffect, useRef, useState } from "react";
import { atualizarCliente, criarCliente, excluirCliente, listarClientes } from "../services/clientesService";

export function useClientes() {
  const [clientes, setClientes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const listaRef = useRef([]);

  const commit = useCallback((lista) => {
    listaRef.current = lista;
    setClientes(lista);
  }, []);

  const recarregar = useCallback(async () => {
    setCarregando(true);
    try {
      const dados = await listarClientes();
      commit(Array.isArray(dados) ? dados : []);
      setErro(null);
    } catch (e) {
      setErro(e);
    } finally {
      setCarregando(false);
    }
  }, [commit]);

  useEffect(() => {
    recarregar();
  }, [recarregar]);

  const criar = useCallback(
    async (dados) => {
      const novo = await criarCliente(dados);
      commit([...listaRef.current, novo].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")));
      return novo;
    },
    [commit]
  );

  const atualizar = useCallback(
    async (id, dados) => {
      const salvo = await atualizarCliente(id, dados);
      commit(listaRef.current.map((c) => (c.id === id ? salvo : c)).sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")));
      return salvo;
    },
    [commit]
  );

  const excluir = useCallback(
    async (id) => {
      await excluirCliente(id);
      commit(listaRef.current.filter((c) => c.id !== id));
    },
    [commit]
  );

  return { clientes, carregando, erro, recarregar, criar, atualizar, excluir };
}
