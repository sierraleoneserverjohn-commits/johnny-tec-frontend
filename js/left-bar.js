/**
 * Combined Initialization Logic
 */
export function init() {
  
  // ==========================================
  // 1. LEFT SIDEBAR: Avatar Interaction Logic 
  // ==========================================
  const brandAvatarBtn = document.getElementById('brandAvatarBtn');
  const aiFaceMini = document.getElementById('aiFaceMini');
  
  if (brandAvatarBtn && aiFaceMini) {
    const expressions = [
      'normal', 'happy', 'winking', 'surprised', 'thinking', 
      'excited', 'sad', 'angry', 'sleepy', 'dizzy'
    ];
    
    let currentIndex = 0;
    let autoExpressionTimer = null;

    brandAvatarBtn.addEventListener('click', () => {
      // Tiny bounce effect on tap
      brandAvatarBtn.style.transform = 'scale(0.92)';
      setTimeout(() => {
        brandAvatarBtn.style.transform = 'scale(1)';
      }, 150);

      // Toggle Auto-Expression mode
      if (autoExpressionTimer) {
        clearInterval(autoExpressionTimer);
        autoExpressionTimer = null;
        aiFaceMini.className = 'ai-face-mini normal';
        currentIndex = 0;
      } else {
        currentIndex = 1; // Start with the first alternate expression immediately
        aiFaceMini.className = `ai-face-mini ${expressions[currentIndex]}`;
        
        autoExpressionTimer = setInterval(() => {
          currentIndex = (currentIndex + 1) % expressions.length;
          aiFaceMini.className = `ai-face-mini ${expressions[currentIndex]}`;
        }, 1800);
      }
    });
  }

  // ==========================================
  // 2. RIGHT SIDEBAR: Original Logic
  // ==========================================
  const root = document.getElementById('right-bar');
  if (root) {
    const models = root.querySelectorAll('.rb-model');
    models.forEach((item) => {
      item.addEventListener('click', () => {
        models.forEach((m) => {
          m.classList.remove('is-active');
          m.querySelector('.model-check')?.remove();
        });
        item.classList.add('is-active');
        if (!item.querySelector('.model-check')) {
          item.insertAdjacentHTML('beforeend', `<svg class="model-check" viewBox="0 0 24 24"><path d="m5 13 4 4L19 7"/></svg>`);
        }
        document.dispatchEvent(new CustomEvent('jt:model-change', { detail: item.dataset.model }));
      });
    });

    root.querySelector('#rightBarClose')?.addEventListener('click', () => {
      root.classList.remove('is-open');
    });

    drawSparkline(root.querySelector('#statusSpark'));
  }
}

// Global Event Listeners outside of init()
document.addEventListener('jt:toggle-right-bar', () => {
  const root = document.getElementById('right-bar');
  if (root) root.classList.toggle('is-open');
});

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
        
