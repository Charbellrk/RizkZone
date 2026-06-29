import { updateNavAuth } from './auth.js';
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
  initNightMode,
} from './ui.js';

const LEAGUE_META = {
  'Premier League':   { color: '#38003c', text: '#fff' },
  'La Liga':          { color: '#e4002b', text: '#fff' },
  'Serie A':          { color: '#034694', text: '#fff' },
  'Bundesliga':       { color: '#d3010c', text: '#fff' },
  'Ligue 1':          { color: '#001489', text: '#fff' },
  'Champions League': { color: '#001489', text: '#ffd700' },
  'FIFA World Cup':   { color: '#007e4a', text: '#fff' },
};

function leagueBadgeStyle(leagueName) {
  const meta = LEAGUE_META[leagueName];
  return meta ? `background:${meta.color};color:${meta.text};` : 'background:var(--accent);color:#fff;';
}

const matchesContainer = document.getElementById('matches-container');
const matchCountLabel  = document.getElementById('match-count-label');
const leagueIndicator  = document.getElementById('league-indicator');
const pagination       = document.getElementById('pagination');

function updateLeagueIndicator(leagueKey) {
  if (!leagueIndicator) return;
  const leagueNames = {
    all:        '🌍 All Leagues',
    premier:    '🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League',
    laliga:     '🇪🇸 La Liga',
    seriea:     '🇮🇹 Serie A',
    bundesliga: '🇩🇪 Bundesliga',
    ligue1:     '🇫🇷 Ligue 1',
    champions:  '⭐ Champions League',
    worldcup:   '🏆 FIFA World Cup',
  };
  const label = leagueNames[leagueKey] || '🌍 All Leagues';
  leagueIndicator.textContent = `Now viewing: ${label} · Last 5 matches`;
  leagueIndicator.className = leagueKey === 'all'
    ? 'league-indicator league-indicator--all'
    : 'league-indicator';
}

function renderMatches(matches) {
  matchesContainer.innerHTML = '';
  const grid = document.createElement('div');
  grid.className = 'matches-grid';
  matches.forEach((match) => {
    const card = createMatchCard(match, showMatchModal);
    const badge = card.querySelector('.match-league');
    if (badge) badge.setAttribute('style', leagueBadgeStyle(match.league));
    grid.appendChild(card);
  });
  matchesContainer.appendChild(grid);
}

async function loadMatches(leagueKey = 'all') {
  showSpinner(matchesContainer);
  updateLeagueIndicator(leagueKey);

  const leagueLabel = leagueKey === 'worldcup' ? 'FIFA World Cup'
    : leagueKey === 'all' ? 'All Leagues'
    : (document.getElementById('league-filter').selectedOptions[0]?.text || leagueKey);
  matchCountLabel.textContent = `Loading ${leagueLabel} matches…`;

  try {
    const matches = await fetchFootballMatches(leagueKey);
    if (!matches.length) {
      showEmpty(matchesContainer, 'No recent matches found for this league. Try another league or check back later.');
      matchCountLabel.textContent = 'No matches found';
      return;
    }
    matchCountLabel.textContent = `Last ${matches.length} matches · ${leagueLabel}`;
    renderMatches(matches);
  } catch {
    showError(matchesContainer, 'Failed to load matches. Please check your connection and try again.');
  }
}

function renderScorers(filter = '') {
  const tbody = document.getElementById('scorers-body');
  const query = filter.toLowerCase();
  const filtered = FOOTBALL_SCORERS.filter(
    (p) => p.name.toLowerCase().includes(query) || p.country.toLowerCase().includes(query)
  );
  tbody.innerHTML = filtered.map((p) => `
    <tr>
      <td>${p.rank}</td>
      <td>${p.name}</td>
      <td>${p.country}</td>
      <td>${p.goals.toLocaleString()}</td>
      <td>${p.active ? '🟢 Active' : '⚪ Retired'}</td>
    </tr>
  `).join('');
}

document.getElementById('league-filter').addEventListener('change', (e) => {
  loadMatches(e.target.value);
});

document.getElementById('world-cup-btn').addEventListener('click', () => {
  document.getElementById('league-filter').value = 'all';
  loadMatches('worldcup');
});

document.getElementById('scorer-search').addEventListener('input', (e) => {
  renderScorers(e.target.value);
});

/* Hide pagination — no longer needed with fixed 5-match display */
if (pagination) pagination.style.display = 'none';

const guestBanner = document.getElementById('guest-banner');
if (guestBanner) guestBanner.remove();

updateNavAuth();
initNav();
initNightMode();
initLiveTicker();
renderScorers();
loadMatches();
