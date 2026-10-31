import { X } from "lucide-react";
import { FILTROS_VAZIOS, PRIORIDADES, STATUS } from "../../utils/chamados";

export default function Filters({ filtros, onChange, mostrando, total }) {
  const alterado = filtros.busca || filtros.status || filtros.prioridade || filtros.ordem !== FILTROS_VAZIOS.ordem;
  const set = (campo) => (e) => onChange({ ...filtros, [campo]: e.target.value });
  return (
    <section className="filtros" aria-label="Filtros">
      <div className="campo campo--inline">
        <label htmlFor="filtro-status">Status</label>
        <select id="filtro-status" value={filtros.status} onChange={set("status")}>
          <option value="">Todos</option>
          {STATUS.map((s) => (
            <option key={s.valor}>{s.valor}</option>
          ))}
        </select>
      </div>
      <div className="campo campo--inline">
        <label htmlFor="filtro-prioridade">Prioridade</label>
        <select id="filtro-prioridade" value={filtros.prioridade} onChange={set("prioridade")}>
          <option value="">Todas</option>
          {PRIORIDADES.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
      </div>
      <div className="campo campo--inline">
        <label htmlFor="filtro-ordem">Ordenar</label>
        <select id="filtro-ordem" value={filtros.ordem} onChange={set("ordem")}>
          <option value="recentes">Mais recentes</option>
          <option value="antigos">Mais antigos</option>
        </select>
      </div>
      <button type="button" className="btn btn--fantasma" onClick={() => onChange({ ...FILTROS_VAZIOS })} disabled={!alterado}>
        <X size={16} aria-hidden="true" />
        Limpar filtros
      </button>
      <span className="filtros__contagem" aria-live="polite">
        {mostrando === total ? `${total} chamado${total === 1 ? "" : "s"}` : `${mostrando} de ${total} chamados`}
      </span>
    </section>
  );
}
