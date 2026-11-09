export const apiBase =
  import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api');
export let published = null;

export async function loadPublished() {
  try {
    const response = await fetch(apiBase + '/portfolio', { signal: AbortSignal.timeout(3500) });
    if (!response.ok) throw new Error('Portfolio API unavailable');
    const { data } = await response.json();
    if (['projects', 'skills', 'missions', 'dialogues'].every((key) => Array.isArray(data?.[key])))
      published = data;
  } catch {
    console.warn('Portfolio API unavailable. Showing the bundled village.');
  }
}
