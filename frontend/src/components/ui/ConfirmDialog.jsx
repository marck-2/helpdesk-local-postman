import Modal from "./Modal";
import Spinner from "./Spinner";

export default function ConfirmDialog({
  titulo,
  mensagem,
  detalhe,
  confirmarTexto = "Confirmar",
  perigo = false,
  carregando = false,
  erro,
  onConfirmar,
  onCancelar,
}) {
  return (
    <Modal
      titulo={titulo}
      onFechar={carregando ? undefined : onCancelar}
      largura="440px"
      rodape={
        <>
          <button type="button" className="btn btn--fantasma" onClick={onCancelar} disabled={carregando} data-autofocus>
            Cancelar
          </button>
          <button type="button" className={`btn ${perigo ? "btn--perigo" : "btn--primario"}`} onClick={onConfirmar} disabled={carregando}>
            {carregando && <Spinner pequeno rotulo="Processando" />}
            {confirmarTexto}
          </button>
        </>
      }
    >
      <p>{mensagem}</p>
      {detalhe && <p className="texto-suave">{detalhe}</p>}
      {erro && (
        <p className="alerta alerta--erro" role="alert">
          {erro}
        </p>
      )}
    </Modal>
  );
}
