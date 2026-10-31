import { STATUS, resumir } from "../../utils/chamados";

export default function SummaryCards({ chamados, carregando }) {
  const { total, porStatus } = resumir(chamados);
  const itens = [
    { rotulo: "Total de chamados", valor: total, classe: "total" },
    ...STATUS.map((s) => ({ rotulo: s.valor === "Aberto" ? "Abertos" : s.valor === "Resolvido" ? "Resolvidos" : s.valor === "Pendente" ? "Pendentes" : s.valor, valor: porStatus[s.valor], classe: s.classe })),
  ];
  return (
    <section className="resumo" aria-label="Resumo dos chamados">
      {itens.map((i) => (
        <div key={i.classe} className={`resumo__card resumo__card--${i.classe}`}>
          <span className="resumo__rotulo">{i.rotulo}</span>
          <strong className="resumo__valor" aria-busy={carregando}>
            {carregando ? "–" : i.valor}
          </strong>
        </div>
      ))}
    </section>
  );
}
