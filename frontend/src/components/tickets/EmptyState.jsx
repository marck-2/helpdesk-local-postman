export default function EmptyState({ icone: Icone, titulo, texto, acao, acaoSecundaria }) {
  return (
    <div className="vazio">
      {Icone && <Icone size={36} aria-hidden="true" />}
      <h2>{titulo}</h2>
      {texto && <p className="texto-suave">{texto}</p>}
      <div className="vazio__acoes">
        {acao && (
          <button type="button" className="btn btn--primario" onClick={acao.onClick}>
            {acao.rotulo}
          </button>
        )}
        {acaoSecundaria && (
          <button type="button" className="btn btn--fantasma" onClick={acaoSecundaria.onClick}>
            {acaoSecundaria.rotulo}
          </button>
        )}
      </div>
    </div>
  );
}
