/**
 * AGENT-SYNC Client Configuration & URL Resolution
 * 
 * In Development (localhost):
 *   Vite dev proxy forwards `/api` to `http://localhost:5000` and `/ws` to `ws://localhost:5000`.
 * 
 * In Production (Vercel):
 *   Frontend connects to public backend specified via `VITE_API_URL` and `VITE_WS_URL`.
 */

export const getApiUrl = () => {
  const envApi = import.meta.env.VITE_API_URL;
  if (envApi && envApi.trim() !== '') {
    return envApi.replace(/\/+$/, '');
  }
  // In development, empty string uses relative paths proxied by Vite
  return '';
};

export const getWsUrl = () => {
  const envWs = import.meta.env.VITE_WS_URL;
  if (envWs && envWs.trim() !== '') {
    return envWs.trim();
  }

  // If VITE_API_URL is configured, auto-derive the WebSocket URL
  const envApi = import.meta.env.VITE_API_URL;
  if (envApi && envApi.trim() !== '') {
    const cleanApi = envApi.trim().replace(/\/+$/, '');
    const isHttps = cleanApi.startsWith('https://');
    const wsProto = isHttps ? 'wss://' : 'ws://';
    const hostAndPath = cleanApi.replace(/^https?:\/\//, '');
    return `${wsProto}${hostAndPath}/ws`;
  }

  // Fallback for local Vite dev server
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}/ws`;
};
