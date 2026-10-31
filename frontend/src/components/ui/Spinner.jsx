export default function Spinner({ rotulo = "Carregando", pequeno = false }) {
  return <span className={`spinner${pequeno ? " spinner--pequeno" : ""}`} role="status" aria-label={rotulo} />;
}
