(() => {
  // Se a página for aberta direto do arquivo (file://), aponta para o servidor local.
  const ORIGIN = location.protocol === "file:" ? "http://127.0.0.1:8000" : location.origin;
  const API = `${ORIGIN}/api/chamados/`;

  const STATUS = [
    { nome: "Aberto", cor: "var(--st-aberto)" },
    { nome: "Em andamento", cor: "var(--st-andamento)" },
    { nome: "Pendente", cor: "var(--st-pendente)" },
    { nome: "Resolvido", cor: "var(--st-resolvido)" },
  ];

  const $ = (s) => document.querySelector(s);
  const state = { chamados: [], busca: "", prioridade: "", editandoId: null };

  /* ---------- utilidades ---------- */
  function h(tag, props = {}, ...children) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(props)) {
      if (k === "class") el.className = v;
      else if (k === "dataset") Object.assign(el.dataset, v);
      else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
      else if (v !== false && v != null) el.setAttribute(k, v === true ? "" : v);
    }
    for (const c of children.flat()) if (c != null) el.append(c);
    return el;
  }

  function toast(msg, erro = false) {
    const t = h("div", { class: "toast" + (erro ? " error" : ""), role: "status" }, msg);
    $("#toasts").append(t);
    setTimeout(() => t.remove(), 3200);
  }

  function dataCurta(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }).replace(".", "") +
      " às " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  }

  async function chamar(url, opts = {}) {
    const res = await fetch(url, {
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      ...opts,
    });
    if (res.status === 204) return null;
    const dados = await res.json().catch(() => null);
    if (!res.ok) {
      const e = new Error("Falha na requisição");
      e.status = res.status;
      e.dados = dados;
      throw e;
    }
    return dados;
  }

  /* ---------- carregar e filtrar ---------- */
  async function carregar() {
    try {
      state.chamados = await chamar(API);
      render();
    } catch {
      $("#board").replaceChildren(
        h("div", { class: "empty", style: "grid-column:1/-1" },
          "Não foi possível carregar os chamados. Confira se o servidor está rodando (python manage.py runserver).")
      );
    }
  }

  function filtrados() {
    const q = state.busca.trim().toLowerCase();
    return state.chamados.filter((c) =>
      (!state.prioridade || c.prioridade === state.prioridade) &&
      (!q || c.titulo.toLowerCase().includes(q) || c.descricao.toLowerCase().includes(q))
    );
  }

  /* ---------- render ---------- */
  function render() {
    const lista = filtrados();
    $("#total").textContent = lista.length;
    renderResumo(lista);
    renderBoard(lista);
  }

  function renderResumo(lista) {
    const meter = $("#meter");
    const legend = $("#legend");
    meter.replaceChildren();
    legend.replaceChildren();
    for (const s of STATUS) {
      const n = lista.filter((c) => c.status === s.nome).length;
      if (n) meter.append(h("span", { style: `flex-grow:${n};background:${s.cor}`, title: `${s.nome}: ${n}` }));
      legend.append(h("li", {}, h("span", { class: "dot", style: `background:${s.cor}` }), h("strong", {}, String(n)), s.nome));
    }
  }

  function renderBoard(lista) {
    const board = $("#board");
    board.replaceChildren();
    for (const s of STATUS) {
      const itens = lista.filter((c) => c.status === s.nome);
      const corpo = h("div", { class: "col-body" },
        itens.length ? itens.map(cartao) : h("div", { class: "empty" }, "Nenhum chamado aqui")
      );
      const col = h("div", { class: "col", dataset: { status: s.nome } },
        h("div", { class: "col-head" },
          h("span", { class: "dot", style: `background:${s.cor}` }), s.nome,
          h("span", { class: "count" }, String(itens.length))),
        corpo
      );
      col.addEventListener("dragover", (e) => { e.preventDefault(); col.classList.add("is-over"); });
      col.addEventListener("dragleave", (e) => { if (!col.contains(e.relatedTarget)) col.classList.remove("is-over"); });
      col.addEventListener("drop", (e) => {
        e.preventDefault();
        col.classList.remove("is-over");
        const id = Number(e.dataTransfer.getData("text/plain"));
        if (id) mudarStatus(id, s.nome);
      });
      board.append(col);
    }
  }

  function cartao(c) {
    const select = h("select", { "aria-label": `Status do chamado ${c.id}`, onchange: (e) => mudarStatus(c.id, e.target.value) },
      STATUS.map((s) => h("option", { value: s.nome, selected: s.nome === c.status }, s.nome)));

    const el = h("article", { class: "card", draggable: "true", dataset: { prioridade: c.prioridade } },
      h("h3", {}, c.titulo),
      h("p", {}, c.descricao),
      h("div", { class: "meta" },
        h("span", { class: "id" }, `#${c.id}`),
        h("span", {}, dataCurta(c.data_abertura)),
        h("span", { class: "pill" }, c.prioridade)),
      h("div", { class: "card-actions" },
        select,
        h("button", { class: "mini", type: "button", onclick: () => abrirForm(c) }, "Editar"),
        h("button", { class: "mini danger", type: "button", onclick: () => excluir(c) }, "Excluir"))
    );
    el.addEventListener("dragstart", (e) => { e.dataTransfer.setData("text/plain", String(c.id)); el.classList.add("dragging"); });
    el.addEventListener("dragend", () => el.classList.remove("dragging"));
    return el;
  }

  /* ---------- ações ---------- */
  async function mudarStatus(id, status) {
    const atual = state.chamados.find((c) => c.id === id);
    if (!atual || atual.status === status) return render();
    try {
      const novo = await chamar(`${API}${id}/`, { method: "PATCH", body: JSON.stringify({ status }) });
      Object.assign(atual, novo);
      toast(`Chamado #${id} movido para ${status}`);
    } catch {
      toast("Não foi possível alterar o status.", true);
    }
    render();
  }

  async function excluir(c) {
    if (!confirm(`Excluir o chamado #${c.id} "${c.titulo}"?`)) return;
    try {
      await chamar(`${API}${c.id}/`, { method: "DELETE" });
      state.chamados = state.chamados.filter((x) => x.id !== c.id);
      toast(`Chamado #${c.id} excluído`);
      render();
    } catch {
      toast("Não foi possível excluir o chamado.", true);
    }
  }

  /* ---------- formulário ---------- */
  const dlgForm = $("#dlg-form");
  const form = $("#form");

  function limparErros() {
    form.querySelectorAll(".err").forEach((e) => (e.textContent = ""));
    form.querySelectorAll(".field").forEach((f) => f.classList.remove("invalid"));
  }

  function mostrarErros(dados) {
    for (const [campo, msgs] of Object.entries(dados || {})) {
      const alvo = form.querySelector(`[data-err="${campo}"]`);
      if (alvo) {
        alvo.textContent = [].concat(msgs).join(" ");
        alvo.closest(".field").classList.add("invalid");
      }
    }
  }

  function abrirForm(c = null) {
    limparErros();
    state.editandoId = c ? c.id : null;
    $("#form-titulo").textContent = c ? `Editar chamado #${c.id}` : "Novo chamado";
    $("#btn-salvar").textContent = c ? "Salvar alterações" : "Criar chamado";
    form.titulo.value = c ? c.titulo : "";
    form.descricao.value = c ? c.descricao : "";
    form.status.value = c ? c.status : "Aberto";
    form.prioridade.value = c ? c.prioridade : "Média";
    dlgForm.showModal();
    form.titulo.focus();
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    limparErros();
    const corpo = {
      titulo: form.titulo.value.trim(),
      descricao: form.descricao.value.trim(),
      status: form.status.value,
      prioridade: form.prioridade.value,
    };
    const btn = $("#btn-salvar");
    btn.disabled = true;
    try {
      const editando = state.editandoId;
      const salvo = await chamar(editando ? `${API}${editando}/` : API, {
        method: editando ? "PUT" : "POST",
        body: JSON.stringify(corpo),
      });
      if (editando) state.chamados = state.chamados.map((c) => (c.id === editando ? salvo : c));
      else state.chamados.unshift(salvo);
      dlgForm.close();
      toast(editando ? `Chamado #${salvo.id} atualizado` : `Chamado #${salvo.id} criado`);
      render();
    } catch (err) {
      if (err.status === 400) mostrarErros(err.dados);
      else toast("Não foi possível salvar. Tente novamente.", true);
    } finally {
      btn.disabled = false;
    }
  });

  /* ---------- painel da API ---------- */
  const ENDPOINTS = [
    ["GET", "/api/chamados/", "Lista todos (aceita ?status=, ?prioridade=, ?busca=)"],
    ["POST", "/api/chamados/", "Cria um chamado"],
    ["GET", "/api/chamados/{id}/", "Busca um chamado"],
    ["PUT", "/api/chamados/{id}/", "Atualiza todos os campos"],
    ["PATCH", "/api/chamados/{id}/", "Atualiza só alguns campos"],
    ["DELETE", "/api/chamados/{id}/", "Exclui um chamado"],
    ["GET", "/api/chamados/resumo/", "Totais por status e prioridade"],
  ];
  const EXEMPLO = JSON.stringify(
    { titulo: "Computador não liga", descricao: "A máquina da recepção parou de funcionar.", status: "Aberto", prioridade: "Alta" },
    null, 2
  );

  function montarApi() {
    $("#api-base").textContent = ORIGIN;
    $("#exemplo").textContent = EXEMPLO;
    $("#endpoints").replaceChildren(...ENDPOINTS.map(([m, p, desc]) =>
      h("li", {},
        h("span", { class: `method ${m}` }, m),
        h("div", { class: "path" }, p, h("small", {}, desc)),
        h("button", { class: "mini", type: "button", onclick: () => copiar(ORIGIN + p, "URL copiada") }, "Copiar"))
    ));
  }

  async function copiar(texto, msg) {
    try { await navigator.clipboard.writeText(texto); toast(msg); }
    catch { toast("Não foi possível copiar automaticamente.", true); }
  }

  /* ---------- eventos gerais ---------- */
  $("#btn-novo").addEventListener("click", () => abrirForm());
  $("#btn-api").addEventListener("click", () => $("#dlg-api").showModal());
  $("#copiar-exemplo").addEventListener("click", () => copiar(EXEMPLO, "JSON copiado"));

  document.querySelectorAll("dialog").forEach((d) => {
    d.addEventListener("click", (e) => { if (e.target === d) d.close(); });
    d.querySelectorAll("[data-close]").forEach((b) => b.addEventListener("click", () => d.close()));
  });

  let timer;
  $("#busca").addEventListener("input", (e) => {
    clearTimeout(timer);
    timer = setTimeout(() => { state.busca = e.target.value; render(); }, 150);
  });

  document.querySelectorAll(".chip").forEach((chip) =>
    chip.addEventListener("click", () => {
      document.querySelectorAll(".chip").forEach((c) => c.classList.remove("is-on"));
      chip.classList.add("is-on");
      state.prioridade = chip.dataset.prioridade;
      render();
    })
  );

  montarApi();
  carregar();
})();
