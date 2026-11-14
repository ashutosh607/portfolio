/**
 * Resolves and normalizes the backend API base URL
 */
export function getApiBaseUrl() {
  const envUrl = import.meta.env.VITE_API_URL;
  // Vercel forwards these same-origin requests to the portfolio's Render API.
  if (import.meta.env.PROD && (!envUrl || /^https:\/\/portfolio-ml02\.onrender\.com(?:\/api)?\/?$/.test(envUrl))) {
    return '/cms-api';
  }
  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
    const clean = envUrl.trim().replace(/\/+$/, '');
    return clean.endsWith('/api') ? clean : `${clean}/api`;
  }

  if (import.meta.env.DEV) {
    return 'http://localhost:5000/api';
  }

  return '/api';
}

const API_BASE_URL = getApiBaseUrl();

/**
 * Fetch wrapper for Admin API using the server-managed session cookie
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
