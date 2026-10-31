import { useState } from "react";
import TicketCard from "./TicketCard";

export default function TicketColumn({ status, chamados, mapaClientes, destaques, ativaNoCelular, onMover, ...acoes }) {
  const [sobre, setSobre] = useState(false);
  return (
    <section
      className={`coluna coluna--${status.classe}${sobre ? " coluna--sobre" : ""}${ativaNoCelular ? " coluna--ativa" : ""}`}
      aria-labelledby={`col-${status.classe}`}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        setSobre(true);
      }}
      onDragLeave={(e) => !e.currentTarget.contains(e.relatedTarget) && setSobre(false)}
      onDrop={(e) => {
        e.preventDefault();
        setSobre(false);
        const id = Number(e.dataTransfer.getData("text/plain"));
        if (id) onMover(id, status.valor);
      }}
    >
      <header className="coluna__cab">
        <span className="coluna__marca" aria-hidden="true" />
        <h2 id={`col-${status.classe}`}>{status.valor}</h2>
        <span className="coluna__contagem" aria-label={`${chamados.length} chamados`}>
          {chamados.length}
        </span>
      </header>
      <div className="coluna__lista">
        {chamados.length === 0 ? (
          <p className="coluna__vazia">Nenhum chamado nesta etapa.</p>
        ) : (
          chamados.map((c) => <TicketCard key={c.id} chamado={c} cliente={mapaClientes.get(c.cliente)} destaque={destaques[c.id]} {...acoes} />)
        )}
      </div>
    </section>
  );
}
