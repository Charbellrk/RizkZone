import { updateNavAuth } from './auth.js';
import {
  fetchNBAGamesByDate,
  fetchNBAOnlyGamesByDate,
  fetchRecentNBADate,
  fetchRecentNBADateESPN,
  fetchNBAStandings,
  fetchNBATeamRosterESPN,
  searchNBATeamsESPN,
  fetchESPNNBACareerLeaders,
} from './api.js';
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
const datePicker       = document.getElementById('nba-date-picker');
const prevDayBtn       = document.getElementById('nba-prev-day');
const nextDayBtn       = document.getElementById('nba-next-day');

let currentDate = ''; // YYYY-MM-DD

function renderMatches(matches, dateStr) {
  matchesContainer.innerHTML = '';
  if (!matches.length) {
    showEmpty(matchesContainer, `No basketball games on ${dateStr}. Try navigating to another day.`);
    matchCountLabel.textContent = `No games on ${dateStr}`;
    return;
  }
  const grid = document.createElement('div');
  grid.className = 'matches-grid';
  matches.forEach((match) => grid.appendChild(createMatchCard(match, showMatchModal)));
  matchesContainer.appendChild(grid);
  matchCountLabel.textContent = `${matches.length} game${matches.length !== 1 ? 's' : ''} on ${dateStr}`;
}

async function loadMatchesForDate(dateStr) {
  currentDate = dateStr;
  if (datePicker) datePicker.value = dateStr;
  showSpinner(matchesContainer);
  matchCountLabel.textContent = `Loading games for ${dateStr}…`;
  const matches = await fetchNBAGamesByDate(dateStr);
  renderMatches(matches, dateStr);
}

function shiftDate(dateStr, days) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

prevDayBtn?.addEventListener('click', () => {
  if (currentDate) loadMatchesForDate(shiftDate(currentDate, -1));
});
nextDayBtn?.addEventListener('click', () => {
  if (currentDate) loadMatchesForDate(shiftDate(currentDate, 1));
});
datePicker?.addEventListener('change', (e) => {
  if (e.target.value) loadMatchesForDate(e.target.value);
});

/* ── NBA 2025-26 Games by Date ────────────────────────────────────────────── */

const nbaDayContainer   = document.getElementById('nba-day-container');
const nbaDayCountLabel  = document.getElementById('nba-day-count-label');
const nbaDayPicker      = document.getElementById('nba-day-picker');
const nbaDayPrev        = document.getElementById('nba-day-prev');
const nbaDayNext        = document.getElementById('nba-day-next');

let nbaDayCurrentDate = '';

function renderNBADayMatches(matches, dateStr) {
  if (!nbaDayContainer) return;
  nbaDayContainer.innerHTML = '';
  if (!matches.length) {
    showEmpty(nbaDayContainer, `No NBA games on ${dateStr}. Try another day.`);
    if (nbaDayCountLabel) nbaDayCountLabel.textContent = `No NBA games on ${dateStr}`;
    return;
  }
  const grid = document.createElement('div');
  grid.className = 'matches-grid';
  matches.forEach((m) => grid.appendChild(createMatchCard(m, showMatchModal)));
  nbaDayContainer.appendChild(grid);
  if (nbaDayCountLabel) nbaDayCountLabel.textContent = `${matches.length} game${matches.length !== 1 ? 's' : ''} on ${dateStr}`;
}

async function loadNBADayMatches(dateStr) {
  nbaDayCurrentDate = dateStr;
  if (nbaDayPicker) nbaDayPicker.value = dateStr;
  showSpinner(nbaDayContainer);
  if (nbaDayCountLabel) nbaDayCountLabel.textContent = `Loading NBA games for ${dateStr}…`;
  const matches = await fetchNBAOnlyGamesByDate(dateStr);
  renderNBADayMatches(matches, dateStr);
}

nbaDayPrev?.addEventListener('click', () => {
  if (nbaDayCurrentDate) loadNBADayMatches(shiftDate(nbaDayCurrentDate, -1));
});
nbaDayNext?.addEventListener('click', () => {
  if (nbaDayCurrentDate) loadNBADayMatches(shiftDate(nbaDayCurrentDate, 1));
});
nbaDayPicker?.addEventListener('change', (e) => {
  if (e.target.value) loadNBADayMatches(e.target.value);
});


