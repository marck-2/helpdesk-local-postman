import { Building2, Clock, Eye, Pencil, Trash2 } from "lucide-react";
import Menu from "../ui/Menu";
import { STATUS, classeDaPrioridade, classeDoStatus } from "../../utils/chamados";
import { formatarDataCurta, formatarDataHora } from "../../utils/date";

export default function TicketCard({ chamado: c, cliente, destaque, onAbrir, onEditar, onExcluir, onMudarStatus }) {
  const atualizado = c.data_atualizacao && Math.abs(new Date(c.data_atualizacao) - new Date(c.data_abertura)) > 1000;
  return (
    <article
      className={`cartao cartao--${classeDoStatus(c.status)} cartao--prio-${classeDaPrioridade(c.prioridade)}${destaque ? " cartao--destaque" : ""}`}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", String(c.id));
        e.dataTransfer.effectAllowed = "move";
      }}
    >
      <div className="cartao__topo">
        <span className="cartao__id">#{c.id}</span>
        {destaque && <span className="selo-destaque">{destaque === "novo" ? "Novo" : "Atualizado"}</span>}
        <Menu
          rotulo={`Ações do chamado ${c.id}`}
          itens={[
            { rotulo: "Ver detalhes", icone: Eye, onClick: () => onAbrir(c.id) },
            { rotulo: "Editar", icone: Pencil, onClick: () => onEditar(c) },
            { rotulo: "Excluir", icone: Trash2, onClick: () => onExcluir(c), perigo: true },
          ]}
        />
      </div>

      <h3 className="cartao__titulo">
        <button type="button" className="cartao__abrir" onClick={() => onAbrir(c.id)}>
          {c.titulo}
        </button>
      </h3>
      <p className="cartao__desc">{c.descricao}</p>
      {cliente && (
        <p className="cartao__cliente">
          <Building2 size={14} aria-hidden="true" />
          {cliente.nome}
        </p>
      )}

      <div className="cartao__selos">
        <span className={`selo selo--prio-${classeDaPrioridade(c.prioridade)}`}>Prioridade {c.prioridade}</span>
        <span className={`selo selo--status-${classeDoStatus(c.status)}`}>{c.status}</span>
      </div>

      <p className="cartao__datas">
        <Clock size={14} aria-hidden="true" />
        <span>
          Aberto em {formatarDataCurta(c.data_abertura)}
          {atualizado && <> — atualizado {formatarDataHora(c.data_atualizacao)}</>}
        </span>
      </p>

      <div className="cartao__rodape">
        <label className="sr-only" htmlFor={`status-${c.id}`}>
          Status do chamado {c.id}
        </label>
        <select id={`status-${c.id}`} value={c.status} onChange={(e) => onMudarStatus(c.id, e.target.value)}>
          {STATUS.map((s) => (
            <option key={s.valor}>{s.valor}</option>
          ))}
        </select>
        <button type="button" className="btn-icone btn-icone--borda" onClick={() => onAbrir(c.id)} aria-label={`Ver detalhes do chamado ${c.id}`} title="Ver detalhes">
          <Eye size={15} aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}
