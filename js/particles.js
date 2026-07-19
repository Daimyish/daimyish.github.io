/* ============================================================
   PARTICLE HERO — Teal particle field with mouse interaction
   ============================================================ */
(function () {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H;
  let mouse = { x: -9999, y: -9999 };
  let particles = [];
  const PARTICLE_COUNT = 90;
  const CONNECT_DIST = 120;
  const MOUSE_RADIUS = 140;
  const SCATTER_FORCE = 0.08;
  const RETURN_FORCE = 0.02;
  const DAMPING = 0.96;
  const PARTICLE_RGB = '189, 70, 86';

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    W = canvas.width = rect.width;
    H = canvas.height = rect.height;
  }

  class Particle {
    constructor() {
      this.homeX = Math.random() * W;
      this.homeY = Math.random() * H;
      this.x = this.homeX;
      this.y = this.homeY;
      this.vx = 0;
      this.vy = 0;
      this.size = Math.random() * 2 + 0.5;
      this.alpha = Math.random() * 0.5 + 0.2;
    }

    update() {
      // Mouse scatter
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < MOUSE_RADIUS && dist > 0) {
        const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS * SCATTER_FORCE;
        this.vx += (dx / dist) * force * 60;
        this.vy += (dy / dist) * force * 60;
      }

      // Spring back to home
      this.vx += (this.homeX - this.x) * RETURN_FORCE;
      this.vy += (this.homeY - this.y) * RETURN_FORCE;

      // Damping
      this.vx *= DAMPING;
      this.vy *= DAMPING;

      this.x += this.vx;
      this.y += this.vy;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${PARTICLE_RGB}, ${this.alpha})`;
      ctx.fill();
    }
  }

  function init() {
    resize();
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new Particle());
    }
  }

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECT_DIST) {
          const alpha = (1 - dist / CONNECT_DIST) * 0.15;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(${PARTICLE_RGB}, ${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    drawConnections();
    requestAnimationFrame(animate);
  }

  // Track mouse relative to canvas
  canvas.parentElement.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  canvas.parentElement.addEventListener('mouseleave', () => {
    mouse.x = -9999;
    mouse.y = -9999;
  });

  window.addEventListener('resize', () => {
    resize();
    // Re-home particles
    particles.forEach(p => {
      p.homeX = Math.random() * W;
      p.homeY = Math.random() * H;
    });
  });

  init();
  animate();
})();
