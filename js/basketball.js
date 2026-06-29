import { updateNavAuth } from './auth.js';
import { fetchBasketballMatches } from './api.js';
import { BASKETBALL_SCORERS } from './data/players-data.js';
import {
  showSpinner,
  showError,
  showEmpty,
  createMatchCard,
  showMatchModal,
  initLiveTicker,
  initNav,
  initNightMode,
} from './ui.js';

const matchesContainer = document.getElementById('matches-container');
const matchCountLabel  = document.getElementById('match-count-label');
const pagination       = document.getElementById('pagination');

function renderMatches(matches) {
  matchesContainer.innerHTML = '';
  const grid = document.createElement('div');
  grid.className = 'matches-grid';
  matches.forEach((match) => grid.appendChild(createMatchCard(match, showMatchModal)));
  matchesContainer.appendChild(grid);
}

async function loadMatches() {
  showSpinner(matchesContainer);
  matchCountLabel.textContent = 'Loading NBA matches…';

  try {
    const matches = await fetchBasketballMatches();
    if (!matches.length) {
      showEmpty(matchesContainer, 'No recent NBA matches found. Check back shortly.');
      matchCountLabel.textContent = 'No matches found';
      return;
    }
    matchCountLabel.textContent = `Last ${matches.length} NBA matches`;
    renderMatches(matches);
  } catch {
    showError(matchesContainer, 'Failed to load NBA matches. Please check your connection and try again.');
  }
}

function renderScorers(filter = '') {
  const tbody = document.getElementById('scorers-body');
  const query = filter.toLowerCase();
  const filtered = BASKETBALL_SCORERS.filter(
    (p) => p.name.toLowerCase().includes(query) || p.country.toLowerCase().includes(query)
  );
  tbody.innerHTML = filtered.map((p) => `
    <tr>
      <td>${p.rank}</td>
      <td>${p.name}</td>
      <td>${p.country}</td>
      <td>${p.points.toLocaleString()}</td>
      <td>${p.active ? '🟢 Active' : '⚪ Retired'}</td>
    </tr>
  `).join('');
}

document.getElementById('scorer-search').addEventListener('input', (e) => {
  renderScorers(e.target.value);
});

/* Hide pagination — fixed 5-match display needs no page controls */
if (pagination) pagination.style.display = 'none';

const guestBanner = document.getElementById('guest-banner');
if (guestBanner) guestBanner.remove();

updateNavAuth();
initNav();
initNightMode();
initLiveTicker();
renderScorers();
loadMatches();
