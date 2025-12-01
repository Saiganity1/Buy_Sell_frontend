import { API_BASE_URL } from './config';

export function buildWsUrl(path: string) {
  // Convert http(s)://host[:port]/api -> ws(s)://host[:port]
  try {
    const api = new URL(API_BASE_URL);
    const protocol = api.protocol === 'https:' ? 'wss:' : 'ws:';
    const base = `${protocol}//${api.host}`; // includes :port
    return `${base}${path}`;
  } catch {
    return path.startsWith('ws') ? path : `ws://127.0.0.1:8000${path}`;
  }
}
