/**
 * AGENT-SYNC Unified Configuration & URL Resolution
 * 
 * In Unified Server Mode (Default):
 *   Frontend and Backend share the same origin (http://localhost:5000).
 *   API requests use relative paths ('/api/...')
 *   WebSocket automatically connects to ws://<current-host>/ws or wss://<current-host>/ws.
 * 
 * In Split Architecture (e.g. Vercel Frontend + External Backend):
 *   VITE_API_URL and VITE_WS_URL can be provided to override endpoints.
 */

export const getApiUrl = () => {
  const envApi = import.meta.env.VITE_API_URL;
  if (envApi && envApi.trim() !== '') {
    return envApi.trim().replace(/\/+$/, '');
  }
  // Same-origin default
  return '';
};

export const getWsUrl = () => {
  const envWs = import.meta.env.VITE_WS_URL;
  if (envWs && envWs.trim() !== '') {
    return envWs.trim();
  }

  // If VITE_API_URL is configured separately, derive the WS URL from it
  const envApi = import.meta.env.VITE_API_URL;
  if (envApi && envApi.trim() !== '') {
    const cleanApi = envApi.trim().replace(/\/+$/, '');
    const isHttps = cleanApi.startsWith('https://');
    const wsProto = isHttps ? 'wss://' : 'ws://';
    const hostAndPath = cleanApi.replace(/^https?:\/\//, '');
    return `${wsProto}${hostAndPath}/ws`;
  }

  // Same-origin default: automatically connects to current server's /ws endpoint
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}/ws`;
};
