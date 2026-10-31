import { ClipboardList, LayoutDashboard, PanelLeftClose, PanelLeftOpen, Plus, Settings, Ticket, Users, X } from "lucide-react";
import ApiStatus from "../dashboard/ApiStatus";

const ITENS = [
  { id: "visao", rotulo: "Visão geral", icone: LayoutDashboard },
  { id: "chamados", rotulo: "Chamados", icone: Ticket },
  { id: "clientes", rotulo: "Clientes", icone: Users },
  { id: "novo", rotulo: "Novo chamado", icone: Plus, acao: true },
  { id: "relatorios", rotulo: "Relatórios", icone: ClipboardList },
  { id: "config", rotulo: "Configurações", icone: Settings },
];

export default function Sidebar({ pagina, onNavegar, onNovo, recolhida, onRecolher, aberta, onFechar, apiStatus }) {
  return (
    <>
      {aberta && <div className="sidebar-fundo" onClick={onFechar} aria-hidden="true" />}
      <aside id="menu-lateral" className={`sidebar${recolhida ? " sidebar--recolhida" : ""}${aberta ? " sidebar--aberta" : ""}`}>
        <div className="sidebar__marca">
          <span className="logo" aria-hidden="true">
            <Ticket size={20} />
          </span>
          <span className="sidebar__nome">
            HelpDesk <b>Local</b>
          </span>
          <button type="button" className="btn-icone sidebar__fechar" onClick={onFechar} aria-label="Fechar menu">
            <X size={18} />
          </button>
        </div>

        <nav aria-label="Navegação principal">
          <ul>
            {ITENS.map(({ id, rotulo, icone: Icone, acao }) => (
              <li key={id}>
                <button
                  type="button"
                  className={`nav-item${pagina === id ? " nav-item--ativo" : ""}`}
                  aria-current={pagina === id ? "page" : undefined}
                  title={recolhida ? rotulo : undefined}
                  onClick={() => (acao ? onNovo() : onNavegar(id))}
                >
                  <Icone size={18} aria-hidden="true" />
                  <span className="nav-item__rotulo">{rotulo}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar__rodape">
          <ApiStatus status={apiStatus} compacto={recolhida} />
          <button type="button" className="nav-item sidebar__recolher" onClick={onRecolher} aria-pressed={recolhida}>
            {recolhida ? <PanelLeftOpen size={18} aria-hidden="true" /> : <PanelLeftClose size={18} aria-hidden="true" />}
            <span className="nav-item__rotulo">{recolhida ? "Expandir menu" : "Recolher menu"}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
