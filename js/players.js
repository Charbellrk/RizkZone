import { updateNavAuth } from './auth.js';
import { fetchESPNSoccerScorers, fetchESPNNBAScorers, searchPlayers, enrichPlayersWithLeague } from './api.js';
import { FOOTBALL_SCORERS, BASKETBALL_SCORERS } from './data/players-data.js';
import { showSpinner, showError, showEmpty, showPlayerModal, initLiveTicker, initNav, initNightMode } from './ui.js';

let currentSport = 'football';

/* ── Career records table ────────────────────────────────────────────────── */

function getCareerPlayers() {
  return currentSport === 'football' ? FOOTBALL_SCORERS : BASKETBALL_SCORERS;
}

function renderCareerTable(filter = '') {
  const thead = document.getElementById('players-thead');
  const tbody = document.getElementById('players-body');
  const title = document.getElementById('career-table-title');
  const query = filter.toLowerCase();

  title.textContent = currentSport === 'football'
    ? '📋 All-Time Football Career Records'
    : '📋 All-Time NBA Career Records';

  const players = getCareerPlayers().filter(
    (p) => p.name.toLowerCase().includes(query) || p.country.toLowerCase().includes(query)
  );

  if (currentSport === 'football') {
    thead.innerHTML = `
      <tr>
        <th>Rank</th><th>Player</th><th>Country</th><th>Career Goals</th><th>Clubs</th><th>Status</th>
      </tr>`;
    tbody.innerHTML = players.map((p) => `
      <tr data-rank="${p.rank}">
        <td>${p.rank}</td>
        <td>${p.name}</td>
        <td>${p.country}</td>
        <td><strong>${p.goals.toLocaleString()}</strong></td>
        <td style="font-size:0.8rem;color:var(--text-muted)">${p.clubs}</td>
        <td>${p.active ? '🟢 Active' : '⚪ Retired'}</td>
      </tr>`).join('');
  } else {
    thead.innerHTML = `
      <tr>
        <th>Rank</th><th>Player</th><th>Country</th><th>Career Points</th><th>Teams</th><th>Status</th>
      </tr>`;
    tbody.innerHTML = players.map((p) => `
      <tr data-rank="${p.rank}">
        <td>${p.rank}</td>
        <td>${p.name}</td>
        <td>${p.country}</td>
        <td><strong>${p.points.toLocaleString()}</strong></td>
        <td style="font-size:0.8rem;color:var(--text-muted)">${p.teams}</td>
        <td>${p.active ? '🟢 Active' : '⚪ Retired'}</td>
      </tr>`).join('');
  }
}

/* ── Season leaders (ESPN API) ───────────────────────────────────────────── */

const seasonGrid      = document.getElementById('season-leaders-grid');
const seasonTitle     = document.getElementById('season-leaders-title');
const seasonSub       = document.getElementById('season-leaders-sub');
const compPicker      = document.getElementById('competition-picker');
const compSelect      = document.getElementById('competition-select');

function renderSeasonLeaders(leaders, statLabel) {
  if (!leaders.length) {
    seasonGrid.innerHTML = `
      <div class="state-message state-empty">
        <span class="state-icon">📭</span>
        <p>Season stats not available right now. This can happen during the off-season or if the ESPN API is temporarily unreachable.</p>
      </div>`;
    return;
  }

  const isSoccer = currentSport === 'football';
  const unit = isSoccer ? 'Goals' : 'PPG';
  const displayStat = statLabel || unit;

  seasonGrid.innerHTML = `
    <div class="season-leaders-table-wrap">
      <table class="data-table season-leaders-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Player</th>
            <th>Team</th>
            <th>${displayStat}</th>
          </tr>
        </thead>
        <tbody>
          ${leaders.map((p) => `
            <tr>
              <td><span class="season-rank">${p.rank}</span></td>
              <td><strong>${p.name}</strong></td>
              <td style="color:var(--text-muted);font-size:0.88rem">${p.team}</td>
              <td><span class="season-stat-value">${p.displayValue}</span></td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

async function loadSeasonLeaders() {
  seasonGrid.innerHTML = '<div class="spinner-wrap"><div class="spinner"></div><p>Loading live stats…</p></div>';

  if (currentSport === 'football') {
    const competition = compSelect?.value || 'eng.1';
    const compName = compSelect?.selectedOptions[0]?.text || 'Premier League';
    seasonTitle.textContent = `⚡ ${compName} Top Scorers`;
    seasonSub.textContent = 'Live data via ESPN · Updates each matchday';
    compPicker.style.display = '';

    const leaders = await fetchESPNSoccerScorers(competition);
    renderSeasonLeaders(leaders, 'Goals');
  } else {
    seasonTitle.textContent = '⚡ NBA Scoring Leaders';
    seasonSub.textContent = 'Live data via ESPN · Points per game this season';
    compPicker.style.display = 'none';

    const leaders = await fetchESPNNBAScorers();
    renderSeasonLeaders(leaders, 'PPG');
  }
}

/* ── Sport tab switching ─────────────────────────────────────────────────── */

document.querySelectorAll('.toggle-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.toggle-btn').forEach((b) => {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
    currentSport = btn.dataset.sport;
    document.getElementById('player-search').value = '';
    renderCareerTable();
    loadSeasonLeaders();
    updateLookupPlaceholder();
  });
});

