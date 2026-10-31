import { useEffect, useRef, useState } from "react";
import { EllipsisVertical } from "lucide-react";

// Menu de três pontos. itens: [{ rotulo, icone: Componente, onClick, perigo }]
export default function Menu({ itens, rotulo = "Mais ações" }) {
  const [aberto, setAberto] = useState(false);
  const raiz = useRef(null);

  useEffect(() => {
    if (!aberto) return;
    const fora = (e) => !raiz.current?.contains(e.target) && setAberto(false);
    const tecla = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        setAberto(false);
        raiz.current?.querySelector("button")?.focus();
      }
    };
    document.addEventListener("mousedown", fora);
    document.addEventListener("keydown", tecla, true);
    return () => {
      document.removeEventListener("mousedown", fora);
      document.removeEventListener("keydown", tecla, true);
    };
  }, [aberto]);

  return (
    <div className="menu" ref={raiz}>
      <button type="button" className="btn-icone btn-icone--mini" aria-label={rotulo} aria-haspopup="menu" aria-expanded={aberto} onClick={() => setAberto((a) => !a)}>
        <EllipsisVertical size={16} />
      </button>
      {aberto && (
        <ul className="menu__lista" role="menu">
          {itens.map(({ rotulo: r, icone: Icone, onClick, perigo }) => (
            <li key={r} role="none">
              <button
                type="button"
                role="menuitem"
                className={`menu__item${perigo ? " menu__item--perigo" : ""}`}
                onClick={() => {
                  setAberto(false);
                  onClick();
                }}
              >
                <Icone size={15} aria-hidden="true" />
                {r}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
