import { WifiOff } from "lucide-react";
import { API_BASE_URL } from "../../config/api";
import Spinner from "./Spinner";

export default function ErrorState({ mensagem = "Não foi possível conectar à API.", onTentar, tentando }) {
  return (
    <div className="vazio vazio--erro" role="alert">
      <WifiOff size={36} aria-hidden="true" />
      <h2>{mensagem}</h2>
      <p className="texto-suave">
        Endereço configurado: <code>{API_BASE_URL}</code>
      </p>
      <p className="texto-suave">Verifique se o Django está em execução (<code>python manage.py runserver</code>) e tente novamente.</p>
      <button type="button" className="btn btn--primario" onClick={onTentar} disabled={tentando}>
        {tentando && <Spinner pequeno rotulo="Tentando" />}
        Tentar novamente
      </button>
    </div>
  );
}
