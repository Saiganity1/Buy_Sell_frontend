// Fixed API base URL for deployed backend on Render; override-able via env on Snack
const DEFAULT_API_BASE_URL = 'https://buy-sell-backend-4uk9.onrender.com/api';

function detectBaseUrl() {
  try {
    // Prefer explicit env when provided (Snack/Web only)
    // eslint-disable-next-line no-undef
    const envUrl = typeof process !== 'undefined' && process && process.env && process.env.API_BASE_URL;
    if (envUrl) return envUrl;
  } catch {}
  return DEFAULT_API_BASE_URL;
}

export const API_BASE_URL = detectBaseUrl();
