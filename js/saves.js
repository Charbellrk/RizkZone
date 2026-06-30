import { getCurrentUser, isLoggedIn } from './auth.js';

const MAX_SAVES = 50;

function storageKey() {
  const user = getCurrentUser();
  return user ? `rizkzone_saves_${user.id}` : null;
}

function matchKey(match) {
  return match.id || `${match.home}|${match.away}|${match.date}`;
}

export function getSaves() {
  const key = storageKey();
  if (!key) return [];
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch { return []; }
}

export function saveMatch(match) {
  if (!isLoggedIn()) return false;
  const key = storageKey();
  const id  = matchKey(match);
  const saves = getSaves();
  if (saves.some((s) => s._key === id)) return false;
  saves.unshift({ ...match, _key: id, savedAt: new Date().toISOString() });
  localStorage.setItem(key, JSON.stringify(saves.slice(0, MAX_SAVES)));
  return true;
}

export function unsaveMatch(matchKey_) {
  const key = storageKey();
  if (!key) return;
  const saves = getSaves().filter((s) => s._key !== matchKey_);
  localStorage.setItem(key, JSON.stringify(saves));
}

export function isSaved(match) {
  const id = typeof match === 'string' ? match : matchKey(match);
  return getSaves().some((s) => s._key === id);
}

export function clearAllSaves() {
  const key = storageKey();
  if (key) localStorage.removeItem(key);
}
