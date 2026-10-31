import { useId, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

const FOCAVEIS =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

const pilha = []; // modais abertos; só o do topo reage ao teclado

export default function Modal({ titulo, subtitulo, onFechar, children, rodape, lateral = false, largura }) {
  const ref = useRef(null);
  const aoFechar = useRef(onFechar);
  aoFechar.current = onFechar;
  const idTitulo = useId();

  // Layout effect: a pilha de modais é atualizada de forma síncrona ao abrir/fechar.
  useLayoutEffect(() => {
    const anterior = document.activeElement;
    const el = ref.current;
    pilha.push(el);
    document.body.classList.add("sem-rolagem");
    (el.querySelector("[data-autofocus]") || el.querySelector(FOCAVEIS) || el).focus();

    // Escuta no document: se o elemento focado sumir (ex.: botão excluído), o Escape ainda funciona.
    function aoTeclar(e) {
      if (pilha[pilha.length - 1] !== el) return;
      if (e.key === "Escape") {
        aoFechar.current?.();
      } else if (e.key === "Tab") {
        const itens = [...el.querySelectorAll(FOCAVEIS)];
        if (!itens.length) return;
        const primeiro = itens[0];
        const ultimo = itens[itens.length - 1];
        if (!el.contains(document.activeElement)) {
          e.preventDefault();
          primeiro.focus();
        } else if (e.shiftKey && document.activeElement === primeiro) {
          e.preventDefault();
          ultimo.focus();
        } else if (!e.shiftKey && document.activeElement === ultimo) {
          e.preventDefault();
          primeiro.focus();
        }
      }
    }
    document.addEventListener("keydown", aoTeclar);
    return () => {
      document.removeEventListener("keydown", aoTeclar);
      pilha.splice(pilha.indexOf(el), 1);
      if (!pilha.length) document.body.classList.remove("sem-rolagem");
      if (anterior?.isConnected) anterior.focus();
      else pilha[pilha.length - 1]?.focus(); // devolve o foco ao modal de baixo
    };
  }, []);

  return createPortal(
    <div className={`overlay${lateral ? " overlay--lateral" : ""}`} onMouseDown={(e) => e.target === e.currentTarget && onFechar?.()}>
      <div
        ref={ref}
        className={`modal${lateral ? " modal--lateral" : ""}`}
        style={largura ? { maxWidth: largura } : undefined}
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        tabIndex={-1}
      >
        <header className="modal__cab">
          <div>
            <h2 id={idTitulo}>{titulo}</h2>
            {subtitulo && <p className="texto-suave">{subtitulo}</p>}
          </div>
          <button type="button" className="btn-icone" onClick={onFechar} aria-label="Fechar">
            <X size={18} />
          </button>
        </header>
        <div className="modal__corpo">{children}</div>
        {rodape && <footer className="modal__rod">{rodape}</footer>}
      </div>
    </div>,
    document.body
  );
}
