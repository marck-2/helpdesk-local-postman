import { useState } from "react";
import Modal from "../ui/Modal";
import Spinner from "../ui/Spinner";
import { errosPorCampo } from "../../services/http";

const VAZIO = { nome: "", email: "", telefone: "", empresa: "", ativo: true };
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ClienteForm({ cliente, onSalvar, onFechar }) {
  const editando = Boolean(cliente);
  const [form, setForm] = useState(
    editando ? { nome: cliente.nome, email: cliente.email, telefone: cliente.telefone, empresa: cliente.empresa, ativo: cliente.ativo } : VAZIO
  );
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState("");
  const [salvando, setSalvando] = useState(false);

  const set = (campo) => (e) => {
    const valor = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [campo]: valor }));
    setErros((x) => ({ ...x, [campo]: undefined }));
  };

  async function enviar(e) {
    e.preventDefault();
    const invalidos = {};
    if (form.nome.trim().length < 2) invalidos.nome = "Informe o nome do cliente (mínimo 2 caracteres).";
    if (form.email.trim() && !EMAIL.test(form.email.trim())) invalidos.email = "Informe um e-mail válido.";
    setErros(invalidos);
    setErroGeral("");
    if (Object.keys(invalidos).length) return;
    setSalvando(true);
    try {
      await onSalvar({
        nome: form.nome.trim(),
        email: form.email.trim(),
        telefone: form.telefone.trim(),
        empresa: form.empresa.trim(),
        ativo: form.ativo,
      });
    } catch (err) {
      const daApi = errosPorCampo(err);
      setErros(daApi);
      setErroGeral(Object.keys(daApi).length ? "Corrija os campos indicados." : err.message);
      setSalvando(false);
    }
  }

  const campo = (id, rotulo, extra = {}) => (
    <div className={`campo${erros[id] ? " campo--erro" : ""}`}>
      <label htmlFor={`cl-${id}`}>{rotulo}</label>
      <input id={`cl-${id}`} value={form[id]} onChange={set(id)} aria-invalid={Boolean(erros[id])} {...extra} />
      {erros[id] && <p className="campo__erro">{erros[id]}</p>}
    </div>
  );

  return (
    <Modal
      titulo={editando ? `Editar cliente` : "Novo cliente"}
      onFechar={salvando ? undefined : onFechar}
      largura="520px"
      rodape={
        <>
          <button type="button" className="btn btn--fantasma" onClick={onFechar} disabled={salvando}>Cancelar</button>
          <button type="submit" form="form-cliente" className="btn btn--primario" disabled={salvando}>
            {salvando && <Spinner pequeno rotulo="Salvando" />}
            {editando ? "Salvar alterações" : "Cadastrar cliente"}
          </button>
        </>
      }
    >
      <form id="form-cliente" className="form" onSubmit={enviar} noValidate>
        {erroGeral && <p className="alerta alerta--erro" role="alert">{erroGeral}</p>}
        {campo("nome", "Nome", { "data-autofocus": true, maxLength: 150, autoComplete: "off" })}
        {campo("empresa", "Empresa (opcional)", { maxLength: 150 })}
        <div className="form__linha">
          {campo("email", "E-mail (opcional)", { type: "email", autoComplete: "off" })}
          {campo("telefone", "Telefone (opcional)", { type: "tel", maxLength: 30 })}
        </div>
        <label className="checkbox">
          <input type="checkbox" checked={form.ativo} onChange={set("ativo")} />
          Cliente ativo
        </label>
      </form>
    </Modal>
  );
}
