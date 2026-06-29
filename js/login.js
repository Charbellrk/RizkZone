import { login, register, loginAsGuest, getSession } from './auth.js';
import { initNav, initNightMode } from './ui.js';

const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const messageEl = document.getElementById('auth-message');

function showMessage(text, type) {
  messageEl.textContent = text;
  messageEl.className = `auth-message ${type}`;
  messageEl.classList.remove('hidden');
}

function hideMessage() {
  messageEl.classList.add('hidden');
}

document.querySelectorAll('.auth-tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.auth-tab').forEach((t) => t.classList.remove('active'));
    tab.classList.add('active');
    hideMessage();

    if (tab.dataset.tab === 'login') {
      loginForm.classList.remove('hidden');
      registerForm.classList.add('hidden');
    } else {
      loginForm.classList.add('hidden');
      registerForm.classList.remove('hidden');
    }
  });
});

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const result = login({
    username: document.getElementById('login-username').value,
    password: document.getElementById('login-password').value,
  });

  if (result.success) {
    showMessage(result.message, 'success');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 800);
  } else {
    showMessage(result.message, 'error');
  }
});

registerForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const result = register({
    username: document.getElementById('reg-username').value,
    email: document.getElementById('reg-email').value,
    password: document.getElementById('reg-password').value,
  });

  if (result.success) {
    showMessage(result.message, 'success');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 800);
  } else {
    showMessage(result.message, 'error');
  }
});

document.getElementById('guest-btn').addEventListener('click', () => {
  const result = loginAsGuest();
  showMessage(result.message, 'success');
  setTimeout(() => {
    window.location.href = 'index.html';
  }, 600);
});

if (getSession()) {
  window.location.href = 'index.html';
}

initNav();
initNightMode();
