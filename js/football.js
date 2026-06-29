import { updateNavAuth, getMatchLimit } from './auth.js';
import { fetchFootballMatches } from './api.js';
import { FOOTBALL_SCORERS } from './data/players-data.js';
import {
  showSpinner,
  showError,
  showEmpty,
  createMatchCard,
  showMatchModal,
  initLiveTicker,
  initNav,
} from './ui.js';

const ITEMS_PER_PAGE = 5;
let allMatches = [];
let currentPage = 1;
let currentLeague = 'all';

const matchesContainer = document.getElementById('matches-container');
const pageInfo = document.getElementById('page-info');
const prevBtn = document.getElementById('prev-page');
const nextBtn = document.getElementById('next-page');
const matchCountLabel = document.getElementById('match-count-label');

function renderMatchesPage() {
  if (!allMatches.length) {
    showEmpty(matchesContainer, 'No football matches available for this selection.');
    prevBtn.disabled = true;
    nextBtn.disabled = true;
    return;
  }

  const totalPages = Math.ceil(allMatches.length / ITEMS_PER_PAGE);
  currentPage = Math.min(currentPage, totalPages);
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageMatches = allMatches.slice(start, start + ITEMS_PER_PAGE);

  matchesContainer.innerHTML = '';
  const grid = document.createElement('div');
  grid.className = 'matches-grid';
  pageMatches.forEach((match) => {
    grid.appendChild(createMatchCard(match, showMatchModal));
  });
  matchesContainer.appendChild(grid);

  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
  prevBtn.disabled = currentPage <= 1;
  nextBtn.disabled = currentPage >= totalPages;
}

async function loadMatches(leagueKey = 'all') {
  currentLeague = leagueKey;
  currentPage = 1;
  showSpinner(matchesContainer);

  const limit = getMatchLimit();
  matchCountLabel.textContent = `Showing top ${limit} matches${leagueKey === 'worldcup' ? ' — FIFA World Cup' : ''}`;

  try {
    allMatches = await fetchFootballMatches(leagueKey, limit);
    if (!allMatches.length) {
      showEmpty(matchesContainer);
      prevBtn.disabled = true;
      nextBtn.disabled = true;
      return;
    }
    renderMatchesPage();
  } catch {
    showError(matchesContainer, 'Failed to load football matches. Please check your connection and try again.');
    prevBtn.disabled = true;
    nextBtn.disabled = true;
  }
}

function renderScorers(filter = '') {
  const tbody = document.getElementById('scorers-body');
  const query = filter.toLowerCase();
  const filtered = FOOTBALL_SCORERS.filter(
    (p) =>
      p.name.toLowerCase().includes(query) ||
      p.country.toLowerCase().includes(query)
  );

  tbody.innerHTML = filtered
    .map(
      (p) => `
    <tr>
      <td>${p.rank}</td>
      <td>${p.name}</td>
      <td>${p.country}</td>
      <td>${p.goals}</td>
      <td>${p.active ? '🟢 Active' : '⚪ Retired'}</td>
    </tr>
  `
    )
    .join('');
}

document.getElementById('league-filter').addEventListener('change', (e) => {
  loadMatches(e.target.value);
});

document.getElementById('world-cup-btn').addEventListener('click', () => {
  document.getElementById('league-filter').value = 'all';
  loadMatches('worldcup');
});

prevBtn.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    renderMatchesPage();
  }
});

nextBtn.addEventListener('click', () => {
  const totalPages = Math.ceil(allMatches.length / ITEMS_PER_PAGE);
  if (currentPage < totalPages) {
    currentPage++;
    renderMatchesPage();
  }
});

document.getElementById('scorer-search').addEventListener('input', (e) => {
  renderScorers(e.target.value);
});

updateNavAuth();
initNav();
initLiveTicker();
renderScorers();
loadMatches();
