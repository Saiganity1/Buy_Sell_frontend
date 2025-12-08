import { API_BASE_URL } from './config';

// Build a WebSocket URL compatible with Android Hermes (no global URL implementation)
export function buildWsUrl(path) {
  // If caller already provided full ws(s) URL, return as-is
  if (/^wss?:\/\//i.test(path)) return path;

  try {
    const isHttps = /^https:\/\//i.test(API_BASE_URL);
    const match = API_BASE_URL.match(/^https?:\/\/([^\/#?]+)/i);
    const host = match ? match[1] : '127.0.0.1:8000';
    const protocol = isHttps ? 'wss' : 'ws';
    const base = `${protocol}://${host}`;
    return `${base}${path.startsWith('/') ? path : `/${path}`}`;
  } catch (e) {
    // Fallback to localhost dev default
    return `ws://127.0.0.1:8000${path.startsWith('/') ? path : `/${path}`}`;
  }
}
