const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api');

/**
 * Fetch wrapper for Admin API using the HTTP-only admin session cookie
 */
export async function apiRequest(endpoint, options = {}) {

  const headers = {
    ...options.headers,
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (response.status === 401 && endpoint !== '/auth/login') window.dispatchEvent(new Event('cms-session-ended'));
  if (!response.ok || data.success === false || !Object.keys(data).length) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
}

export { API_BASE_URL };

