import { Wifi, WifiOff } from "lucide-react";
import { API_BASE_URL } from "../../config/api";
import Spinner from "../ui/Spinner";

const TEXTOS = {
  online: "API online",
  offline: "API indisponível",
  verificando: "Verificando conexão",
};

export default function ApiStatus({ status, compacto = false }) {
  return (
    <span className={`api-status api-status--${status}`} title={`${TEXTOS[status]} (${API_BASE_URL})`}>
      {status === "online" && <Wifi size={15} aria-hidden="true" />}
      {status === "offline" && <WifiOff size={15} aria-hidden="true" />}
      {status === "verificando" && <Spinner pequeno rotulo="Verificando conexão" />}
      <span className={compacto ? "sr-only" : undefined}>{TEXTOS[status]}</span>
    </span>
  );
}
