import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { CircleCheck, Info, TriangleAlert, X } from "lucide-react";

const ToastContext = createContext(null);

const ICONES = { sucesso: CircleCheck, erro: TriangleAlert, aviso: TriangleAlert, info: Info };

export function ToastProvider({ children }) {
  const [itens, setItens] = useState([]);
  const contador = useRef(0);

  const remover = useCallback((id) => setItens((l) => l.filter((t) => t.id !== id)), []);

  const mostrar = useCallback(
    (tipo, mensagem) => {
      const id = ++contador.current;
      setItens((l) => [...l.slice(-3), { id, tipo, mensagem }]);
      setTimeout(() => remover(id), tipo === "erro" ? 6000 : 3800);
    },
    [remover]
  );

  const api = useMemo(
    () => ({
      sucesso: (m) => mostrar("sucesso", m),
      erro: (m) => mostrar("erro", m),
      aviso: (m) => mostrar("aviso", m),
      info: (m) => mostrar("info", m),
    }),
    [mostrar]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toasts" aria-live="polite" aria-atomic="false">
        {itens.map((t) => {
          const Icone = ICONES[t.tipo];
          return (
            <div key={t.id} className={`toast toast--${t.tipo}`} role={t.tipo === "erro" ? "alert" : "status"}>
              <Icone size={18} aria-hidden="true" />
              <span>{t.mensagem}</span>
              <button type="button" className="btn-icone btn-icone--mini" onClick={() => remover(t.id)} aria-label="Dispensar aviso">
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast precisa estar dentro de <ToastProvider>.");
  return ctx;
}
