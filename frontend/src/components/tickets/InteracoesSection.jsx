import { useCallback, useEffect, useMemo, useState } from "react";
import { Pencil, RefreshCw, Trash2 } from "lucide-react";
import ConfirmDialog from "../ui/ConfirmDialog";
import Spinner from "../ui/Spinner";
import { useToast } from "../ui/Toast";
import { corrigirInteracao, criarInteracao, excluirInteracao, listarInteracoes } from "../../services/interacoesService";
import { errosPorCampo } from "../../services/http";
import { TIPOS_INTERACAO } from "../../utils/chamados";
import { formatarDataHora } from "../../utils/date";

const FORM_INICIAL = { mensagem: "", tipo: "Observação", autor: "" };

// Linha do tempo real: criação e última atualização do chamado + interações vindas da API.
export default function InteracoesSection({ chamado }) {
  const toast = useToast();
  const [lista, setLista] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erroLista, setErroLista] = useState("");
  const [form, setForm] = useState(FORM_INICIAL);
  const [editandoId, setEditandoId] = useState(null);
  const [erros, setErros] = useState({});
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(null);
  const [erroExcluir, setErroExcluir] = useState("");
  const [processando, setProcessando] = useState(false);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      setLista(await listarInteracoes(chamado.id));
      setErroLista("");
    } catch (e) {
      setErroLista(e.message);
    } finally {
      setCarregando(false);
    }
  }, [chamado.id]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const eventos = useMemo(() => {
    const itens = [{ chave: "criado", data: chamado.data_abertura, rotulo: "Chamado criado", sistema: true }];
    for (const i of lista) itens.push({ chave: `i${i.id}`, data: i.data_criacao, interacao: i });
    if (Math.abs(new Date(chamado.data_atualizacao) - new Date(chamado.data_abertura)) > 1000) {
      itens.push({ chave: "atualizado", data: chamado.data_atualizacao, rotulo: "Última atualização do chamado", sistema: true });
    }
    return itens.sort((a, b) => new Date(a.data) - new Date(b.data));
  }, [lista, chamado.data_abertura, chamado.data_atualizacao]);

  const set = (campo) => (e) => {
    setForm((f) => ({ ...f, [campo]: e.target.value }));
    setErros((x) => ({ ...x, [campo]: undefined }));
  };

  function iniciarEdicao(i) {
    setEditandoId(i.id);
    setForm({ mensagem: i.mensagem, tipo: i.tipo, autor: i.autor });
    setErros({});
  }
  function cancelar() {
    setEditandoId(null);
    setForm(FORM_INICIAL);
    setErros({});
  }

  async function enviar(e) {
    e.preventDefault();
    if (!form.mensagem.trim()) return setErros({ mensagem: "Escreva a mensagem da interação." });
    setSalvando(true);
    try {
      const corpo = { mensagem: form.mensagem.trim(), tipo: form.tipo, autor: form.autor.trim() };
      if (editandoId) {
        const salva = await corrigirInteracao(editandoId, corpo);
        setLista((l) => l.map((i) => (i.id === salva.id ? salva : i)));
        toast.sucesso("Interação corrigida");
      } else {
        const nova = await criarInteracao({ chamado: chamado.id, ...corpo });
        setLista((l) => [...l, nova]);
        toast.sucesso("Interação registrada");
      }
      cancelar();
    } catch (err) {
      const daApi = errosPorCampo(err);
      if (Object.keys(daApi).length) setErros(daApi);
      else toast.erro(err.message);
    } finally {
      setSalvando(false);
    }
  }

  async function confirmarExclusao() {
    setProcessando(true);
    setErroExcluir("");
    try {
      await excluirInteracao(excluindo.id);
      setLista((l) => l.filter((i) => i.id !== excluindo.id));
      if (editandoId === excluindo.id) cancelar();
      setExcluindo(null);
      toast.sucesso("Interação excluída");
    } catch (err) {
      setErroExcluir(err.message);
    } finally {
      setProcessando(false);
    }
  }

  return (
    <section className="secao" aria-labelledby="titulo-historico">
      <div className="secao__cab">
        <h3 id="titulo-historico">Histórico do atendimento</h3>
        <button type="button" className="btn-icone btn-icone--mini" onClick={carregar} disabled={carregando} aria-label="Atualizar histórico">
          <RefreshCw size={15} className={carregando ? "girando" : undefined} />
        </button>
      </div>

      {erroLista && <p className="alerta alerta--erro" role="alert">{erroLista}</p>}

      <ol className="timeline">
        {eventos.map((ev) =>
          ev.sistema ? (
            <li key={ev.chave} className="timeline__item timeline__item--sistema">
              <span className="timeline__ponto" aria-hidden="true" />
              <div>
                <strong>{ev.rotulo}</strong>
                <time className="texto-suave">{formatarDataHora(ev.data)}</time>
              </div>
            </li>
          ) : (
            <li key={ev.chave} className="timeline__item">
              <span className="timeline__ponto timeline__ponto--interacao" aria-hidden="true" />
              <div className="timeline__conteudo">
                <div className="timeline__linha">
                  <span className="selo selo--neutro">{ev.interacao.tipo}</span>
                  <span className="botoes-mini">
                    <button type="button" className="btn-icone btn-icone--mini" onClick={() => iniciarEdicao(ev.interacao)} aria-label="Corrigir interação">
                      <Pencil size={14} />
                    </button>
                    <button type="button" className="btn-icone btn-icone--mini" onClick={() => setExcluindo(ev.interacao)} aria-label="Excluir interação">
                      <Trash2 size={14} />
                    </button>
                  </span>
                </div>
                <p>{ev.interacao.mensagem}</p>
                <time className="texto-suave">
                  {ev.interacao.autor ? `${ev.interacao.autor} em ` : ""}
                  {formatarDataHora(ev.data)}
                </time>
              </div>
            </li>
          )
        )}
      </ol>
      {!carregando && lista.length === 0 && !erroLista && <p className="texto-suave">Nenhuma interação registrada neste chamado.</p>}

      <form className="form form--compacto" onSubmit={enviar} noValidate>
        <h4>{editandoId ? "Corrigir interação" : "Registrar interação"}</h4>
        <div className={`campo${erros.mensagem ? " campo--erro" : ""}`}>
          <label htmlFor="i-mensagem">Mensagem</label>
          <textarea id="i-mensagem" rows={3} value={form.mensagem} onChange={set("mensagem")} placeholder="O que foi feito neste atendimento?" />
          {erros.mensagem && <p className="campo__erro">{erros.mensagem}</p>}
        </div>
        <div className="form__linha">
          <div className="campo">
            <label htmlFor="i-tipo">Tipo</label>
            <select id="i-tipo" value={form.tipo} onChange={set("tipo")}>
              {TIPOS_INTERACAO.map((t) => <option key={t}>{t}</option>)}
            </select>
            {erros.tipo && <p className="campo__erro">{erros.tipo}</p>}
          </div>
          <div className="campo">
            <label htmlFor="i-autor">Autor (opcional)</label>
            <input id="i-autor" value={form.autor} onChange={set("autor")} maxLength={100} placeholder="Equipe de suporte" />
            {erros.autor && <p className="campo__erro">{erros.autor}</p>}
          </div>
        </div>
        {erros.chamado && <p className="campo__erro">{erros.chamado}</p>}
        <div className="form__acoes">
          {editandoId && <button type="button" className="btn btn--fantasma" onClick={cancelar}>Cancelar</button>}
          <button type="submit" className="btn btn--primario" disabled={salvando}>
            {salvando && <Spinner pequeno rotulo="Salvando" />}
            {editandoId ? "Salvar correção" : "Registrar interação"}
          </button>
        </div>
      </form>

      {excluindo && (
        <ConfirmDialog
          titulo="Excluir interação"
          mensagem="Tem certeza de que deseja excluir esta interação?"
          detalhe="Esta ação não poderá ser desfeita."
          confirmarTexto="Excluir"
          perigo
          carregando={processando}
          erro={erroExcluir}
          onConfirmar={confirmarExclusao}
          onCancelar={() => setExcluindo(null)}
        />
      )}
    </section>
  );
}
