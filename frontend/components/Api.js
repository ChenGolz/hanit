const DEFAULT_LOCAL_API = 'http://localhost:8001';

function resolveApiBaseUrl() {
  if (process.env.NEXT_PUBLIC_API_BASE_URL) return process.env.NEXT_PUBLIC_API_BASE_URL;
  if (typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname)) {
    return DEFAULT_LOCAL_API;
  }
  return '';
}

const API = resolveApiBaseUrl();

export function getAuthToken() {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem('petconnect-token') || '';
}

export function setAuthToken(token) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem('petconnect-token', token);
}

export async function fetchJson(path, options = {}) {
  if (!API) {
    throw new Error('Missing NEXT_PUBLIC_API_BASE_URL for the static frontend. Point it to your hosted FastAPI backend.');
  }

  const headers = new Headers(options.headers || {});
  const token = getAuthToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(`${API}${path}`, { ...options, headers, cache: 'no-store' });
  if (!res.ok) {
    let message = 'Request failed';
    try {
      const data = await res.json();
      message = data.detail || message;
    } catch {}
    throw new Error(message);
  }
  return res.json();
}

export function apiUrl(path) {
  if (!API) {
    throw new Error('Missing NEXT_PUBLIC_API_BASE_URL for the static frontend.');
  }
  return `${API}${path}`;
}

export { API };
