const TOKEN_KEY = 'raktakk_token';

function getSessionStorage() {
  try {
    return window.sessionStorage;
  } catch (_) {
    return null;
  }
}

function getLocalStorage() {
  try {
    return window.localStorage;
  } catch (_) {
    return null;
  }
}

export function setToken(token) {
  const value = String(token || '');
  const session = getSessionStorage();
  const local = getLocalStorage();
  if (session) session.setItem(TOKEN_KEY, value);
  if (local) local.removeItem(TOKEN_KEY);
}

export function getToken() {
  const session = getSessionStorage();
  const local = getLocalStorage();
  const token = session?.getItem(TOKEN_KEY) || local?.getItem(TOKEN_KEY) || '';

  if (token && session && !session.getItem(TOKEN_KEY)) {
    session.setItem(TOKEN_KEY, token);
    if (local) local.removeItem(TOKEN_KEY);
  }

  return token;
}

export function clearToken() {
  const session = getSessionStorage();
  const local = getLocalStorage();
  if (session) session.removeItem(TOKEN_KEY);
  if (local) local.removeItem(TOKEN_KEY);
}
