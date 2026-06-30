import { updateNavAuth } from './auth.js';
import { fetchFootballMatches, searchTeams, fetchLeagueTable, fetchWorldCupFinal, fetchTeamPlayers } from './api.js';
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

function renderScorers() {
  const tbody = document.getElementById('scorers-body');
  tbody.innerHTML = FOOTBALL_SCORERS.slice(0, 5).map((p) => `
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

/* ── World Cup Country Search ────────────────────────────────────────────── */

const wcSearchInput  = document.getElementById('wc-country-search');
const wcSearchResult = document.getElementById('wc-country-result');
let wcSearchTimer = null;

async function handleWCSearch(query) {
  const q = query.trim().toLowerCase();
  if (!q) { wcSearchResult.innerHTML = ''; return; }

  const wins = WC_WINNERS.filter((w) => w.country.toLowerCase().includes(q));

  if (!wins.length) {
    wcSearchResult.innerHTML = `
      <div class="state-message state-empty">
        <span class="state-icon">🏳</span>
        <p>No World Cup wins found for "<strong>${query.trim()}</strong>". Try Brazil, Germany, France…</p>
      </div>`;
    return;
  }

  /* Show a loading state while we fetch the team badge from TheSportsDB */
  wcSearchResult.innerHTML = '<div class="spinner-wrap"><div class="spinner"></div></div>';

  /* Fetch national team badge via TheSportsDB API */
  let badgeUrl = '';
  try {
    const { searchTeams } = await import('./api.js');
    const teams = await searchTeams(wins[0].country);
    const national = teams.find(
      (t) => (t.strTeam || '').toLowerCase().includes('national') ||
              (t.strLeague || '').toLowerCase().includes('international') ||
              (t.strLeague || '').toLowerCase().includes('world cup')
    ) || teams[0];
    badgeUrl = national?.strTeamBadge || '';
  } catch { /* badge optional */ }

  const country  = wins[0].country;
  const flag     = wins[0].flag;
  const count    = wins.length;
  const years    = wins.map((w) => w.year).join(', ');

  wcSearchResult.innerHTML = `
    <div class="wc-search-result">
      ${badgeUrl
        ? `<img src="${badgeUrl}" alt="${country}" class="wc-search-badge" loading="lazy" onerror="this.style.display='none'">`
        : `<div class="wc-search-flag">${flag}</div>`}
      <div class="wc-search-info">
        <div class="wc-search-name">${flag} ${country}</div>
        <div class="wc-search-count">🏆 ${count} World Cup title${count !== 1 ? 's' : ''}</div>
        <div class="wc-search-years">Won in: <strong>${years}</strong></div>
        <div class="wc-search-editions">
          ${wins.map((w) => `
            <div class="wc-search-edition">
              <span class="wc-search-year">${w.year}</span>
              <span>Final vs ${w.runnerUp} — ${w.score}</span>
              <span class="wc-search-host">📍 ${w.host}</span>
            </div>`).join('')}
        </div>
        <div class="wc-api-note">🔗 Badge via TheSportsDB · Results from FIFA historical records</div>
      </div>
    </div>`;
}

wcSearchInput?.addEventListener('input', (e) => {
  clearTimeout(wcSearchTimer);
  wcSearchTimer = setTimeout(() => handleWCSearch(e.target.value), 350);
});

/* ── European Team Search ────────────────────────────────────────────────── */

const teamSearchInput   = document.getElementById('team-search-input');
const teamSearchResults = document.getElementById('team-search-results');
let teamSearchTimer = null;

const teamPlayerRoster = document.getElementById('team-player-roster');

function getInitials(name = '') {
  return name.split(' ').map((w) => w[0] || '').slice(0, 2).join('').toUpperCase();
}

function renderPlayerRoster(players, teamName) {
  return `
    <div class="squad-header">
      <h3>Squad — ${teamName}</h3>
      <span class="squad-count">${players.length} player${players.length !== 1 ? 's' : ''}</span>
    </div>
    <div class="player-roster-grid">
      ${players.map((p) => {
        const initials = getInitials(p.strPlayer);
        const photo = p.strThumb || p.strCutout || '';
        return `
          <div class="player-card">
            <div class="player-card-photo">
              ${photo
                ? `<img src="${photo}" alt="${p.strPlayer}" loading="lazy" onerror="this.parentElement.innerHTML='<span class=\\"player-initials\\">${initials}</span>'">`
                : `<span class="player-initials">${initials}</span>`}
            </div>
            <div class="player-card-info">
              <div class="player-name">${p.strPlayer || 'Unknown'}</div>
              ${p.strPosition ? `<div class="player-pos">${p.strPosition}</div>` : ''}
              ${p.strNationality ? `<div class="player-nat">${p.strNationality}</div>` : ''}
            </div>
          </div>`;
      }).join('')}
    </div>`;
}

async function loadTeamSquad(teamId, teamName) {
  if (!teamPlayerRoster) return;
  teamPlayerRoster.innerHTML = '<div class="spinner-wrap"><div class="spinner"></div><p>Loading squad…</p></div>';
  teamPlayerRoster.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  const players = await fetchTeamPlayers(teamId);
  if (!players.length) {
    teamPlayerRoster.innerHTML = `
      <div class="state-message state-empty">
        <span class="state-icon">📭</span>
        <p>No player data available for ${teamName}.</p>
      </div>`;
    return;
  }
  teamPlayerRoster.innerHTML = renderPlayerRoster(players, teamName);
}

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
          <button class="view-squad-btn" data-team-id="${t.idTeam}" data-team-name="${t.strTeam}">🏃 View Squad</button>
        </div>
      </div>`).join('')
  }</div>`;
}

teamSearchResults?.addEventListener('click', (e) => {
  const btn = e.target.closest('.view-squad-btn');
  if (!btn) return;
  loadTeamSquad(btn.dataset.teamId, btn.dataset.teamName);
});

teamSearchInput?.addEventListener('input', (e) => {
  clearTimeout(teamSearchTimer);
  const q = e.target.value;
  if (!q.trim()) { teamSearchResults.innerHTML = ''; if (teamPlayerRoster) teamPlayerRoster.innerHTML = ''; return; }
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
const standingsSeasonSel = document.getElementById('standings-season-select');

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

async function loadStandings(leagueId, season) {
  standingsContainer.innerHTML = '<div class="spinner-wrap"><div class="spinner"></div><p>Loading standings…</p></div>';
  const table = await fetchLeagueTable(leagueId, season || null);
  renderStandings(table);
}

function reloadStandings() {
  loadStandings(standingsSelect?.value || '4328', standingsSeasonSel?.value || null);
}

standingsSelect?.addEventListener('change', reloadStandings);
standingsSeasonSel?.addEventListener('change', reloadStandings);

/* ── Init new sections ───────────────────────────────────────────────────── */
renderWorldCupWinners();
loadStandings('4328', standingsSeasonSel?.value || null);

/* ── Quick-nav scroll spy ────────────────────────────────────────────────── */
const quicknavBtns = document.querySelectorAll('.quicknav-btn');
const sections = ['section-matches', 'section-scorers', 'section-worldcup', 'section-teams', 'section-standings']
  .map((id) => document.getElementById(id))
  .filter(Boolean);

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      quicknavBtns.forEach((btn) => btn.classList.remove('active'));
      const active = document.querySelector(`.quicknav-btn[href="#${entry.target.id}"]`);
      if (active) active.classList.add('active');
    }
  });
}, { rootMargin: '-30% 0px -60% 0px' });

sections.forEach((s) => observer.observe(s));
