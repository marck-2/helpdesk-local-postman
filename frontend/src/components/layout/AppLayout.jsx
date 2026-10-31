export default function AppLayout({ sidebar, header, recolhida, children }) {
  return (
    <div className={`app${recolhida ? " app--recolhida" : ""}`}>
      <a className="pular" href="#conteudo">Ir para o conteúdo</a>
      {sidebar}
      <div className="app__coluna">
        {header}
        <main id="conteudo" className="conteudo" tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  );
}
