import { useState } from "react";
import { Inbox, SearchX } from "lucide-react";
import EmptyState from "./EmptyState";
import TicketColumn from "./TicketColumn";
import { STATUS } from "../../utils/chamados";

function Esqueleto() {
  return (
    <div className="board" aria-busy="true" aria-label="Carregando chamados">
      {STATUS.map((s) => (
        <div key={s.valor} className="coluna coluna--ativa">
          <header className="coluna__cab">
            <span className="esqueleto esqueleto--linha" style={{ width: "40%" }} />
          </header>
          <div className="coluna__lista">
            <div className="esqueleto esqueleto--cartao" />
            <div className="esqueleto esqueleto--cartao" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function TicketBoard({ chamados, totalGeral, carregando, mapaClientes, destaques, onNovo, onLimparFiltros, onMover, ...acoes }) {
  const [ativa, setAtiva] = useState(STATUS[0].valor);

  if (carregando) return <Esqueleto />;
  if (totalGeral === 0) {
    return <EmptyState icone={Inbox} titulo="Nenhum chamado cadastrado." texto="Crie o primeiro chamado ou envie um POST pela API." acao={{ rotulo: "Criar primeiro chamado", onClick: onNovo }} />;
  }
  if (chamados.length === 0) {
    return <EmptyState icone={SearchX} titulo="Nenhum chamado corresponde aos filtros selecionados." acao={{ rotulo: "Limpar filtros", onClick: onLimparFiltros }} />;
  }

  return (
    <>
      <div className="abas-status" role="tablist" aria-label="Etapa do chamado">
        {STATUS.map((s) => (
          <button
            key={s.valor}
            type="button"
            role="tab"
            aria-selected={ativa === s.valor}
            className={`aba aba--${s.classe}`}
            onClick={() => setAtiva(s.valor)}
          >
            {s.valor}
            <span>{chamados.filter((c) => c.status === s.valor).length}</span>
          </button>
        ))}
      </div>
      <div className="board">
        {STATUS.map((s) => (
          <TicketColumn
            key={s.valor}
            status={s}
            chamados={chamados.filter((c) => c.status === s.valor)}
            mapaClientes={mapaClientes}
            destaques={destaques}
            ativaNoCelular={ativa === s.valor}
            onMover={onMover}
            onMudarStatus={onMover}
            {...acoes}
          />
        ))}
      </div>
    </>
  );
}
