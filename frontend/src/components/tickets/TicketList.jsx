import { Inbox, Pencil, SearchX, Trash2 } from "lucide-react";
import EmptyState from "./EmptyState";
import { classeDaPrioridade, classeDoStatus } from "../../utils/chamados";
import { formatarDataHora } from "../../utils/date";

export default function TicketList({ chamados, totalGeral, mapaClientes, destaques, onAbrir, onEditar, onExcluir, onNovo, onLimparFiltros }) {
  if (totalGeral === 0) {
    return <EmptyState icone={Inbox} titulo="Nenhum chamado cadastrado." acao={{ rotulo: "Criar primeiro chamado", onClick: onNovo }} />;
  }
  if (chamados.length === 0) {
    return <EmptyState icone={SearchX} titulo="Nenhum chamado corresponde aos filtros selecionados." acao={{ rotulo: "Limpar filtros", onClick: onLimparFiltros }} />;
  }
  return (
    <div className="tabela-wrap">
      <table className="tabela">
        <caption className="sr-only">Lista de chamados</caption>
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Título</th>
            <th scope="col" className="oculta-celular">Cliente</th>
            <th scope="col">Status</th>
            <th scope="col">Prioridade</th>
            <th scope="col" className="oculta-celular">Abertura</th>
            <th scope="col"><span className="sr-only">Ações</span></th>
          </tr>
        </thead>
        <tbody>
          {chamados.map((c) => (
            <tr key={c.id} className={destaques[c.id] ? "linha--destaque" : undefined}>
              <td>#{c.id}</td>
              <td>
                <button type="button" className="link-botao" onClick={() => onAbrir(c.id)}>
                  {c.titulo}
                </button>
              </td>
              <td className="oculta-celular">{mapaClientes.get(c.cliente)?.nome ?? "—"}</td>
              <td><span className={`selo selo--status-${classeDoStatus(c.status)}`}>{c.status}</span></td>
              <td><span className={`selo selo--prio-${classeDaPrioridade(c.prioridade)}`}>{c.prioridade}</span></td>
              <td className="oculta-celular">{formatarDataHora(c.data_abertura)}</td>
              <td className="tabela__acoes">
                <button type="button" className="btn-icone btn-icone--mini" onClick={() => onEditar(c)} aria-label={`Editar chamado ${c.id}`}>
                  <Pencil size={15} />
                </button>
                <button type="button" className="btn-icone btn-icone--mini" onClick={() => onExcluir(c)} aria-label={`Excluir chamado ${c.id}`}>
                  <Trash2 size={15} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
