import { getBaseUrl } from '../api/client.js';

export function resolveImageUri(rawOrObj) {
  try {
    let raw = '';
    if (!rawOrObj) return null;
    if (typeof rawOrObj === 'string') raw = rawOrObj;
    else raw = (rawOrObj.image || rawOrObj.image_url || '') + '';
    raw = raw.trim();
    if (!raw) return null;
    // keep data urls
    if (raw.startsWith('data:')) return raw;
    // already absolute
    if (/^https?:\/\//i.test(raw)) {
      // replace localhost-like hosts with the configured base host so device can reach it
      try {
        const m = raw.match(/^(https?:\/\/)([^\/]+)(.*)$/i);
        if (m) {
          const proto = m[1];
          const host = m[2];
          const rest = m[3] || '';
          if (/^(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?$/i.test(host)) {
            const base = (getBaseUrl && typeof getBaseUrl === 'function' && getBaseUrl()) || '';
            const hostRoot = base.replace(/\/api\/?$/, '').replace(/\/$/, '');
            if (hostRoot) return hostRoot + rest;
          }
        }
      } catch (e) {}
      return raw;
    }
    // relative path starting with /
    if (raw.startsWith('/')) {
      const base = (getBaseUrl && typeof getBaseUrl === 'function' && getBaseUrl()) || '';
      const hostRoot = base.replace(/\/api\/?$/, '').replace(/\/$/, '');
      return hostRoot ? hostRoot + raw : raw;
    }
    // other relative paths: prefix with hostRoot
    const base = (getBaseUrl && typeof getBaseUrl === 'function' && getBaseUrl()) || '';
    const hostRoot = base.replace(/\/api\/?$/, '').replace(/\/$/, '');
    return hostRoot ? `${hostRoot}/${raw}` : raw;
  } catch (e) {
    return null;
  }
}

export default resolveImageUri;
