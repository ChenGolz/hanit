const API = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8001';

export function getAuthToken() {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem('petconnect-token') || '';
}

export function setAuthToken(token) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem('petconnect-token', token);
}

export async function fetchJson(path, options = {}) {
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
  return `${API}${path}`;
}

export { API };
