/* ============================================================
   CUSTOM CURSOR — Crosshair dot + trailing ring with states
   Magnetic snap on links, card morph, spring physics
   ============================================================ */
(function () {
  // Bail on touch devices
  if ('ontouchstart' in window) {
    document.body.style.cursor = 'auto';
    document.querySelectorAll('a, button').forEach(el => el.style.cursor = 'pointer');
    return;
  }

  const dot = document.createElement('div');
  dot.classList.add('cursor-dot');
  document.body.appendChild(dot);

  const ring = document.createElement('div');
  ring.classList.add('cursor-ring');
  document.body.appendChild(ring);

  let mouseX = -100, mouseY = -100;
  let ringX = -100, ringY = -100;
  let dotX = -100, dotY = -100;

  // Spring physics for ring
  let ringVX = 0, ringVY = 0;
  const SPRING = 0.15;
  const FRICTION = 0.75;

  // Magnetic snap
  const MAGNET_DIST = 60;
  const MAGNET_STRENGTH = 0.3;
  let magnetTarget = null;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // Track interactive elements
  function setupInteractions() {
    document.querySelectorAll('a, button, .hero-cta').forEach(el => {
      el.addEventListener('mouseenter', () => {
        document.body.classList.add('cursor-hover');
        magnetTarget = el;
      });
      el.addEventListener('mouseleave', () => {
        document.body.classList.remove('cursor-hover');
        magnetTarget = null;
      });
    });

    document.querySelectorAll('.project-card').forEach(el => {
      el.addEventListener('mouseenter', () => {
        document.body.classList.add('cursor-card');
        document.body.classList.remove('cursor-hover');
      });
      el.addEventListener('mouseleave', () => {
        document.body.classList.remove('cursor-card');
      });
    });
  }

  function animate() {
    // Magnetic snap toward link center
    let targetX = mouseX;
    let targetY = mouseY;

    if (magnetTarget) {
      const rect = magnetTarget.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = mouseX - cx;
      const dy = mouseY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < MAGNET_DIST) {
        const pull = (1 - dist / MAGNET_DIST) * MAGNET_STRENGTH;
        targetX = mouseX - dx * pull;
        targetY = mouseY - dy * pull;
      }
    }

    // Dot follows immediately
    dotX = targetX;
    dotY = targetY;
    dot.style.left = dotX + 'px';
    dot.style.top = dotY + 'px';

    // Ring follows with spring physics
    const ax = (targetX - ringX) * SPRING;
    const ay = (targetY - ringY) * SPRING;
    ringVX += ax;
    ringVY += ay;
    ringVX *= FRICTION;
    ringVY *= FRICTION;
    ringX += ringVX;
    ringY += ringVY;
    ring.style.left = ringX + 'px';
    ring.style.top = ringY + 'px';

    requestAnimationFrame(animate);
  }

  // Initialize after DOM is ready
  setupInteractions();

  // Re-setup on page content changes (for dynamic content)
  const observer = new MutationObserver(() => setupInteractions());
  observer.observe(document.body, { childList: true, subtree: true });

  animate();
})();