async function renderScorers() {
  const tbody = document.getElementById('scorers-body');
  const title = document.getElementById('scorers-title');

  // Try live ESPN career data, fall back to hardcoded
  let players = BASKETBALL_SCORERS;
  let isLive = false;
  try {
    const live = await fetchESPNNBACareerLeaders();
    if (live && live.length >= 5) { players = live; isLive = true; }
  } catch { /* use hardcoded */ }

  if (title) {
    const badge = isLive
      ? '<span style="font-size:0.7rem;background:#16a34a;color:#fff;padding:2px 8px;border-radius:999px;margin-left:8px;vertical-align:middle;">🔴 Live</span>'
      : '<span style="font-size:0.7rem;background:#6b7280;color:#fff;padding:2px 8px;border-radius:999px;margin-left:8px;vertical-align:middle;">📚 Verified</span>';
    title.innerHTML = '🏆 NBA All-Time Career Scoring Leaders' + badge;
  }

  tbody.innerHTML = players.slice(0, 5).map((p) => `
    <tr>
      <td>${p.rank}</td>
      <td>${p.name}</td>
      <td>${p.country}</td>
      <td>${p.points.toLocaleString()}</td>
      <td>${p.active ? '🟢 Active' : '⚪ Retired'}</td>
    </tr>
  `).join('');
}

/* ── NBA Standings ────────────────────────────────────────────────────────── */

const nbaStandingsContainer = document.getElementById('nba-standings-container');
const nbaStandingsSeason    = document.getElementById('nba-standings-season');

function confTable(entries, confName, emoji) {
  if (!entries.length) {
    return `
      <div class="conference-block">
        <div class="conference-title">${emoji} ${confName}</div>
        <div class="state-message state-empty"><span class="state-icon">📭</span><p>No data available.</p></div>
      </div>`;
  }
  return `
    <div class="conference-block">
      <div class="conference-title">${emoji} ${confName}</div>
      <div class="data-table-wrap">
        <table class="data-table standings-table">
          <thead>
            <tr><th>#</th><th>Team</th><th>W</th><th>L</th><th>PCT</th><th>GB</th></tr>
          </thead>
          <tbody>
            ${entries.map((t, i) => `
              <tr>
                <td><strong>${i + 1}</strong></td>
                <td>
                  ${t.logo ? `<img src="${t.logo}" alt="" class="standing-badge" loading="lazy" onerror="this.style.display='none'">` : ''}
                  ${t.team}
                </td>
                <td>${t.wins}</td>
                <td>${t.losses}</td>
                <td>${(t.pct * 100).toFixed(1)}%</td>
                <td>${t.gb}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
}

function renderNBAStandings(data) {
  const { east, west, fallback } = data;
  if (!east.length && !west.length) {
    nbaStandingsContainer.innerHTML = `
      <div class="state-message state-empty">
        <span class="state-icon">📭</span>
        <p>Standings not available for this season yet. Try another season.</p>
      </div>`;
    return;
  }
  const eastLabel = fallback ? 'Top 5 (Rank 1–5)' : 'Eastern Conference';
  const westLabel = fallback ? 'Top 5 (Rank 6–10)' : 'Western Conference';
  const eastEmoji = fallback ? '🏅' : '🏢';
  const westEmoji = fallback ? '🏅' : '🏜';
  nbaStandingsContainer.innerHTML = `
    ${fallback ? '<p style="color:var(--text-muted);font-size:0.82rem;margin-bottom:12px;">Conference data unavailable — showing overall rankings via TheSportsDB</p>' : ''}
    <div class="nba-standings-grid">
      ${confTable(east, eastLabel, eastEmoji)}
      ${confTable(west, westLabel, westEmoji)}
    </div>`;
}

async function loadNBAStandings(season) {
  nbaStandingsContainer.innerHTML = '<div class="spinner-wrap"><div class="spinner"></div><p>Loading standings…</p></div>';
  const data = await fetchNBAStandings(season);
  renderNBAStandings(data);
}

nbaStandingsSeason?.addEventListener('change', (e) => loadNBAStandings(e.target.value));

