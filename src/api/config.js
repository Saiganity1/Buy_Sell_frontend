// Fixed API base URL for deployed backend on Render; override-able via env on Snack
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Default API base URL for deployed backend on Render (production)
const DEFAULT_API_BASE_URL = 'https://buy-sell-backend-4uk9.onrender.com/api';

// Local development URL for web
const LOCAL_API_BASE_URL = 'http://localhost:8000/api';

function detectDevLanUrl() {
  // When running on a physical device or Android emulator via Expo, try to
  // infer the LAN IP from the dev server and point the API to port 8000.
  try {
    if (Platform.OS !== 'web') {
      const hostLike =
        Constants.expoGoConfig?.debuggerHost ||
        Constants.expoConfig?.hostUri ||
        Constants.expoConfig?.developer?.host || '';
      if (hostLike) {
        const host = hostLike.split(':')[0];
        // Match IPv4 addresses only
        if (/^\d+\.\d+\.\d+\.\d+$/.test(host)) {
          return `http://${host}:8000/api`;
        }
      }
    } else if (typeof window !== 'undefined') {
      const hn = window.location.hostname;
      if (hn === 'localhost' || hn === '127.0.0.1') return LOCAL_API_BASE_URL;
    }
  } catch {}
  return null;
}

function detectBaseUrl() {
  // 1) Respect Expo public env (Expo 49+) or classic process.env
  try {
    // eslint-disable-next-line no-undef
    const envUrl = (typeof process !== 'undefined' && process && process.env && (process.env.EXPO_PUBLIC_API_BASE_URL || process.env.API_BASE_URL)) || null;
    if (envUrl) return envUrl;
  } catch {}

  // 2) Detect LAN while in development (Expo dev server present)
  const lan = detectDevLanUrl();
  if (lan) return lan;

  // 3) Fallback to production URL
  return DEFAULT_API_BASE_URL;
}

export const API_BASE_URL = detectBaseUrl();
