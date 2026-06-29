import { updateNavAuth, getMatchLimit } from './auth.js';
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
} from './ui.js';

const ITEMS_PER_PAGE = 5;
let allMatches = [];
let currentPage = 1;

const matchesContainer = document.getElementById('matches-container');
const pageInfo = document.getElementById('page-info');
const prevBtn = document.getElementById('prev-page');
const nextBtn = document.getElementById('next-page');
const matchCountLabel = document.getElementById('match-count-label');

function renderMatchesPage() {
  if (!allMatches.length) {
    showEmpty(matchesContainer, 'No NBA matches available at the moment.');
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

async function loadMatches() {
  currentPage = 1;
  showSpinner(matchesContainer);

  const limit = getMatchLimit();
  matchCountLabel.textContent = `Showing top ${limit} NBA matches`;

  try {
    allMatches = await fetchBasketballMatches(limit);
    if (!allMatches.length) {
      showEmpty(matchesContainer);
      prevBtn.disabled = true;
      nextBtn.disabled = true;
      return;
    }
    renderMatchesPage();
  } catch {
    showError(matchesContainer, 'Failed to load NBA matches. Please check your connection and try again.');
    prevBtn.disabled = true;
    nextBtn.disabled = true;
  }
}

function renderScorers(filter = '') {
  const tbody = document.getElementById('scorers-body');
  const query = filter.toLowerCase();
  const filtered = BASKETBALL_SCORERS.filter(
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
      <td>${p.points.toLocaleString()}</td>
      <td>${p.active ? '🟢 Active' : '⚪ Retired'}</td>
    </tr>
  `
    )
    .join('');
}

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
