import { useEffect, useMemo, useState } from "react";
import { ClipboardList, Settings } from "lucide-react";
import { AUTO_REFRESH_MS } from "./config/api";
import { useChamados } from "./hooks/useChamados";
import { useClientes } from "./hooks/useClientes";
import AppLayout from "./components/layout/AppLayout";
import Header from "./components/layout/Header";
import Sidebar from "./components/layout/Sidebar";
import SummaryCards from "./components/dashboard/SummaryCards";
import Filters from "./components/dashboard/Filters";
import TicketBoard from "./components/tickets/TicketBoard";
import TicketList from "./components/tickets/TicketList";
import TicketForm from "./components/tickets/TicketForm";
import TicketDetails from "./components/tickets/TicketDetails";
import EmptyState from "./components/tickets/EmptyState";
import ClientesPage from "./components/clientes/ClientesPage";
import ClienteForm from "./components/clientes/ClienteForm";
import ClienteDetails from "./components/clientes/ClienteDetails";
import ConfirmDialog from "./components/ui/ConfirmDialog";
import ErrorState from "./components/ui/ErrorState";
import { useToast } from "./components/ui/Toast";
import { FILTROS_VAZIOS, filtrarChamados } from "./utils/chamados";

const TITULOS = { visao: "Visão geral", chamados: "Chamados", clientes: "Clientes", relatorios: "Relatórios", config: "Configurações" };

function lerPreferencia(chave, padrao) {
  try {
    const v = localStorage.getItem(chave);
    return v === null ? padrao : v === "1";
  } catch {
    return padrao;
  }
}
function gravarPreferencia(chave, valor) {
  try {
    localStorage.setItem(chave, valor ? "1" : "0");
  } catch {
    /* navegação privada: ignora */
  }
}

