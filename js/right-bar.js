// js/right-bar.js

// Initialize global state for the AI model
window.currentAIModel = 'gpt-4.1';

export function init() {
  const root = document.getElementById('right-bar');
  if (!root) return;

  // Handle Model Switching
  const models = root.querySelectorAll('.rb-model');
  models.forEach((item) => {
    item.addEventListener('click', () => {
      // 1. Reset all models to unselected state (swap check for chevron)
      models.forEach((m) => {
        m.classList.remove('is-active');
        const checkIcon = m.querySelector('.model-check');
        if (checkIcon) {
          checkIcon.outerHTML = `<svg class="nav-chevron" viewBox="0 0 24 24"><path d="m9 6 6 6-6 6"/></svg>`;
        }
      });

      // 2. Set the clicked model to active
      item.classList.add('is-active');
      
      // 3. Swap chevron for checkmark on the selected model
      const chevron = item.querySelector('.nav-chevron');
      if (chevron) {
        chevron.outerHTML = `<svg class="model-check" viewBox="0 0 24 24"><path d="m5 13 4 4L19 7"/></svg>`;
      } else if (!item.querySelector('.model-check')) {
        item.insertAdjacentHTML('beforeend', `<svg class="model-check" viewBox="0 0 24 24"><path d="m5 13 4 4L19 7"/></svg>`);
      }

      // 4. Update system with new choice
      window.currentAIModel = item.dataset.model;
      console.log("Model switched to:", window.currentAIModel);
      document.dispatchEvent(new CustomEvent('jt:model-change', { detail: window.currentAIModel }));
    });
  });

  // Handle Closing Right Bar
  root.querySelector('#rightBarClose')?.addEventListener('click', () => {
    root.classList.remove('is-open');
  });

  // Handle Opening Right Bar via the 3-dots top nav event
  document.addEventListener('jt:toggle-right-bar', () => {
    root.classList.toggle('is-open');
  });

  // Draw the cool sparkline chart
  drawSparkline(root.querySelector('#statusSpark'));
}

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
