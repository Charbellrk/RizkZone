const STORAGE_KEY = 'arenaSportsAuth';

const defaultState = {
  users: [],
  session: null,
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...defaultState, ...JSON.parse(raw) } : { ...defaultState };
  } catch {
    return { ...defaultState };
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function getSession() {
  return loadState().session;
}

export function isLoggedIn() {
  const session = getSession();
  return Boolean(session && !session.isGuest);
}

export function isGuest() {
  const session = getSession();
  return Boolean(session?.isGuest);
}

export function getCurrentUser() {
  const session = getSession();
  if (!session || session.isGuest) return null;
  return session;
}

export function register({ username, email, password }) {
  const state = loadState();
  const normalizedUsername = username.trim().toLowerCase();
  const normalizedEmail = email.trim().toLowerCase();

  if (!username.trim() || !email.trim() || password.length < 6) {
    return { success: false, message: 'Please fill all fields. Password must be at least 6 characters.' };
  }

  if (state.users.some((u) => u.username === normalizedUsername)) {
    return { success: false, message: 'Username already exists.' };
  }

  if (state.users.some((u) => u.email === normalizedEmail)) {
    return { success: false, message: 'Email already registered.' };
  }

  const user = {
    id: crypto.randomUUID(),
    username: username.trim(),
    email: email.trim(),
    password,
    createdAt: new Date().toISOString(),
  };

  state.users.push(user);
  state.session = { id: user.id, username: user.username, email: user.email, isGuest: false };
  saveState(state);
  return { success: true, message: 'Registration successful!' };
}

export function login({ username, password }) {
  const state = loadState();
  const normalizedUsername = username.trim().toLowerCase();
  const user = state.users.find((u) => u.username.toLowerCase() === normalizedUsername);

  if (!user || user.password !== password) {
    return { success: false, message: 'Invalid username or password.' };
  }

  state.session = { id: user.id, username: user.username, email: user.email, isGuest: false };
  saveState(state);
  return { success: true, message: 'Welcome back!' };
}

export function loginAsGuest() {
  const state = loadState();
  state.session = { id: 'guest', username: 'Guest', isGuest: true };
  saveState(state);
  return { success: true, message: 'Continuing as guest.' };
}

export function logout() {
  const state = loadState();
  state.session = null;
  saveState(state);
}

export function getMatchLimit() {
  return isLoggedIn() ? 15 : 9;
}

export function canAccessGame(gameId) {
  if (isLoggedIn()) return true;
  if (!isGuest() && !getSession()) return false;

  const allowedGuestGame = localStorage.getItem('arenaSportsGuestGame') || 'penalty';
  return gameId === allowedGuestGame;
}

export function setGuestGameChoice(gameId) {
  localStorage.setItem('arenaSportsGuestGame', gameId);
}

export function updateNavAuth() {
  const session = getSession();
  const authLink = document.getElementById('nav-auth');
  const userBadge = document.getElementById('nav-user');
  const guestBanner = document.getElementById('guest-banner');

  if (authLink) {
    authLink.textContent = session ? 'Logout' : 'Login';
    authLink.href = session ? '#' : 'login.html';
    authLink.onclick = session
      ? (e) => {
          e.preventDefault();
          logout();
          window.location.href = 'login.html';
        }
      : null;
  }

  if (userBadge) {
    if (session) {
      userBadge.textContent = session.isGuest ? 'Guest Mode' : session.username;
      userBadge.classList.remove('hidden');
    } else {
      userBadge.classList.add('hidden');
    }
  }

  if (guestBanner) {
    guestBanner.classList.toggle('hidden', !session?.isGuest);
  }
}
