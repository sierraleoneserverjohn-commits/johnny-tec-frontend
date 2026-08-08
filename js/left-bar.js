/**
 * Right Sidebar — Model selection, toggle, and sparkline.
 */
export function initRightBar() {
  const root = document.getElementById('right-bar');
  if (!root) return;

  // 1. Model Selection Logic
  const models = root.querySelectorAll('.rb-model');
  models.forEach((item) => {
    item.addEventListener('click', () => {
      // Remove active class and checkmark from all models
      models.forEach((m) => {
        m.classList.remove('is-active');
        m.querySelector('.model-check')?.remove();
      });
      
      // Add active class and checkmark to the tapped model
      item.classList.add('is-active');
      if (!item.querySelector('.model-check')) {
        item.insertAdjacentHTML('beforeend', `<svg class="model-check" viewBox="0 0 24 24"><path d="m5 13 4 4L19 7"/></svg>`);
      }
      
      // Dispatch custom event for your app
      document.dispatchEvent(new CustomEvent('jt:model-change', { detail: item.dataset.model }));
    });
  });

  // 2. Right Bar Close Button
  const closeBtn = root.querySelector('#rightBarClose');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      root.classList.remove('is-open');
    });
  }

  // 3. Status Sparkline
  const sparkCanvas = root.querySelector('#statusSpark');
  if (sparkCanvas) {
    drawSparkline(sparkCanvas);
  }
}

// Global toggle listener for the right bar
document.addEventListener('jt:toggle-right-bar', () => {
  const root = document.getElementById('right-bar');
  if (root) root.classList.toggle('is-open');
});

/**
 * Sparkline Drawing Logic
 */
function drawSparkline(canvas) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;

  function resize() {
    const w = canvas.clientWidth || canvas.parentElement.clientWidth;
    canvas.width = w * dpr;
    canvas.height = 46 * dpr;
    ctx.scale(dpr, dpr);
    draw(w);
  }

  function draw(w) {
    const h = 46;
    const points = 40;
    ctx.clearRect(0, 0, w, h);

    const grad = ctx.createLinearGradient(0, 0, w, 0);
    grad.addColorStop(0, '#00d2ff');
    grad.addColorStop(1, '#b026ff');

    ctx.beginPath();
    for (let i = 0; i < points; i++) {
      const x = (i / (points - 1)) * w;
      const y = h / 2 + Math.sin(i * 0.9) * (h * 0.28) * Math.random() * 0.9 + Math.cos(i * 0.4) * 4;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.strokeStyle = grad;
    ctx.lineWidth = 1.6;
    ctx.lineJoin = 'round';
    ctx.stroke();
  }

  resize();
  window.addEventListener('resize', resize);
}
