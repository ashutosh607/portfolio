function resolveApiBase() {
  const envUrl = import.meta.env?.VITE_API_URL;
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

  if (import.meta.env?.DEV) {
    return 'http://localhost:5000/api';
  }

  return '/api';
}

export const apiBase = resolveApiBase();
export let published = null;

const publishedListeners = new Set();

export function subscribePublished(listener) {
  publishedListeners.add(listener);
  return () => publishedListeners.delete(listener);
}

let loadPromise = null;

export function loadPublished() {
  if (loadPromise) return loadPromise;
  loadPromise = (async () => {
    try {
      const response = await fetch(apiBase + '/portfolio', { signal: AbortSignal.timeout(6000) });
      if (!response.ok) throw new Error('Portfolio API unavailable');
      const { data } = await response.json();
      if (['projects', 'skills', 'missions', 'dialogues'].every((key) => Array.isArray(data?.[key]))) {
        published = data;
        publishedListeners.forEach((fn) => {
          try {
            fn(published);
          } catch {
            // ignore listener error
          }
        });
      }
    } catch {
      console.warn('Portfolio API unavailable. Showing the bundled village.');
    }
    return published;
  })();
  return loadPromise;
}
