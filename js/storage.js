import { updateNavAuth } from './auth.js';
import { isLoggedIn } from './auth.js';
import { getSaves, unsaveMatch, clearAllSaves } from './saves.js';
import { initNav, initNightMode, initLiveTicker } from './ui.js';

updateNavAuth();
initNav();
initNightMode();
initLiveTicker();

const container = document.getElementById('saved-matches-container');

function render() {
  if (!isLoggedIn()) {
    container.innerHTML = `
      <div class="state-message state-empty" style="margin:64px auto;max-width:460px;text-align:center;">
        <span class="state-icon">🔒</span>
        <p>Please <a href="login.html" style="color:var(--accent);font-weight:600;">log in</a> to view your saved matches.</p>
      </div>`;
    return;
  }

  const saves = getSaves();

  if (!saves.length) {
    container.innerHTML = `
      <div class="state-message state-empty" style="margin:64px auto;max-width:460px;text-align:center;">
        <span class="state-icon">📂</span>
        <p>No saved matches yet.<br>Click <strong>💾</strong> on any match card to save it here.</p>
      </div>`;
    return;
  }

  const grouped = saves.reduce((acc, m) => {
    const league = m.league || 'Other';
    (acc[league] = acc[league] || []).push(m);
    return acc;
  }, {});

  const groupsHtml = Object.entries(grouped).map(([league, matches]) => `
    <div class="saved-group">
      <h3 class="saved-group-title">${league} <span class="saved-group-count">${matches.length}</span></h3>
      <div class="matches-grid">
        ${matches.map((m) => `
          <article class="match-card saved-match-card" data-key="${m._key}">
            <div class="match-league">${m.league}</div>
            <div class="match-teams">
              <span class="team">${m.home}</span>
              <span class="match-score">${m.homeScore ?? '–'}–${m.awayScore ?? '–'}</span>
              <span class="team">${m.away}</span>
            </div>
            <div class="match-meta">${m.date || ''}${m.time ? ` • ${m.time}` : ''}</div>
            <div class="saved-on">Saved ${new Date(m.savedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
            <button class="save-remove-btn" data-key="${m._key}" title="Remove">✕ Remove</button>
          </article>`).join('')}
      </div>
    </div>`).join('');

  container.innerHTML = `
    <div class="saved-header">
      <p class="saved-count">${saves.length} saved match${saves.length !== 1 ? 'es' : ''}</p>
      <button id="clear-all-btn" class="btn-danger-sm">🗑 Clear All</button>
    </div>
    ${groupsHtml}`;

  document.getElementById('clear-all-btn').addEventListener('click', () => {
    if (confirm('Remove all saved matches?')) {
      clearAllSaves();
      render();
    }
  });

  container.querySelectorAll('.save-remove-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      unsaveMatch(btn.dataset.key);
      btn.closest('.saved-match-card').remove();
      // Re-render if empty or need to update count
      if (!getSaves().length) render();
      else {
        const countEl = container.querySelector('.saved-count');
        if (countEl) {
          const n = getSaves().length;
          countEl.textContent = `${n} saved match${n !== 1 ? 'es' : ''}`;
        }
      }
    });
  });
}

render();