export default function App() {
  const toast = useToast();
  const [pagina, setPagina] = useState("visao");
  const [filtros, setFiltros] = useState(FILTROS_VAZIOS);
  const [buscaClientes, setBuscaClientes] = useState("");
  const [recolhida, setRecolhida] = useState(() => lerPreferencia("hd.recolhida", false));
  const [menuAberto, setMenuAberto] = useState(false);
  const [autoAtualizar, setAutoAtualizar] = useState(() => lerPreferencia("hd.auto", false));

  const dados = useChamados({ autoAtualizar, intervalo: AUTO_REFRESH_MS });
  const { chamados, carregando, erro, apiStatus } = dados;
  const cli = useClientes();

  // Modais
  const [formChamado, setFormChamado] = useState(null); // { chamado }
  const [detalheId, setDetalheId] = useState(null);
  const [exclusao, setExclusao] = useState(null); // { chamado, processando, erro }
  const [formCliente, setFormCliente] = useState(null); // { cliente }
  const [detalheClienteId, setDetalheClienteId] = useState(null);
  const [exclusaoCliente, setExclusaoCliente] = useState(null);

  const mapaClientes = useMemo(() => new Map(cli.clientes.map((c) => [c.id, c])), [cli.clientes]);
  const filtrados = useMemo(
    () => filtrarChamados(chamados, filtros, (id) => mapaClientes.get(id)?.nome),
    [chamados, filtros, mapaClientes]
  );

  const chamadoDetalhe = chamados.find((c) => c.id === detalheId);
  const clienteDetalhe = cli.clientes.find((c) => c.id === detalheClienteId);

  // Chamado aberto no painel foi excluído por fora (ex.: Postman) e sumiu após a sincronização.
  useEffect(() => {
    if (detalheId && !carregando && !chamadoDetalhe) {
      toast.aviso(`O chamado #${detalheId} não existe mais.`);
      setDetalheId(null);
    }
  }, [detalheId, carregando, chamadoDetalhe, toast]);

  useEffect(() => {
    if (detalheClienteId && !cli.carregando && !clienteDetalhe) setDetalheClienteId(null);
  }, [detalheClienteId, cli.carregando, clienteDetalhe]);

  const navegar = (id) => {
    setPagina(id);
    setMenuAberto(false);
  };
  const alternarAuto = () => {
    const novo = !autoAtualizar;
    setAutoAtualizar(novo);
    gravarPreferencia("hd.auto", novo);
    toast.info(novo ? "Atualização automática ligada (15 s)" : "Atualização automática desligada");
  };
  const alternarRecolher = () => {
    const novo = !recolhida;
    setRecolhida(novo);
    gravarPreferencia("hd.recolhida", novo);
  };

  /* ---------- chamados ---------- */
  async function salvarChamado(payload) {
    const editando = formChamado.chamado;
    const salvo = editando ? await dados.atualizarCompleto(editando.id, payload) : await dados.criar(payload);
    setFormChamado(null);
    toast.sucesso(editando ? `Chamado #${salvo.id} atualizado` : `Chamado #${salvo.id} criado`);
  }

  async function confirmarExclusao() {
    const { chamado } = exclusao;
    setExclusao((e) => ({ ...e, processando: true, erro: "" }));
    try {
      await dados.excluir(chamado.id);
      setExclusao(null);
      if (detalheId === chamado.id) setDetalheId(null);
      toast.sucesso(`Chamado #${chamado.id} excluído`);
    } catch (e) {
      setExclusao((x) => ({ ...x, processando: false, erro: e.message })); // o cartão permanece na tela
    }
  }

  /* ---------- clientes ---------- */
  async function salvarCliente(payload) {
    const editando = formCliente.cliente;
    const salvo = editando ? await cli.atualizar(editando.id, payload) : await cli.criar(payload);
    setFormCliente(null);
    toast.sucesso(editando ? "Cliente atualizado" : `Cliente ${salvo.nome} cadastrado`);
  }

  async function confirmarExclusaoCliente() {
    const { cliente } = exclusaoCliente;
    setExclusaoCliente((e) => ({ ...e, processando: true, erro: "" }));
    try {
      await cli.excluir(cliente.id);
      setExclusaoCliente(null);
      if (detalheClienteId === cliente.id) setDetalheClienteId(null);
      toast.sucesso("Cliente excluído");
    } catch (e) {
      setExclusaoCliente((x) => ({ ...x, processando: false, erro: e.message }));
    }
  }

  const abrirNovo = () => (pagina === "clientes" ? setFormCliente({ cliente: null }) : setFormChamado({ chamado: null }));
  const abrirNovoChamado = () => setFormChamado({ chamado: null });

  const acoesChamado = {
    onAbrir: setDetalheId,
    onEditar: (c) => setFormChamado({ chamado: c }),
    onExcluir: (c) => setExclusao({ chamado: c, processando: false, erro: "" }),
  };

  const emPaginaDeChamados = pagina === "visao" || pagina === "chamados";
  const semDadosEComErro = erro && chamados.length === 0;

  function conteudo() {
    if (pagina === "relatorios" || pagina === "config") {
      return (
        <EmptyState
          icone={pagina === "relatorios" ? ClipboardList : Settings}
          titulo={TITULOS[pagina]}
          texto="Funcionalidade preparada para uma etapa futura."
        />
      );
    }
    if (pagina === "clientes") {
      return (
        <ClientesPage
          clientes={cli.clientes}
          chamados={chamados}
          carregando={cli.carregando}
          erro={cli.erro}
          busca={buscaClientes}
          onLimparBusca={() => setBuscaClientes("")}
          onNovo={() => setFormCliente({ cliente: null })}
          onAbrir={setDetalheClienteId}
          onEditar={(c) => setFormCliente({ cliente: c })}
          onExcluir={(c) => setExclusaoCliente({ cliente: c, processando: false, erro: "" })}
          onRecarregar={cli.recarregar}
        />
      );
    }
    if (semDadosEComErro) {
      return <ErrorState mensagem="Não foi possível conectar à API." onTentar={() => dados.sincronizar()} tentando={dados.sincronizando} />;
    }
    return (
      <>
        {erro && (
          <p className="alerta alerta--aviso" role="alert">
            Sem conexão com a API. Exibindo os últimos dados carregados.
          </p>
        )}
        {pagina === "visao" && <SummaryCards chamados={chamados} carregando={carregando} />}
        <Filters filtros={filtros} onChange={setFiltros} mostrando={filtrados.length} total={chamados.length} />
        {pagina === "visao" ? (
          <TicketBoard
            chamados={filtrados}
            totalGeral={chamados.length}
            carregando={carregando}
            mapaClientes={mapaClientes}
            destaques={dados.destaques}
            onNovo={abrirNovoChamado}
            onLimparFiltros={() => setFiltros(FILTROS_VAZIOS)}
            onMover={dados.moverStatus}
            {...acoesChamado}
          />
        ) : (
          <TicketList
            chamados={filtrados}
            totalGeral={chamados.length}
            mapaClientes={mapaClientes}
            destaques={dados.destaques}
            onNovo={abrirNovoChamado}
            onLimparFiltros={() => setFiltros(FILTROS_VAZIOS)}
            {...acoesChamado}
          />
        )}
      </>
    );
  }

  return (
    <>
      <AppLayout
        recolhida={recolhida}
        sidebar={
          <Sidebar
            pagina={pagina}
            onNavegar={navegar}
            onNovo={() => {
              setMenuAberto(false);
              abrirNovoChamado();
            }}
            recolhida={recolhida}
            onRecolher={alternarRecolher}
            aberta={menuAberto}
            onFechar={() => setMenuAberto(false)}
            apiStatus={apiStatus}
          />
        }
        header={
          <Header
            titulo={TITULOS[pagina]}
            mostrarBusca={emPaginaDeChamados || pagina === "clientes"}
            busca={pagina === "clientes" ? buscaClientes : filtros.busca}
            placeholderBusca={pagina === "clientes" ? "Buscar por nome ou empresa" : "Buscar por título, descrição ou #ID"}
            onBusca={(v) => (pagina === "clientes" ? setBuscaClientes(v) : setFiltros((f) => ({ ...f, busca: v })))}
            onAbrirMenu={() => setMenuAberto(true)}
            onAtualizar={dados.atualizar}
            sincronizando={dados.sincronizando}
            ultimaSync={dados.ultimaSync}
            autoAtualizar={autoAtualizar}
            onAlternarAuto={alternarAuto}
            onNovo={abrirNovo}
            rotuloNovo={pagina === "clientes" ? "Novo cliente" : "Novo chamado"}
            apiStatus={apiStatus}
          />
        }
      >
        {conteudo()}
      </AppLayout>

      {chamadoDetalhe && (
        <TicketDetails
          chamado={chamadoDetalhe}
          cliente={mapaClientes.get(chamadoDetalhe.cliente)}
          onFechar={() => setDetalheId(null)}
          onEditar={(c) => setFormChamado({ chamado: c })}
          onExcluir={(c) => setExclusao({ chamado: c, processando: false, erro: "" })}
          onMudarStatus={dados.moverStatus}
        />
      )}

      {formChamado && (
        <TicketForm chamado={formChamado.chamado} clientes={cli.clientes} onSalvar={salvarChamado} onFechar={() => setFormChamado(null)} />
      )}

      {exclusao && (
        <ConfirmDialog
          titulo="Excluir chamado"
          mensagem={`Tem certeza de que deseja excluir o chamado #${exclusao.chamado.id}?`}
          detalhe="Esta ação não poderá ser desfeita. O histórico de atendimento do chamado também será removido."
          confirmarTexto="Excluir chamado"
          perigo
          carregando={exclusao.processando}
          erro={exclusao.erro}
          onConfirmar={confirmarExclusao}
          onCancelar={() => setExclusao(null)}
        />
      )}

      {clienteDetalhe && (
        <ClienteDetails
          cliente={clienteDetalhe}
          chamados={chamados}
          onFechar={() => setDetalheClienteId(null)}
          onEditar={(c) => setFormCliente({ cliente: c })}
          onExcluir={(c) => setExclusaoCliente({ cliente: c, processando: false, erro: "" })}
          onAbrirChamado={(id) => {
            setDetalheClienteId(null);
            setDetalheId(id);
          }}
        />
      )}

      {formCliente && <ClienteForm cliente={formCliente.cliente} onSalvar={salvarCliente} onFechar={() => setFormCliente(null)} />}

      {exclusaoCliente && (
        <ConfirmDialog
          titulo="Excluir cliente"
          mensagem={`Tem certeza de que deseja excluir o cliente ${exclusaoCliente.cliente.nome}?`}
          detalhe="Esta ação não poderá ser desfeita. Clientes com chamados vinculados não podem ser excluídos; nesse caso, marque-o como inativo."
          confirmarTexto="Excluir cliente"
          perigo
          carregando={exclusaoCliente.processando}
          erro={exclusaoCliente.erro}
          onConfirmar={confirmarExclusaoCliente}
          onCancelar={() => setExclusaoCliente(null)}
        />
      )}
    </>
  );
}
