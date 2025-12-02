function detectBaseUrl() {
  try {
    // Prefer explicit env when provided (Snack/Web only)
    // eslint-disable-next-line no-undef
    const envUrl = typeof process !== 'undefined' && process && process.env && process.env.API_BASE_URL;
    if (envUrl) return envUrl;
  } catch {}
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    const host = window.location.hostname;
    return `http://${host}:8000/api`;
  }
  return 'http://127.0.0.1:8000/api';
}

export const API_BASE_URL = detectBaseUrl();
