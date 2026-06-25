const STORAGE_KEY = "realstage_favorites";

function readSet() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

function writeSet(set) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
}

export function getLocalFavorites() {
  return readSet();
}

export function isLocalFavorite(id) {
  return readSet().has(id);
}

export function setLocalFavorite(id, favorite) {
  const set = readSet();
  if (favorite) {
    set.add(id);
  } else {
    set.delete(id);
  }
  writeSet(set);
}

export function mergeLocalFavorites(generations) {
  const favorites = readSet();
  return generations.map((g) => ({
    ...g,
    favorite: g.favorite || favorites.has(g.id),
  }));
}
