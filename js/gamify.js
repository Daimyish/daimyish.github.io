/* ============================================================
   GAMIFICATION — XP bar, achievements, quest tracking
   All content accessible without engaging this layer
   ============================================================ */
(function () {
  const STORAGE_KEY = 'mng_portfolio_v1';
  const MAX_XP = 500;

  // Achievement definitions
  const ACHIEVEMENTS = {
    first_visit:    { name: 'First Boot',         icon: '⚡', xp: 10, desc: 'Loaded the site for the first time' },
    view_projects:  { name: 'Quest Board',        icon: '🗺️', xp: 15, desc: 'Visited the projects page' },
    view_about:     { name: 'Lore Unlocked',      icon: '📖', xp: 15, desc: 'Read the about page' },
    view_resume:    { name: 'Stat Sheet',         icon: '📜', xp: 15, desc: 'Checked out the resume' },
    view_contact:   { name: 'Comms Online',       icon: '📡', xp: 15, desc: 'Visited contact page' },
    case_phoenix:   { name: 'Phoenix Rising',     icon: '🔥', xp: 25, desc: 'Read the Phoenix Protocol case study' },
    case_steam:     { name: 'Full STEAM Ahead',   icon: '☁️', xp: 25, desc: 'Read the STEAM Dreams case study' },
    case_tempus:    { name: 'Time Walker',        icon: '⏳', xp: 25, desc: 'Read the Tempus case study' },
    case_gadig:     { name: 'Team Player',        icon: '🤝', xp: 25, desc: 'Read the GADIG projects case study' },
    case_dnd:       { name: 'Dungeon Master',     icon: '🎲', xp: 25, desc: 'Read the D&D campaigns case study' },
    all_pages:      { name: 'Completionist',      icon: '🏆', xp: 50, desc: 'Visited every page' },
    all_cases:      { name: 'Lorekeeper',         icon: '👑', xp: 50, desc: 'Read every case study' },
    explorer:       { name: 'Explorer',           icon: '🧭', xp: 30, desc: 'Scrolled to the bottom of a page' },
  };

  // Load state
  let state;
  try {
    state = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch (e) {
    state = {};
  }
  if (!state.xp) state.xp = 0;
  if (!state.unlocked) state.unlocked = [];
  if (!state.visited) state.visited = [];

  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
  }

  // XP bar
  function updateXPBar() {
    const fill = document.querySelector('.xp-bar-fill');
    const label = document.querySelector('.xp-label');
    if (fill) fill.style.width = Math.min(state.xp / MAX_XP * 100, 100) + '%';
    if (label) label.textContent = `XP ${state.xp} / ${MAX_XP}`;
  }

  // Quest nav markers
  function updateQuestMarkers() {
    document.querySelectorAll('.quest-item').forEach(item => {
      const page = item.dataset.page;
      if (page && state.visited.includes(page)) {
        item.classList.add('completed');
      }
    });
  }

  // Quest stats footer
  function updateQuestStats() {
    const el = document.querySelector('.quest-stats');
    if (el) {
      const total = Object.keys(ACHIEVEMENTS).length;
      const done = state.unlocked.length;
      el.textContent = `${done}/${total} ACHIEVEMENTS`;
    }
  }

  // Show achievement toast
  let toastQueue = [];
  let toastActive = false;

  function showToast(achKey) {
    const ach = ACHIEVEMENTS[achKey];
    if (!ach) return;

    toastQueue.push(ach);
    if (!toastActive) processToastQueue();
  }

  function processToastQueue() {
    if (toastQueue.length === 0) { toastActive = false; return; }
    toastActive = true;
    const ach = toastQueue.shift();

    const toast = document.createElement('div');
    toast.className = 'achievement-toast';
    toast.innerHTML = `
      <span class="toast-icon">${ach.icon}</span>
      <div>
        <span class="toast-text">${ach.name}</span>
        <span class="toast-xp">+${ach.xp} XP — ${ach.desc}</span>
      </div>
    `;
    document.body.appendChild(toast);

    // Screen shake
    document.body.classList.add('shake');
    setTimeout(() => document.body.classList.remove('shake'), 300);

    // Animate in
    requestAnimationFrame(() => {
      requestAnimationFrame(() => toast.classList.add('show'));
    });

    // Animate out
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        toast.remove();
        processToastQueue();
      }, 400);
    }, 2800);
  }

  // Unlock an achievement
  function unlock(key) {
    if (state.unlocked.includes(key)) return;
    const ach = ACHIEVEMENTS[key];
    if (!ach) return;

    state.unlocked.push(key);
    state.xp += ach.xp;
    save();
    updateXPBar();
    updateQuestStats();
    showToast(key);
  }

  // Track page visit
  function visitPage(page) {
    if (!state.visited.includes(page)) {
      state.visited.push(page);
      save();
      updateQuestMarkers();
    }
  }

  // Check meta achievements
  function checkMeta() {
    const mainPages = ['home', 'projects', 'about', 'resume', 'contact'];
    if (mainPages.every(p => state.visited.includes(p))) {
      unlock('all_pages');
    }
    const cases = ['case_phoenix', 'case_steam', 'case_tempus', 'case_gadig', 'case_dnd'];
    if (cases.every(k => state.unlocked.includes(k))) {
      unlock('all_cases');
    }
  }

  // Scroll-to-bottom detection
  let scrollUnlocked = false;
  function checkScroll() {
    if (scrollUnlocked) return;
    const scrolled = window.scrollY + window.innerHeight;
    const total = document.documentElement.scrollHeight;
    if (scrolled >= total - 50) {
      scrollUnlocked = true;
      unlock('explorer');
    }
  }
  window.addEventListener('scroll', checkScroll, { passive: true });

  // Initialize on DOM ready
  function init() {
    updateXPBar();
    updateQuestMarkers();
    updateQuestStats();

    // Page-specific unlocks
    const page = document.body.dataset.page;
    if (page) {
      visitPage(page);

      // First visit
      if (state.unlocked.length === 0) unlock('first_visit');

      // Page achievements
      const pageMap = {
        'projects': 'view_projects',
        'about': 'view_about',
        'resume': 'view_resume',
        'contact': 'view_contact',
        'case-phoenix': 'case_phoenix',
        'case-steam': 'case_steam',
        'case-tempus': 'case_tempus',
        'case-gadig': 'case_gadig',
        'case-dnd': 'case_dnd',
      };
      if (pageMap[page]) {
        // Delay so it feels like discovery
        setTimeout(() => unlock(pageMap[page]), 800);
      }

      // Check meta after a beat
      setTimeout(checkMeta, 1500);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for external use if needed
  window.MNG_Gamify = { unlock, visitPage, state };
})();
