function resolveApiBase() {
  const envUrl = import.meta.env?.VITE_API_URL;
  // Vercel forwards these same-origin requests to the portfolio's Render API.
  if (
    import.meta.env?.PROD &&
    (!envUrl || /^https:\/\/portfolio-ml02\.onrender\.com(?:\/api)?\/?$/.test(envUrl))
  ) {
    return '/cms-api';
  }
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

  return '/cms-api';
}

export const apiBase = resolveApiBase();
export let published = null;

const publishedListeners = new Set();

export function subscribePublished(listener) {
  publishedListeners.add(listener);
  return () => publishedListeners.delete(listener);
}

let loadPromise = null;

async function fetchPortfolioOnce() {
  const response = await fetch(apiBase + '/portfolio', {
    cache: 'no-store',
    signal: AbortSignal.timeout(35000),
  });
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
}

export function loadPublished() {
  if (published) return Promise.resolve(published);
  if (loadPromise) return loadPromise;
  loadPromise = (async () => {
    try {
      await fetchPortfolioOnce();
    } catch {
      // Retry once in case Render cold-started or had a transient network hiccup
      try {
        await new Promise((r) => setTimeout(r, 2000));
        await fetchPortfolioOnce();
      } catch {
        console.warn('Portfolio API unavailable. Showing the bundled village.');
      }
    } finally {
      if (!published) loadPromise = null;
    }
    return published;
  })();
  return loadPromise;
}
