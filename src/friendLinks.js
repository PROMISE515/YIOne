const LINKS_KEY = 'yione-friend-links-v1';
const VISIBILITY_KEY = 'yione-friend-links-visible-v1';
const DEFAULT_LINKS = ['zhou', 'chen', 'xu'];

export function readFriendLinks(owner) {
  try {
    const saved = JSON.parse(localStorage.getItem(LINKS_KEY) || '{}');
    return Array.isArray(saved[owner]) ? saved[owner].filter(id => id !== owner) : DEFAULT_LINKS.filter(id => id !== owner);
  } catch {
    return DEFAULT_LINKS.filter(id => id !== owner);
  }
}

export function writeFriendLinks(owner, ids) {
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(LINKS_KEY) || '{}') || {}; } catch { /* use an empty map */ }
  localStorage.setItem(LINKS_KEY, JSON.stringify({...saved, [owner]: ids}));
  return ids;
}

export function readFriendVisibility() {
  return localStorage.getItem(VISIBILITY_KEY) !== 'false';
}

export function writeFriendVisibility(visible) {
  localStorage.setItem(VISIBILITY_KEY, String(visible));
  return visible;
}
