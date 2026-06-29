import { updateNavAuth } from './auth.js';
import { FOOTBALL_SCORERS, BASKETBALL_SCORERS } from './data/players-data.js';
import { showPlayerModal, initLiveTicker, initNav } from './ui.js';

let currentSport = 'football';

function getPlayers() {
  return currentSport === 'football' ? FOOTBALL_SCORERS : BASKETBALL_SCORERS;
}

function renderTable(filter = '') {
  const thead = document.getElementById('players-thead');
  const tbody = document.getElementById('players-body');
  const query = filter.toLowerCase();
  const players = getPlayers().filter(
    (p) =>
      p.name.toLowerCase().includes(query) ||
      p.country.toLowerCase().includes(query)
  );

  if (currentSport === 'football') {
    thead.innerHTML = `
      <tr>
        <th>Rank</th>
        <th>Player</th>
        <th>Country</th>
        <th>Goals</th>
        <th>Clubs</th>
        <th>Status</th>
      </tr>
    `;
    tbody.innerHTML = players
      .map(
        (p) => `
      <tr data-rank="${p.rank}">
        <td>${p.rank}</td>
        <td>${p.name}</td>
        <td>${p.country}</td>
        <td>${p.goals}</td>
        <td>${p.clubs}</td>
        <td>${p.active ? 'Active' : 'Retired'}</td>
      </tr>
    `
      )
      .join('');
  } else {
    thead.innerHTML = `
      <tr>
        <th>Rank</th>
        <th>Player</th>
        <th>Country</th>
        <th>Points</th>
        <th>Teams</th>
        <th>Status</th>
      </tr>
    `;
    tbody.innerHTML = players
      .map(
        (p) => `
      <tr data-rank="${p.rank}">
        <td>${p.rank}</td>
        <td>${p.name}</td>
        <td>${p.country}</td>
        <td>${p.points.toLocaleString()}</td>
        <td>${p.teams}</td>
        <td>${p.active ? 'Active' : 'Retired'}</td>
      </tr>
    `
      )
      .join('');
  }
}

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
    renderTable();
  });
});

document.getElementById('players-body').addEventListener('click', (e) => {
  const row = e.target.closest('tr');
  if (!row) return;
  const rank = parseInt(row.dataset.rank, 10);
  const player = getPlayers().find((p) => p.rank === rank);
  if (player) showPlayerModal(player, currentSport);
});

document.getElementById('player-search').addEventListener('input', (e) => {
  renderTable(e.target.value);
});

updateNavAuth();
initNav();
initLiveTicker();
renderTable();
