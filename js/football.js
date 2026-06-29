import { updateNavAuth } from './auth.js';
import { fetchFootballMatches, searchTeams, fetchLeagueTable, fetchWorldCupFinal } from './api.js';
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

/* ── World Cup Winners ───────────────────────────────────────────────────── */

const WC_WINNERS = [
  { year: 2022, country: 'Argentina',    flag: '🇦🇷', runnerUp: 'France',          score: '3–3 (4–2p)', host: 'Qatar' },
  { year: 2018, country: 'France',       flag: '🇫🇷', runnerUp: 'Croatia',         score: '4–2',        host: 'Russia' },
  { year: 2014, country: 'Germany',      flag: '🇩🇪', runnerUp: 'Argentina',       score: '1–0 AET',    host: 'Brazil' },
  { year: 2010, country: 'Spain',        flag: '🇪🇸', runnerUp: 'Netherlands',     score: '1–0 AET',    host: 'South Africa' },
  { year: 2006, country: 'Italy',        flag: '🇮🇹', runnerUp: 'France',          score: '1–1 (5–3p)', host: 'Germany' },
  { year: 2002, country: 'Brazil',       flag: '🇧🇷', runnerUp: 'Germany',         score: '2–0',        host: 'Japan/S.Korea' },
  { year: 1998, country: 'France',       flag: '🇫🇷', runnerUp: 'Brazil',          score: '3–0',        host: 'France' },
  { year: 1994, country: 'Brazil',       flag: '🇧🇷', runnerUp: 'Italy',           score: '0–0 (3–2p)', host: 'USA' },
  { year: 1990, country: 'West Germany', flag: '🇩🇪', runnerUp: 'Argentina',       score: '1–0',        host: 'Italy' },
  { year: 1986, country: 'Argentina',    flag: '🇦🇷', runnerUp: 'West Germany',    score: '3–2',        host: 'Mexico' },
  { year: 1982, country: 'Italy',        flag: '🇮🇹', runnerUp: 'West Germany',    score: '3–1',        host: 'Spain' },
  { year: 1978, country: 'Argentina',    flag: '🇦🇷', runnerUp: 'Netherlands',     score: '3–1 AET',    host: 'Argentina' },
  { year: 1974, country: 'West Germany', flag: '🇩🇪', runnerUp: 'Netherlands',     score: '2–1',        host: 'West Germany' },
  { year: 1970, country: 'Brazil',       flag: '🇧🇷', runnerUp: 'Italy',           score: '4–1',        host: 'Mexico' },
  { year: 1966, country: 'England',      flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', runnerUp: 'West Germany',    score: '4–2 AET',    host: 'England' },
  { year: 1962, country: 'Brazil',       flag: '🇧🇷', runnerUp: 'Czechoslovakia',  score: '3–1',        host: 'Chile' },
  { year: 1958, country: 'Brazil',       flag: '🇧🇷', runnerUp: 'Sweden',          score: '5–2',        host: 'Sweden' },
  { year: 1954, country: 'West Germany', flag: '🇩🇪', runnerUp: 'Hungary',         score: '3–2',        host: 'Switzerland' },
  { year: 1950, country: 'Uruguay',      flag: '🇺🇾', runnerUp: 'Brazil',          score: '2–1 *',      host: 'Brazil' },
  { year: 1938, country: 'Italy',        flag: '🇮🇹', runnerUp: 'Hungary',         score: '4–2',        host: 'France' },
  { year: 1934, country: 'Italy',        flag: '🇮🇹', runnerUp: 'Czechoslovakia',  score: '2–1 AET',    host: 'Italy' },
  { year: 1930, country: 'Uruguay',      flag: '🇺🇾', runnerUp: 'Argentina',       score: '4–2',        host: 'Uruguay' },
];

async function renderWorldCupWinners() {
  const grid = document.getElementById('wc-winners-grid');
  if (!grid) return;

  // Fetch 2022 final from API for the latest edition
  const latest = await fetchWorldCupFinal('2022');

  grid.innerHTML = WC_WINNERS.map((w, i) => {
    const isLatest = w.year === 2022 && latest;
    const score = isLatest
      ? `${latest.homeScore}–${latest.awayScore}`
      : w.score;
    const apiTag = isLatest ? '<span class="wc-api-tag">API</span>' : '';
    return `
      <div class="wc-card ${i === 0 ? 'wc-card--featured' : ''}">
        <div class="wc-year">${w.year}</div>
        <div class="wc-flag">${w.flag}</div>
        <div class="wc-winner">${w.country}</div>
        <div class="wc-score">${score} ${apiTag}</div>
        <div class="wc-runner">vs ${w.runnerUp}</div>
        <div class="wc-host">📍 ${w.host}</div>
      </div>`;
  }).join('');
}

/* ── European Team Search ────────────────────────────────────────────────── */

const teamSearchInput   = document.getElementById('team-search-input');
const teamSearchResults = document.getElementById('team-search-results');
let teamSearchTimer = null;

function renderTeamCards(teams) {
  if (!teams.length) {
    teamSearchResults.innerHTML = `
      <div class="state-message state-empty">
        <span class="state-icon">📭</span>
        <p>No teams found. Try a different name.</p>
      </div>`;
    return;
  }
  teamSearchResults.innerHTML = `<div class="team-search-grid">${
    teams.map((t) => `
      <div class="team-card">
        ${t.strTeamBadge
          ? `<img class="team-card-badge" src="${t.strTeamBadge}" alt="${t.strTeam}" loading="lazy" onerror="this.style.display='none'">`
          : '<div class="team-card-badge team-card-badge--empty">⚽</div>'}
        <div class="team-card-info">
          <div class="team-card-name">${t.strTeam}</div>
          <span class="team-card-league">${t.strLeague || '—'}</span>
          <div class="team-card-meta">🌍 ${t.strCountry || '—'}</div>
          ${t.intFormedYear ? `<div class="team-card-meta">🗓 Founded ${t.intFormedYear}</div>` : ''}
          ${t.strStadium ? `<div class="team-card-meta">🏟 ${t.strStadium}</div>` : ''}
        </div>
      </div>`).join('')
  }</div>`;
}

teamSearchInput?.addEventListener('input', (e) => {
  clearTimeout(teamSearchTimer);
  const q = e.target.value;
  if (!q.trim()) { teamSearchResults.innerHTML = ''; return; }
  if (q.trim().length < 2) return;
  teamSearchTimer = setTimeout(async () => {
    teamSearchResults.innerHTML = '<div class="spinner-wrap"><div class="spinner"></div><p>Searching…</p></div>';
    try {
      const teams = await searchTeams(q);
      renderTeamCards(teams);
    } catch {
      teamSearchResults.innerHTML = '<div class="state-message state-error"><span class="state-icon">⚠</span><p>Search failed. Try again.</p></div>';
    }
  }, 400);
});

/* ── League Standings ────────────────────────────────────────────────────── */

const standingsContainer = document.getElementById('standings-container');
const standingsSelect    = document.getElementById('standings-league-select');

function renderStandings(table) {
  if (!table.length) {
    standingsContainer.innerHTML = `<div class="state-message state-empty"><span class="state-icon">📭</span><p>Standings not available yet for this season.</p></div>`;
    return;
  }
  standingsContainer.innerHTML = `
    <div class="data-table-wrap">
      <table class="data-table standings-table">
        <thead>
          <tr>
            <th>#</th><th>Team</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GD</th><th>Pts</th>
          </tr>
        </thead>
        <tbody>
          ${table.map((row) => {
            const gd = (parseInt(row.intGoalDifference) || 0);
            const gdStr = gd > 0 ? `+${gd}` : `${gd}`;
            const descClass = (row.strDescription || '').toLowerCase().includes('champion')
              ? 'standing-cl' : (row.strDescription || '').toLowerCase().includes('relegat')
              ? 'standing-rel' : '';
            return `
              <tr class="${descClass}">
                <td><strong>${row.intRank}</strong></td>
                <td>
                  ${row.strTeamBadge ? `<img src="${row.strTeamBadge}" alt="" class="standing-badge" loading="lazy">` : ''}
                  ${row.strTeam}
                </td>
                <td>${row.intPlayed}</td>
                <td>${row.intWin}</td>
                <td>${row.intDraw}</td>
                <td>${row.intLoss}</td>
                <td>${gdStr}</td>
                <td><strong>${row.intPoints}</strong></td>
              </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>`;
}

async function loadStandings(leagueId) {
  standingsContainer.innerHTML = '<div class="spinner-wrap"><div class="spinner"></div><p>Loading standings…</p></div>';
  const table = await fetchLeagueTable(leagueId);
  renderStandings(table);
}

standingsSelect?.addEventListener('change', (e) => loadStandings(e.target.value));

/* ── Init new sections ───────────────────────────────────────────────────── */
renderWorldCupWinners();
loadStandings('4328');
