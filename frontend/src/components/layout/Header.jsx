import { Menu, Plus, RefreshCw, Search } from "lucide-react";
import ApiStatus from "../dashboard/ApiStatus";
import { formatarDataLonga, formatarHora } from "../../utils/date";

export default function Header({ titulo, busca, placeholderBusca, onBusca, mostrarBusca, onAbrirMenu, onAtualizar, sincronizando, ultimaSync, autoAtualizar, onAlternarAuto, onNovo, rotuloNovo, apiStatus }) {
  return (
    <header className="topo">
      <div className="topo__linha">
        <button type="button" className="btn-icone topo__menu" onClick={onAbrirMenu} aria-label="Abrir menu" aria-controls="menu-lateral">
          <Menu size={20} />
        </button>
        <div className="topo__titulo">
          <h1>{titulo}</h1>
          <p className="texto-suave">{formatarDataLonga()}</p>
        </div>

        {mostrarBusca && (
          <div className="busca">
            <Search size={17} aria-hidden="true" />
            <input type="search" value={busca} onChange={(e) => onBusca(e.target.value)} placeholder={placeholderBusca} aria-label={placeholderBusca} autoComplete="off" />
          </div>
        )}

        <div className="topo__acoes">
          <button type="button" className="btn btn--fantasma" onClick={onAtualizar} disabled={sincronizando}>
            <RefreshCw size={16} className={sincronizando ? "girando" : undefined} aria-hidden="true" />
            <span>{sincronizando ? "Atualizando..." : "Atualizar chamados"}</span>
          </button>
          <button type="button" className="btn btn--primario" onClick={onNovo}>
            <Plus size={16} aria-hidden="true" />
            <span>{rotuloNovo}</span>
          </button>
        </div>
      </div>

      <div className="topo__status">
        <ApiStatus status={apiStatus} />
        <span className="texto-suave" aria-live="polite">
          Última atualização: {ultimaSync ? formatarHora(ultimaSync) : "—"}
        </span>
        <label className="interruptor">
          <input type="checkbox" checked={autoAtualizar} onChange={onAlternarAuto} />
          <span className="interruptor__trilho" aria-hidden="true" />
          Atualização automática (15 s)
        </label>
      </div>
    </header>
  );
}
