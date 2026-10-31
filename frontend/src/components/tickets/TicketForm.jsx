import { useState } from "react";
import Modal from "../ui/Modal";
import Spinner from "../ui/Spinner";
import { errosPorCampo } from "../../services/http";
import { FORM_VAZIO, LIMITE_TITULO, PRIORIDADES, STATUS, formDoChamado, payloadDoChamado, validarChamado } from "../../utils/chamados";

export default function TicketForm({ chamado, clientes, onSalvar, onFechar }) {
  const editando = Boolean(chamado);
  const [form, setForm] = useState(editando ? formDoChamado(chamado) : FORM_VAZIO);
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState("");
  const [salvando, setSalvando] = useState(false);

  const set = (campo) => (e) => {
    setForm((f) => ({ ...f, [campo]: e.target.value }));
    if (erros[campo]) setErros((x) => ({ ...x, [campo]: undefined }));
  };

  // Clientes inativos só aparecem se já estiverem vinculados a este chamado.
  const opcoes = clientes.filter((c) => c.ativo || c.id === chamado?.cliente);

  async function enviar(e) {
    e.preventDefault();
    const invalidos = validarChamado(form);
    setErros(invalidos);
    setErroGeral("");
    if (Object.keys(invalidos).length) return;
    setSalvando(true);
    try {
      await onSalvar(payloadDoChamado(form)); // quem chama fecha o modal e avisa o sucesso
    } catch (err) {
      const daApi = errosPorCampo(err);
      setErros(daApi);
      setErroGeral(Object.keys(daApi).length ? "Corrija os campos indicados." : err.message);
      setSalvando(false);
    }
  }

  const Erro = ({ campo }) => (erros[campo] ? <p className="campo__erro" id={`erro-${campo}`}>{erros[campo]}</p> : null);
  const aria = (campo) => ({ "aria-invalid": Boolean(erros[campo]), "aria-describedby": erros[campo] ? `erro-${campo}` : undefined });

  return (
    <Modal
      titulo={editando ? `Editar chamado #${chamado.id}` : "Novo chamado"}
      subtitulo={editando ? undefined : "Preencha os dados para abrir um chamado."}
      onFechar={salvando ? undefined : onFechar}
      largura="560px"
      rodape={
        <>
          <button type="button" className="btn btn--fantasma" onClick={onFechar} disabled={salvando}>
            Cancelar
          </button>
          <button type="submit" form="form-chamado" className="btn btn--primario" disabled={salvando}>
            {salvando && <Spinner pequeno rotulo="Salvando" />}
            {editando ? "Salvar alterações" : "Criar chamado"}
          </button>
        </>
      }
    >
      <form id="form-chamado" className="form" onSubmit={enviar} noValidate>
        {erroGeral && <p className="alerta alerta--erro" role="alert">{erroGeral}</p>}

        <div className={`campo${erros.titulo ? " campo--erro" : ""}`}>
          <label htmlFor="c-titulo">Título</label>
          <input id="c-titulo" data-autofocus value={form.titulo} onChange={set("titulo")} maxLength={LIMITE_TITULO} placeholder="Ex.: Impressora do 2º andar não imprime" {...aria("titulo")} />
          <span className="campo__dica">{form.titulo.length}/{LIMITE_TITULO}</span>
          <Erro campo="titulo" />
        </div>

        <div className={`campo${erros.descricao ? " campo--erro" : ""}`}>
          <label htmlFor="c-descricao">Descrição</label>
          <textarea id="c-descricao" rows={5} value={form.descricao} onChange={set("descricao")} placeholder="O que aconteceu, onde e desde quando?" {...aria("descricao")} />
          <Erro campo="descricao" />
        </div>

        <div className="form__linha">
          <div className={`campo${erros.status ? " campo--erro" : ""}`}>
            <label htmlFor="c-status">Status</label>
            <select id="c-status" value={form.status} onChange={set("status")} {...aria("status")}>
              {STATUS.map((s) => <option key={s.valor}>{s.valor}</option>)}
            </select>
            <Erro campo="status" />
          </div>
          <div className={`campo${erros.prioridade ? " campo--erro" : ""}`}>
            <label htmlFor="c-prioridade">Prioridade</label>
            <select id="c-prioridade" value={form.prioridade} onChange={set("prioridade")} {...aria("prioridade")}>
              {PRIORIDADES.map((p) => <option key={p}>{p}</option>)}
            </select>
            <Erro campo="prioridade" />
          </div>
        </div>

        <div className={`campo${erros.cliente ? " campo--erro" : ""}`}>
          <label htmlFor="c-cliente">Cliente (opcional)</label>
          <select id="c-cliente" value={form.cliente} onChange={set("cliente")} {...aria("cliente")}>
            <option value="">Sem cliente vinculado</option>
            {opcoes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}{c.empresa ? ` — ${c.empresa}` : ""}
              </option>
            ))}
          </select>
          <Erro campo="cliente" />
        </div>
      </form>
    </Modal>
  );
}
