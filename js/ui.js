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

  /* Live badge + current minute, or kick-off date/time for finished matches */
  let timeLine = '';
  if (match.isLive) {
    const min = match.progress || match.status || 'LIVE';
    timeLine = `<div class="match-meta"><span class="match-live-badge">● LIVE</span> <span class="match-live-min">${min}</span></div>`;
  } else {
    const datePart = match.date || '';
    const timePart = match.time ? ` • ${match.time}` : '';
    timeLine = `<div class="match-meta">${datePart}${timePart}</div>`;
  }

  card.innerHTML = `
    <div class="match-league">${match.league}</div>
    <div class="match-teams">
      <span class="team">${match.home}</span>
      <span class="match-score">${match.homeScore} – ${match.awayScore}</span>
      <span class="team">${match.away}</span>
    </div>
    ${timeLine}
  `;
  if (onClick) {
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => onClick(match));
  }

  /* Share button */
  const shareBtn = document.createElement('button');
  shareBtn.className = 'match-share-btn';
  shareBtn.title = 'Share match';
  shareBtn.textContent = '↗';
  shareBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const text = `${match.home} ${match.homeScore}–${match.awayScore} ${match.away} | ${match.league} | ${match.date} — via RizkZone`;
    const share = () => {
      if (navigator.share) { navigator.share({ text }); return; }
      navigator.clipboard?.writeText(text).then(() => {
        shareBtn.textContent = '✓';
        setTimeout(() => { shareBtn.textContent = '↗'; }, 1500);
      }).catch(() => window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank'));
    };
    share();
  });
  card.style.position = 'relative';
  card.appendChild(shareBtn);

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
  const label  = document.querySelector('.ticker-label');
  if (!ticker) return;

  function setLabel(text, isLive) {
    if (!label) return;
    label.textContent = text;
    label.style.background = isLive ? '#e53e3e' : '#1a56db';
  }

  function buildItems(events) {
    const sep = '<span class="ticker-sep">•</span>';
    const row = events.map((e) => {
      let timePart = '';
      if (e.isLive) {
        const min = e.progress || e.status;
        timePart = min ? ` <span class="ticker-time">${min}</span>` : '';
      } else if (e.time) {
        timePart = ` <span class="ticker-time">${e.time}</span>`;
      }
      return `<span class="ticker-item">${e.home} <strong>${e.homeScore}–${e.awayScore}</strong> ${e.away}${timePart} <em>(${e.league})</em></span>`;
    }).join(sep);
    // repeat enough times so there's always enough content for smooth scrolling
    const repeats = Math.max(2, Math.ceil(8 / events.length));
    const base = Array(repeats).fill(row).join(sep);
    return base + sep + base; // -50% animation point
  }

  const WC_LEAGUE_ID = '4429';
  const isWC = (e) =>
    e.leagueId === WC_LEAGUE_ID ||
    (e.league || '').toLowerCase().includes('world cup') ||
    (e.league || '').toLowerCase().includes('copa mundial');

  function animateTicker(items) {
    ticker.innerHTML = buildItems(items);
    ticker.style.animation = 'none';
    ticker.offsetHeight; // force reflow
    ticker.style.animation = `ticker-scroll ${Math.max(15, items.length * 6)}s linear infinite`;
  }

  async function loadTicker() {
    try {
      const { fetchLiveScores, fetchLeaguePastEvents } = await import('./api.js');

      /* 1 — check for live World Cup matches today */
      const todaySoccer = await fetchLiveScores('Soccer');
      const wcLive = todaySoccer.filter((e) => e.isLive && isWC(e));
      if (wcLive.length) {
        setLabel('LIVE', true);
        animateTicker(wcLive);
        return;
      }

      /* 2 — non-live today's World Cup fixtures (scheduled/completed today) */
      const wcToday = todaySoccer.filter((e) => isWC(e));
      if (wcToday.length) {
        setLabel('WC 2026', false);
        animateTicker(wcToday);
        return;
      }

      /* 3 — recent past World Cup 2026 results */
      setLabel('WC 2026', false);
      const wcPast = await fetchLeaguePastEvents(WC_LEAGUE_ID, 8);
      if (wcPast.length) {
        animateTicker(wcPast);
      } else {
        ticker.innerHTML = '<span class="ticker-item">FIFA World Cup 2026 — scores loading…</span>';
      }
    } catch {
      ticker.innerHTML = '<span class="ticker-item">Scores temporarily unavailable</span>';
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

  const navInner = document.querySelector('.nav-inner');
  const navLinks = document.querySelector('.nav-links');
  const authWrap = document.querySelector('.nav-auth-wrap');
  if (!navInner || !navLinks) return;

  // ── Hamburger button ────────────────────────────────────────────────────
  const hamburger = document.createElement('button');
  hamburger.className = 'hamburger-btn';
  hamburger.setAttribute('aria-label', 'Toggle navigation menu');
  hamburger.setAttribute('aria-expanded', 'false');
  hamburger.innerHTML = '<span></span><span></span><span></span>';
  if (authWrap) {
    authWrap.insertBefore(hamburger, authWrap.firstChild);
  } else {
    navInner.appendChild(hamburger);
  }

  // ── Mobile overlay menu ─────────────────────────────────────────────────
  const overlay = document.createElement('div');
  overlay.className = 'mobile-menu';
  overlay.setAttribute('aria-hidden', 'true');

  const clonedLinks = navLinks.cloneNode(true);
  clonedLinks.className = 'mobile-nav-links';
  overlay.appendChild(clonedLinks);

  // Add Login link to mobile menu if the auth link exists
  const authLink = document.getElementById('nav-auth');
  if (authLink) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = authLink.href;
    a.className = 'nav-link mobile-login-link';
    a.textContent = authLink.textContent;
    li.appendChild(a);
    clonedLinks.appendChild(li);
  }

  document.body.appendChild(overlay);

  // ── Toggle helpers ──────────────────────────────────────────────────────
  function openMenu() {
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    overlay.classList.contains('open') ? closeMenu() : openMenu();
  });

  overlay.addEventListener('click', (e) => {
    if (e.target.closest('a')) closeMenu();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });
}

export function initNightMode() {
  const btn = document.getElementById('night-mode-toggle');
  if (!btn) return;

  const apply = (isNight) => {
    document.body.classList.toggle('night-mode', isNight);
    btn.textContent = isNight ? '☀️' : '🌙';
    btn.title = isNight ? 'Switch to day mode' : 'Switch to night mode';
  };

  apply(localStorage.getItem('nightMode') === 'true');

  btn.addEventListener('click', () => {
    const isNight = document.body.classList.contains('night-mode');
    apply(!isNight);
    localStorage.setItem('nightMode', String(!isNight));
  });
}
