import { Pencil, SearchX, Trash2, Users } from "lucide-react";
import EmptyState from "../tickets/EmptyState";
import ErrorState from "../ui/ErrorState";

const norm = (t) => (t ?? "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export default function ClientesPage({ clientes, chamados, carregando, erro, busca, onLimparBusca, onNovo, onAbrir, onEditar, onExcluir, onRecarregar }) {
  if (erro && clientes.length === 0) return <ErrorState onTentar={onRecarregar} tentando={carregando} mensagem="Não foi possível carregar os clientes." />;
  if (carregando && clientes.length === 0) {
    return <div className="esqueleto esqueleto--tabela" aria-busy="true" aria-label="Carregando clientes" />;
  }
  if (clientes.length === 0) {
    return <EmptyState icone={Users} titulo="Nenhum cliente cadastrado." texto="Cadastre clientes para vincular aos chamados." acao={{ rotulo: "Cadastrar primeiro cliente", onClick: onNovo }} />;
  }

  const termo = norm(busca).trim();
  const lista = termo ? clientes.filter((c) => norm(c.nome).includes(termo) || norm(c.empresa).includes(termo)) : clientes;
  if (lista.length === 0) {
    return <EmptyState icone={SearchX} titulo="Nenhum cliente corresponde à busca." acao={{ rotulo: "Limpar busca", onClick: onLimparBusca }} />;
  }

  const total = (id) => chamados.filter((c) => c.cliente === id).length;

  return (
    <div className="tabela-wrap">
      <table className="tabela">
        <caption className="sr-only">Lista de clientes</caption>
        <thead>
          <tr>
            <th scope="col">Nome</th>
            <th scope="col" className="oculta-celular">Empresa</th>
            <th scope="col" className="oculta-celular">E-mail</th>
            <th scope="col">Situação</th>
            <th scope="col">Chamados</th>
            <th scope="col"><span className="sr-only">Ações</span></th>
          </tr>
        </thead>
        <tbody>
          {lista.map((c) => (
            <tr key={c.id}>
              <td>
                <button type="button" className="link-botao" onClick={() => onAbrir(c.id)}>{c.nome}</button>
              </td>
              <td className="oculta-celular">{c.empresa || "—"}</td>
              <td className="oculta-celular">{c.email || "—"}</td>
              <td><span className={`selo ${c.ativo ? "selo--status-resolvido" : "selo--neutro"}`}>{c.ativo ? "Ativo" : "Inativo"}</span></td>
              <td>{total(c.id)}</td>
              <td className="tabela__acoes">
                <button type="button" className="btn-icone btn-icone--mini" onClick={() => onEditar(c)} aria-label={`Editar cliente ${c.nome}`}>
                  <Pencil size={15} />
                </button>
                <button type="button" className="btn-icone btn-icone--mini" onClick={() => onExcluir(c)} aria-label={`Excluir cliente ${c.nome}`}>
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
