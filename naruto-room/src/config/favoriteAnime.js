export const favoriteAnime = [
  { title: 'Naruto', tags: 'Perseverance • Growth • Never Give Up', imageUrl: '/about/naruto-tv-key-visual.webp' },
  { title: 'Monster', tags: 'Conscience • Empathy • Responsibility', imageUrl: '/about/monster-nippon-tv.webp' },
  { title: 'Vinland Saga', tags: 'Peace • Redemption • Freedom', imageUrl: '/about/vinland-saga-key-visual.webp' },
];

export function profileAnime(list) {
  const saved = list?.filter(item => item?.title?.trim());
  if (!saved?.length) return favoriteAnime;
  const oldLineup = ['naruto', 'one piece', 'attack on titan'];
  if (saved.length === 3 && saved.every((item, i) => item.title.trim().toLowerCase() === oldLineup[i])) {
    return [{ ...saved[0], imageUrl: favoriteAnime[0].imageUrl }, ...favoriteAnime.slice(1)];
  }
  return saved.map(item => {
    const poster = favoriteAnime.find(anime => anime.title.toLowerCase() === item.title.trim().toLowerCase());
    const legacy = /(?:^|\/)anime-(?:naruto|monster|vinland-saga)\.(?:jpg|webp)(?:[?#].*)?$/i;
    return poster && (!item.imageUrl || legacy.test(item.imageUrl))
      ? { ...item, imageUrl: poster.imageUrl }
      : item;
  });
}