/* ── NBA Team Finder ──────────────────────────────────────────────────────── */

const bballTeamInput   = document.getElementById('bball-team-search-input');
const bballTeamResults = document.getElementById('bball-team-search-results');
const bballTeamRoster  = document.getElementById('bball-team-roster');
let bballSearchTimer   = null;

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

async function loadBballTeamSquad(teamId, teamName) {
  if (!bballTeamRoster) return;
  bballTeamRoster.innerHTML = '<div class="spinner-wrap"><div class="spinner"></div><p>Loading squad…</p></div>';
  bballTeamRoster.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  const players = await fetchNBATeamRosterESPN(teamId);
  if (!players.length) {
    bballTeamRoster.innerHTML = `
      <div class="state-message state-empty">
        <span class="state-icon">📭</span>
        <p>No player data available for ${teamName}.</p>
      </div>`;
    return;
  }
  bballTeamRoster.innerHTML = renderPlayerRoster(players.slice(0, 15), teamName);
}

function renderBballTeamCards(teams) {
  if (!teams.length) {
    bballTeamResults.innerHTML = `
      <div class="state-message state-empty">
        <span class="state-icon">📭</span>
        <p>No NBA teams found. Try a different name.</p>
      </div>`;
    return;
  }
  bballTeamResults.innerHTML = `<div class="team-search-grid">${
    teams.map((t) => {
      const logo = t.logos?.[0]?.href || '';
      const name = t.displayName || t.name || 'Unknown';
      const arena = t.venue?.fullName || '';
      return `
      <div class="team-card">
        ${logo
          ? `<img class="team-card-badge" src="${logo}" alt="${name}" loading="lazy" onerror="this.style.display='none'">`
          : '<div class="team-card-badge team-card-badge--empty">🏀</div>'}
        <div class="team-card-info">
          <div class="team-card-name">${name}</div>
          <span class="team-card-league">NBA</span>
          <div class="team-card-meta">🌍 USA</div>
          ${arena ? `<div class="team-card-meta">🏟 ${arena}</div>` : ''}
          <button class="view-squad-btn" data-team-id="${t.id}" data-team-name="${name}">🏃 View Squad</button>
        </div>
      </div>`;
    }).join('')
  }</div>`;
}

bballTeamResults?.addEventListener('click', (e) => {
  const btn = e.target.closest('.view-squad-btn');
  if (!btn) return;
  loadBballTeamSquad(btn.dataset.teamId, btn.dataset.teamName);
});

bballTeamInput?.addEventListener('input', (e) => {
  clearTimeout(bballSearchTimer);
  const q = e.target.value;
  if (!q.trim()) {
    bballTeamResults.innerHTML = '';
    if (bballTeamRoster) bballTeamRoster.innerHTML = '';
    return;
  }
  if (q.trim().length < 2) return;
  bballSearchTimer = setTimeout(async () => {
    bballTeamResults.innerHTML = '<div class="spinner-wrap"><div class="spinner"></div><p>Searching…</p></div>';
    try {
      const teams = await searchNBATeamsESPN(q);
      renderBballTeamCards(teams);
    } catch {
      bballTeamResults.innerHTML = '<div class="state-message state-error"><span class="state-icon">⚠</span><p>Search failed. Try again.</p></div>';
    }
  }, 400);
});

/* ── Quick-nav scroll spy ────────────────────────────────────────────────── */

const quicknavBtns = document.querySelectorAll('.quicknav-btn');
const sections = ['section-matches', 'section-standings', 'section-teams', 'section-scorers']
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

/* ── Init ────────────────────────────────────────────────────────────────── */

const guestBanner = document.getElementById('guest-banner');
if (guestBanner) guestBanner.remove();

updateNavAuth();
initNav();
initNightMode();
initLiveTicker();
renderScorers();
loadNBAStandings(nbaStandingsSeason?.value || '2025');

/* Pre-warm NBA team cache so first search is instant */
searchNBATeamsESPN('__warmup__').catch(() => {});

/* WNBA picker — start from most recent WNBA/basketball date */
fetchRecentNBADate().then((date) => loadMatchesForDate(date));

/* NBA picker — start from NBA Finals date */
loadNBADayMatches('2026-06-13');
