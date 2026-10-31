import { Mail, Pencil, Phone, Trash2 } from "lucide-react";
import Modal from "../ui/Modal";
import { classeDoStatus } from "../../utils/chamados";
import { formatarDataHora } from "../../utils/date";

export default function ClienteDetails({ cliente: c, chamados, onFechar, onEditar, onExcluir, onAbrirChamado }) {
  const doCliente = chamados.filter((x) => x.cliente === c.id);
  return (
    <Modal
      lateral
      titulo={c.nome}
      subtitulo={c.empresa || "Sem empresa informada"}
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
      <div className="cartao__selos">
        <span className={`selo ${c.ativo ? "selo--status-resolvido" : "selo--neutro"}`}>{c.ativo ? "Ativo" : "Inativo"}</span>
      </div>
      <dl className="detalhe__lista">
        <div>
          <dt>Nome</dt>
          <dd>{c.nome}</dd>
        </div>
        <div>
          <dt>Empresa</dt>
          <dd>{c.empresa || "—"}</dd>
        </div>
        <div>
          <dt>E-mail</dt>
          <dd>{c.email ? <span className="cartao__cliente"><Mail size={14} aria-hidden="true" />{c.email}</span> : "—"}</dd>
        </div>
        <div>
          <dt>Telefone</dt>
          <dd>{c.telefone ? <span className="cartao__cliente"><Phone size={14} aria-hidden="true" />{c.telefone}</span> : "—"}</dd>
        </div>
        <div>
          <dt>Cadastrado em</dt>
          <dd>{formatarDataHora(c.data_cadastro)}</dd>
        </div>
        <div>
          <dt>Quantidade de chamados</dt>
          <dd>{doCliente.length}</dd>
        </div>
      </dl>

      <section className="secao" aria-labelledby="chamados-cliente">
        <h3 id="chamados-cliente">Chamados relacionados</h3>
        {doCliente.length === 0 ? (
          <p className="texto-suave">Este cliente ainda não possui chamados.</p>
        ) : (
          <ul className="lista-simples">
            {doCliente.map((x) => (
              <li key={x.id}>
                <button type="button" className="lista-simples__item" onClick={() => onAbrirChamado(x.id)}>
                  <span className="cartao__id">#{x.id}</span>
                  <span className="lista-simples__titulo">{x.titulo}</span>
                  <span className={`selo selo--status-${classeDoStatus(x.status)}`}>{x.status}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </Modal>
  );
}
