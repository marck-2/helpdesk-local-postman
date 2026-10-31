// Endereço da API Django. Pode ser trocado pelo arquivo .env (veja .env.example).
export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api"
).replace(/\/+$/, "");

// Intervalo da atualização automática (opcional) e da verificação da API.
export const AUTO_REFRESH_MS = 15000;
export const PING_MS = 20000;
