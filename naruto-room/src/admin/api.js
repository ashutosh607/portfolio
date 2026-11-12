/**
 * Resolves and normalizes the backend API base URL
 */
export function getApiBaseUrl() {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
    const clean = envUrl.trim().replace(/\/+$/, '');
    return clean.endsWith('/api') ? clean : `${clean}/api`;
  }

  if (typeof window !== 'undefined') {
    const override = sessionStorage.getItem('shinobi_api_url') || localStorage.getItem('shinobi_api_url');
    if (override && typeof override === 'string' && override.trim()) {
      const clean = override.trim().replace(/\/+$/, '');
      return clean.endsWith('/api') ? clean : `${clean}/api`;
    }
  }

  if (import.meta.env.DEV) {
    return 'http://localhost:5000/api';
  }

  return '/api';
}

const API_BASE_URL = getApiBaseUrl();

/**
 * Fetch wrapper for Admin API supporting both HTTP-only cookies and Bearer tokens
 */
export async function apiRequest(endpoint, options = {}) {
  const baseUrl = getApiBaseUrl();

  // Strip duplicate leading /api or / from endpoint
  const cleanEndpoint = endpoint.replace(/^\/?(?:api\/)?/, '');
  const url = `${baseUrl}/${cleanEndpoint}`;

  const headers = {
    ...options.headers,
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  // Cross-origin authentication: Attach Bearer token if present in client storage
  if (typeof window !== 'undefined') {
    const token = sessionStorage.getItem('shinobi_admin_token') || localStorage.getItem('shinobi_admin_token');
    if (token && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  let response;
  try {
    response = await fetch(url, {
      ...options,
      credentials: 'include',
      headers,
    });
  } catch (networkErr) {
    const isRenderColdStart = /failed to fetch|networkerror/i.test(networkErr.message || '');
    throw new Error(
      isRenderColdStart
        ? `Cannot connect to backend (${url}). If your Render service is on free tier, it may take ~30-45 seconds to wake up on cold start. Please wait a moment and try again.`
        : `Network error connecting to backend: ${networkErr.message || 'Connection failed'}`
    );
  }

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('text/html')) {
    throw new Error(
      `Received HTML instead of JSON from ${url}. Check that VITE_API_URL is configured in your Vercel Project Settings (e.g. https://your-backend.onrender.com/api).`
    );
  }

  const data = await response.json().catch(() => ({}));

  if (response.status === 401 && !cleanEndpoint.startsWith('auth/login')) {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('shinobi_admin_token');
      localStorage.removeItem('shinobi_admin_token');
      window.dispatchEvent(new Event('cms-session-ended'));
    }
  }

  if (!response.ok || data.success === false || !Object.keys(data).length) {
    const details = Array.isArray(data.errors) && data.errors.length
      ? data.errors.map((e) => (e.field ? `${e.field}: ${e.message}` : e.message)).join('; ')
      : '';
    const baseMsg = data.message || `Request failed with status ${response.status}`;
    throw new Error(details && !baseMsg.includes(details) ? `${baseMsg}: ${details}` : baseMsg);
  }

  return data;
}

export { API_BASE_URL };
