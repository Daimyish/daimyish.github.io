/* ============================================================
   MAIN — Quest-log nav toggle, active page, utilities
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  // Mobile quest-nav toggle
  const toggle = document.querySelector('.quest-toggle');
  const questNav = document.querySelector('.quest-nav');
  if (toggle && questNav) {
    toggle.addEventListener('click', () => {
      questNav.classList.toggle('open');
      toggle.textContent = questNav.classList.contains('open') ? '✕' : '☰';
    });
    // Close on link click (mobile)
    questNav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        questNav.classList.remove('open');
        toggle.textContent = '☰';
      });
    });
  }

  // Highlight active quest item
  const currentPage = document.body.dataset.page || '';
  document.querySelectorAll('.quest-item').forEach(item => {
    if (item.dataset.page === currentPage) {
      item.classList.add('active');
    }
  });
});
