import { useCallback, useEffect, useRef, useState } from "react";
import { PING_MS } from "../config/api";
import { useToast } from "../components/ui/Toast";
import {
  atualizarChamado,
  atualizarParcialmenteChamado,
  criarChamado,
  excluirChamado,
  listarChamados,
} from "../services/chamadosService";
import { verificarApi } from "../services/http";

const DURACAO_DESTAQUE_MS = 7000;

export function useChamados({ autoAtualizar, intervalo }) {
  const toast = useToast();
  const [chamados, setChamados] = useState([]);
  const [carregando, setCarregando] = useState(true); // somente a carga inicial
  const [sincronizando, setSincronizando] = useState(false);
  const [erro, setErro] = useState(null);
  const [apiStatus, setApiStatus] = useState("verificando");
  const [ultimaSync, setUltimaSync] = useState(null);
  const [destaques, setDestaques] = useState({}); // id -> "novo" | "movido"

  const listaRef = useRef([]);
  const conhecidos = useRef(null); // Map id -> status (null até a primeira carga)

  const commit = useCallback((lista) => {
    listaRef.current = lista;
    conhecidos.current = new Map(lista.map((c) => [c.id, c.status]));
    setChamados(lista);
  }, []);

  const destacar = useCallback((marcas) => {
    const ids = Object.keys(marcas);
    if (!ids.length) return;
    setDestaques((d) => ({ ...d, ...marcas }));
    setTimeout(() => {
      setDestaques((d) => {
        const copia = { ...d };
        ids.forEach((id) => delete copia[id]);
        return copia;
      });
    }, DURACAO_DESTAQUE_MS);
  }, []);

  const sincronizar = useCallback(
    async ({ silencioso = false } = {}) => {
      if (!silencioso) setSincronizando(true);
      try {
        const dados = await listarChamados();
        const lista = Array.isArray(dados) ? dados : [];
        const antes = conhecidos.current;
        if (antes) {
          const marcas = {};
          for (const c of lista) {
            if (!antes.has(c.id)) marcas[c.id] = "novo";
            else if (antes.get(c.id) !== c.status) marcas[c.id] = "movido";
          }
          destacar(marcas);
        }
        // Evita re-renderizar (e piscar) quando nada mudou.
        if (JSON.stringify(lista) !== JSON.stringify(listaRef.current) || !antes) commit(lista);
        setApiStatus("online");
        setErro(null);
        setUltimaSync(new Date());
        return { ok: true, total: lista.length };
      } catch (e) {
        setApiStatus("offline");
        setErro(e);
        return { ok: false, erro: e };
      } finally {
        setCarregando(false);
        if (!silencioso) setSincronizando(false);
      }
    },
    [commit, destacar]
  );

  // Botão "Atualizar chamados": novo GET real + aviso ao usuário.
  const atualizar = useCallback(async () => {
    const r = await sincronizar();
    if (r.ok) toast.sucesso("Chamados atualizados");
    else toast.erro(r.erro.message);
    return r;
  }, [sincronizar, toast]);

  useEffect(() => {
    sincronizar();
  }, [sincronizar]);

  useEffect(() => {
    if (!autoAtualizar) return undefined;
    const t = setInterval(() => sincronizar({ silencioso: true }), intervalo);
    return () => clearInterval(t);
  }, [autoAtualizar, intervalo, sincronizar]);

  // Indicador de conexão: tentativa real de comunicação a cada PING_MS.
  useEffect(() => {
    const t = setInterval(() => {
      verificarApi().then(
        () => setApiStatus("online"),
        () => setApiStatus("offline")
      );
    }, PING_MS);
    return () => clearInterval(t);
  }, []);

  const criar = useCallback(
    async (dados) => {
      const novo = await criarChamado(dados);
      commit([novo, ...listaRef.current.filter((c) => c.id !== novo.id)]);
      destacar({ [novo.id]: "novo" });
      return novo;
    },
    [commit, destacar]
  );

  const atualizarCompleto = useCallback(
    async (id, dados) => {
      const salvo = await atualizarChamado(id, dados);
      commit(listaRef.current.map((c) => (c.id === id ? salvo : c)));
      return salvo;
    },
    [commit]
  );

  // Mudança de status (select ou arrastar e soltar): otimista, com reversão se a API recusar.
  const moverStatus = useCallback(
    async (id, status) => {
      const original = listaRef.current.find((c) => c.id === id);
      if (!original || original.status === status) return;
      commit(listaRef.current.map((c) => (c.id === id ? { ...c, status } : c)));
      try {
        const salvo = await atualizarParcialmenteChamado(id, { status });
        commit(listaRef.current.map((c) => (c.id === id ? salvo : c)));
        toast.sucesso(`Chamado #${id} movido para ${status}`);
      } catch (e) {
        commit(listaRef.current.map((c) => (c.id === id ? original : c)));
        toast.erro(`Não foi possível mover o chamado #${id}. ${e.message}`);
      }
    },
    [commit, toast]
  );

  const excluir = useCallback(
    async (id) => {
      await excluirChamado(id); // 204 No Content
      commit(listaRef.current.filter((c) => c.id !== id));
    },
    [commit]
  );

  return {
    chamados, carregando, sincronizando, erro, apiStatus, ultimaSync, destaques,
    sincronizar, atualizar, criar, atualizarCompleto, moverStatus, excluir,
  };
}