/* ── Competition picker ──────────────────────────────────────────────────── */

compSelect?.addEventListener('change', () => {
  if (currentSport === 'football') loadSeasonLeaders();
});

/* ── Career table row click → modal ────────────────────────────────────── */

document.getElementById('players-body').addEventListener('click', (e) => {
  const row = e.target.closest('tr');
  if (!row) return;
  const rank = parseInt(row.dataset.rank, 10);
  const player = getCareerPlayers().find((p) => p.rank === rank);
  if (player) showPlayerModal(player, currentSport);
});

/* ── Career table search ────────────────────────────────────────────────── */

document.getElementById('player-search').addEventListener('input', (e) => {
  renderCareerTable(e.target.value);
});

/* ── Live player search ──────────────────────────────────────────────────── */

const lookupInput   = document.getElementById('player-lookup-input');
const lookupResults = document.getElementById('player-lookup-results');
const lookupSub     = document.getElementById('player-lookup-sub');

function renderPlayerCards(players) {
  if (!players.length) {
    lookupResults.innerHTML = `
      <div class="state-message state-empty">
        <span class="state-icon">📭</span>
        <p>No players found. Try a different spelling or shorter name.</p>
      </div>`;
    return;
  }

  lookupResults.innerHTML = `
    <div class="player-lookup-grid">
      ${players.map((p) => {
        const flag = p.leagueCountry ? `<span style="font-size:0.75rem;color:var(--text-muted)">${p.leagueCountry}</span>` : '';
        const photo = p.thumb
          ? `<img class="player-lookup-photo" src="${p.thumb}" alt="${p.name}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
          : '';
        const placeholder = `<div class="player-lookup-photo player-lookup-placeholder" style="${p.thumb ? 'display:none' : ''}">⚽</div>`;
        return `
          <div class="player-lookup-card">
            <div class="player-lookup-avatar">${photo}${placeholder}</div>
            <div class="player-lookup-info">
              <div class="player-lookup-name">${p.name}</div>
              <div class="player-lookup-club">🏟 ${p.team}</div>
              <span class="player-lookup-league">${p.league}</span>
              ${flag}
              <div class="player-lookup-meta">
                🌍 ${p.nationality} &nbsp;·&nbsp; ${p.position}
                ${p.status === 'Retired' ? '&nbsp;·&nbsp; <em>Retired</em>' : ''}
              </div>
            </div>
          </div>`;
      }).join('')}
    </div>`;
}

let searchTimer = null;

function handleLookup(query) {
  clearTimeout(searchTimer);
  if (!query.trim()) {
    lookupResults.innerHTML = '';
    return;
  }
  if (query.trim().length < 2) return;

  searchTimer = setTimeout(async () => {
    lookupResults.innerHTML = '<div class="spinner-wrap"><div class="spinner"></div><p>Searching…</p></div>';
    try {
      const sport = currentSport; // football or basketball
      const raw = await searchPlayers(query, sport);
      if (!raw.length) {
        renderPlayerCards([]);
        return;
      }
      const enriched = await enrichPlayersWithLeague(raw);
      renderPlayerCards(enriched);
    } catch {
      lookupResults.innerHTML = `
        <div class="state-message state-error">
          <span class="state-icon">⚠</span>
          <p>Search failed. Check your connection and try again.</p>
        </div>`;
    }
  }, 420);
}

lookupInput.addEventListener('input', (e) => handleLookup(e.target.value));

/* Update search placeholder when sport tab changes */
function updateLookupPlaceholder() {
  if (!lookupInput) return;
  if (currentSport === 'football') {
    lookupInput.placeholder = 'Type a player name (e.g. Salah, Bellingham, Mbappé)…';
    lookupSub.textContent = 'Search European football players — live data from TheSportsDB';
  } else {
    lookupInput.placeholder = 'Type a player name (e.g. LeBron, Curry, Durant)…';
    lookupSub.textContent = 'Search basketball players — live data from TheSportsDB';
  }
  lookupInput.value = '';
  lookupResults.innerHTML = '';
}

/* ── Init ───────────────────────────────────────────────────────────────── */

updateNavAuth();
initNav();
initNightMode();
initLiveTicker();
renderCareerTable();
loadSeasonLeaders();
