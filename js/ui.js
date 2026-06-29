export function showSpinner(container) {
  if (!container) return;
  container.innerHTML = `
    <div class="spinner-wrap" role="status" aria-live="polite">
      <div class="spinner"></div>
      <p>Loading data...</p>
    </div>
  `;
}

export function showError(container, message = 'Something went wrong. Please try again.') {
  if (!container) return;
  container.innerHTML = `
    <div class="state-message state-error" role="alert">
      <span class="state-icon">⚠</span>
      <p>${message}</p>
    </div>
  `;
}

export function showEmpty(container, message = 'No results available at the moment.') {
  if (!container) return;
  container.innerHTML = `
    <div class="state-message state-empty">
      <span class="state-icon">📭</span>
      <p>${message}</p>
    </div>
  `;
}

export function createMatchCard(match, onClick) {
  const card = document.createElement('article');
  card.className = 'match-card fade-in';
  card.innerHTML = `
    <div class="match-league">${match.league}</div>
    <div class="match-teams">
      <span class="team">${match.home}</span>
      <span class="match-score">${match.homeScore} - ${match.awayScore}</span>
      <span class="team">${match.away}</span>
    </div>
    <div class="match-meta">${match.date} ${match.time ? `• ${match.time}` : ''}</div>
  `;
  if (onClick) {
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => onClick(match));
  }
  return card;
}

export function openModal(title, contentHtml) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <button class="modal-close" aria-label="Close">&times;</button>
      <h2 id="modal-title">${title}</h2>
      <div class="modal-body">${contentHtml}</div>
    </div>
  `;

  const close = () => overlay.remove();
  overlay.querySelector('.modal-close').addEventListener('click', close);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });
  document.addEventListener('keydown', function escHandler(e) {
    if (e.key === 'Escape') {
      close();
      document.removeEventListener('keydown', escHandler);
    }
  });

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('visible'));
}

export async function showMatchModal(match) {
  const { fetchEventDetails } = await import('./api.js');
  openModal('Loading...', '<div class="spinner-wrap"><div class="spinner"></div></div>');

  const overlay = document.querySelector('.modal-overlay');
  try {
    const details = await fetchEventDetails(match.id);
    if (!details) throw new Error('Details not found');

    overlay.querySelector('#modal-title').textContent = `${details.home} vs ${details.away}`;
    overlay.querySelector('.modal-body').innerHTML = `
      <div class="modal-match-header">
        ${details.homeBadge ? `<img src="${details.homeBadge}" alt="${details.home}" class="team-badge">` : ''}
        <div class="modal-score">${details.homeScore} - ${details.awayScore}</div>
        ${details.awayBadge ? `<img src="${details.awayBadge}" alt="${details.away}" class="team-badge">` : ''}
      </div>
      <dl class="detail-grid">
        <dt>League</dt><dd>${details.league}</dd>
        <dt>Date</dt><dd>${details.date} ${details.time}</dd>
        <dt>Venue</dt><dd>${details.venue}</dd>
        <dt>Season</dt><dd>${details.season || 'N/A'}</dd>
        <dt>Round</dt><dd>${details.round || 'N/A'}</dd>
        <dt>Referee</dt><dd>${details.referee}</dd>
        <dt>Status</dt><dd>${details.status || 'Completed'}</dd>
        <dt>Attendance</dt><dd>${details.attendance}</dd>
      </dl>
      <p class="modal-description">${details.description}</p>
    `;
  } catch {
    overlay.querySelector('#modal-title').textContent = 'Error';
    overlay.querySelector('.modal-body').innerHTML = '<p class="state-error">Could not load match details.</p>';
  }
}

export function showPlayerModal(player, sport) {
  const statLabel = sport === 'football' ? 'Career Goals' : 'Career Points';
  const statValue = sport === 'football' ? player.goals : player.points.toLocaleString();
  const teamsLabel = sport === 'football' ? 'Clubs' : 'Teams';

  openModal(player.name, `
    <div class="player-modal-content">
      <div class="player-rank-badge">#${player.rank}</div>
      <dl class="detail-grid">
        <dt>Country</dt><dd>${player.country}</dd>
        <dt>${statLabel}</dt><dd>${statValue}</dd>
        <dt>${teamsLabel}</dt><dd>${player.clubs || player.teams}</dd>
        <dt>Status</dt><dd>${player.active ? 'Active' : 'Retired'}</dd>
      </dl>
    </div>
  `);
}

export function initCounters() {
  const counters = document.querySelectorAll('[data-counter]');
  if (!counters.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.counter, 10);
        const suffix = el.dataset.suffix || '';
        let current = 0;
        const step = Math.ceil(target / 60);

        const tick = () => {
          current = Math.min(current + step, target);
          el.textContent = current + suffix;
          if (current < target) requestAnimationFrame(tick);
        };
        tick();
        observer.unobserve(el);
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((c) => observer.observe(c));
}

export function initLiveTicker() {
  const ticker = document.getElementById('live-ticker');
  if (!ticker) return;

  async function loadTicker() {
    try {
      const { fetchLiveScores } = await import('./api.js');
      const [soccer, basketball] = await Promise.all([
        fetchLiveScores('Soccer'),
        fetchLiveScores('Basketball'),
      ]);
      const events = [...soccer, ...basketball].slice(0, 20);

      if (!events.length) {
        ticker.innerHTML = '<span class="ticker-item">No live scores today — check back soon!</span>';
        return;
      }

      const items = events
        .map(
          (e) =>
            `<span class="ticker-item">${e.home} ${e.homeScore}-${e.awayScore} ${e.away} <em>(${e.league})</em></span>`
        )
        .join('<span class="ticker-sep">•</span>');

      ticker.innerHTML = items + items;
    } catch {
      ticker.innerHTML = '<span class="ticker-item">Live scores temporarily unavailable</span>';
    }
  }

  loadTicker();
  setInterval(loadTicker, 120000);
}

export function initNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach((link) => {
    const href = link.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}
