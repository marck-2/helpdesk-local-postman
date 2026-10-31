import { Building2, Pencil, Trash2 } from "lucide-react";
import Modal from "../ui/Modal";
import InteracoesSection from "./InteracoesSection";
import { STATUS, classeDaPrioridade, classeDoStatus } from "../../utils/chamados";
import { formatarDataHora } from "../../utils/date";

export default function TicketDetails({ chamado: c, cliente, onFechar, onEditar, onExcluir, onMudarStatus }) {
  return (
    <Modal
      lateral
      titulo={`Chamado #${c.id}`}
      onFechar={onFechar}
      rodape={
        <>
          <button type="button" className="btn btn--perigo-suave" onClick={() => onExcluir(c)}>
            <Trash2 size={16} aria-hidden="true" />
            Excluir
          </button>
          <button type="button" className="btn btn--primario" onClick={() => onEditar(c)}>
            <Pencil size={16} aria-hidden="true" />
            Editar
          </button>
        </>
      }
    >
      <h3 className="detalhe__titulo">{c.titulo}</h3>
      <div className="cartao__selos">
        <span className={`selo selo--status-${classeDoStatus(c.status)}`}>{c.status}</span>
        <span className={`selo selo--prio-${classeDaPrioridade(c.prioridade)}`}>Prioridade {c.prioridade}</span>
      </div>

      <dl className="detalhe__lista">
        <div>
          <dt>Descrição</dt>
          <dd className="detalhe__descricao">{c.descricao}</dd>
        </div>
        <div>
          <dt>Cliente</dt>
          <dd>
            {cliente ? (
              <span className="cartao__cliente">
                <Building2 size={14} aria-hidden="true" />
                {cliente.nome}
                {cliente.empresa ? ` — ${cliente.empresa}` : ""}
              </span>
            ) : (
              "Sem cliente vinculado"
            )}
          </dd>
        </div>
        <div>
          <dt>Aberto em</dt>
          <dd>{formatarDataHora(c.data_abertura)}</dd>
        </div>
        <div>
          <dt>Última atualização</dt>
          <dd>{formatarDataHora(c.data_atualizacao)}</dd>
        </div>
      </dl>

      <div className="campo">
        <label htmlFor="detalhe-status">Alterar status</label>
        <select id="detalhe-status" value={c.status} onChange={(e) => onMudarStatus(c.id, e.target.value)}>
          {STATUS.map((s) => <option key={s.valor}>{s.valor}</option>)}
        </select>
      </div>

      <InteracoesSection chamado={c} />
    </Modal>
  );
}
