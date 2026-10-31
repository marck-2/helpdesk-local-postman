const dataHora = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
const dataCurta = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" });
const hora = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
const dataLonga = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "long" });

const valida = (iso) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
};

export const formatarDataHora = (iso) => (valida(iso) ? dataHora.format(valida(iso)) : "—");
export const formatarDataCurta = (iso) => (valida(iso) ? dataCurta.format(valida(iso)).replace(".", "") : "—");
export const formatarHora = (d) => (d ? hora.format(d) : "—");
export const formatarDataLonga = (d = new Date()) => dataLonga.format(d);
