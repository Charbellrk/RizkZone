import { updateNavAuth } from './auth.js';
import { fetchFeaturedMatch, fetchUpcomingMatches } from './api.js';
import { HALL_OF_FAME } from './data/hall-of-fame.js';
import { SEASON_HIGHLIGHTS } from './data/players-data.js';
import { getRandomFact } from './data/facts.js';
import { initCounters, initLiveTicker, initNav, showError } from './ui.js';

const FAQ_DATA = [
  {
    q: 'Where does Arena Sports get its live data?',
    a: 'We fetch live scores and match information from TheSportsDB, a comprehensive sports database API updated regularly with results from leagues worldwide.',
  },
  {
    q: 'Do I need an account to use the website?',
    a: 'No — you can browse as a guest. However, registered users get access to all 15 matches per page and both mini games, while guests see 9 matches and one game.',
  },
  {
    q: 'Which football leagues are covered?',
    a: 'We cover the Premier League, La Liga, Serie A, Bundesliga, Ligue 1, Champions League, and FIFA World Cup matches.',
  },
  {
    q: 'Can I play the mini games on mobile?',
    a: 'Yes! Both the penalty shootout and free throw challenge are designed to work on desktop and touch devices.',
  },
  {
    q: 'How often is match data updated?',
    a: 'Live scores refresh every two minutes. Match lists and upcoming fixtures are fetched each time you visit or reload a page.',
  },
];

function renderHallOfFame() {
  const grid = document.getElementById('hof-grid');
  grid.innerHTML = HALL_OF_FAME.map(
    (player) => `
    <div class="hof-card">
      <div class="hof-card-inner">
        <div class="hof-card-front">
          <img src="${player.image}" alt="${player.name}" loading="lazy">
          <div class="hof-info">
            <h3>${player.name}</h3>
            <span>${player.sport}</span>
          </div>
        </div>
        <div class="hof-card-back">
          <h3>${player.name}</h3>
          ${Object.entries(player.stats)
            .map(([key, val]) => `<div class="hof-stat"><dt>${key}</dt><dd>${val}</dd></div>`)
            .join('')}
        </div>
      </div>
    </div>
  `
  ).join('');
}

function renderHighlights() {
  const container = document.getElementById('stats-highlights');
  const items = [
    { label: 'Top Scorer', ...SEASON_HIGHLIGHTS.topScorer },
    { label: 'Top Assists', ...SEASON_HIGHLIGHTS.topAssists },
    { label: 'Player of the Week', ...SEASON_HIGHLIGHTS.playerOfWeek },
  ];

  container.innerHTML = items
    .map(
      (item) => `
    <div class="highlight-card fade-in">
      <div class="label">${item.label}</div>
      <h3>${item.name}</h3>
      <div class="stat">${item.stat}</div>
      <div class="league">${item.league}</div>
    </div>
  `
    )
    .join('');
}

async function loadFeaturedMatch() {
  const container = document.getElementById('featured-match');
  try {
    const match = await fetchFeaturedMatch();
    if (!match) {
      container.innerHTML = '<p class="state-empty">No featured match available today.</p>';
      return;
    }
    container.innerHTML = `
      <div class="featured-match fade-in">
        <div class="featured-teams">
          <span class="featured-team">${match.home}</span>
          <span class="featured-score">${match.homeScore} - ${match.awayScore}</span>
          <span class="featured-team">${match.away}</span>
        </div>
        <div class="featured-meta">${match.league} • ${match.date} ${match.time ? `• ${match.time}` : ''}</div>
      </div>
    `;
  } catch {
    showError(container, 'Could not load featured match.');
  }
}

async function loadUpcoming() {
  const container = document.getElementById('upcoming-matches');
  try {
    const matches = await fetchUpcomingMatches(5);
    if (!matches.length) {
      container.innerHTML = '<div class="state-message state-empty"><p>No upcoming matches found.</p></div>';
      return;
    }
    container.innerHTML = matches
      .map(
        (m) => `
      <article class="match-card fade-in">
        <div class="match-league">${m.league}</div>
        <div class="match-teams">
          <span class="team">${m.home}</span>
          <span class="match-score">vs</span>
          <span class="team">${m.away}</span>
        </div>
        <div class="match-meta">${m.date} ${m.time ? `• ${m.time}` : ''}</div>
      </article>
    `
      )
      .join('');
  } catch {
    showError(container, 'Could not load upcoming matches.');
  }
}

function initFAQ() {
  const list = document.getElementById('faq-list');
  list.innerHTML = FAQ_DATA.map(
    (item, i) => `
    <div class="faq-item" data-index="${i}">
      <button class="faq-question" aria-expanded="false">
        ${item.q}
        <span class="faq-icon">+</span>
      </button>
      <div class="faq-answer">${item.a}</div>
    </div>
  `
  ).join('');

  list.addEventListener('click', (e) => {
    const btn = e.target.closest('.faq-question');
    if (!btn) return;
    const item = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    list.querySelectorAll('.faq-item').forEach((el) => el.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
    btn.setAttribute('aria-expanded', !isOpen);
  });
}

function initFacts() {
  const factEl = document.getElementById('random-fact');
  const showFact = () => {
    factEl.textContent = getRandomFact();
  };
  showFact();
  document.getElementById('new-fact-btn').addEventListener('click', showFact);
}

updateNavAuth();
initNav();
initLiveTicker();
initCounters();
renderHallOfFame();
renderHighlights();
initFAQ();
initFacts();
loadFeaturedMatch();
loadUpcoming();
