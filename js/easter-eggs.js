/**
 * Easter Egg — tap the JT logo ring 5 times within 2s to trigger a
 * hidden glitch burst + secret message. Self-contained: injects its
 * own minimal styles/particles, no markup file needed.
 *
 * Change the trigger or payload here without touching any other module.
 */

const TAP_TARGET = 5;
const TAP_WINDOW_MS = 2000;

export function init() {
  const logo = document.querySelector('.brand-ring');
  if (!logo) return;

  let taps = 0;
  let resetTimer = null;

  logo.style.cursor = 'pointer';
  logo.addEventListener('click', () => {
    taps += 1;
    clearTimeout(resetTimer);
    resetTimer = setTimeout(() => { taps = 0; }, TAP_WINDOW_MS);

    if (taps >= TAP_TARGET) {
      taps = 0;
      trigger();
    }
  });
}

function trigger() {
  const shell = document.getElementById('app-shell') || document.body;

  const glitch = document.createElement('div');
  glitch.className = 'jt-easter-glitch';
  glitch.innerHTML = `<span>SYSTEM UNLOCKED 🔓 — Johnny Tec.Dev says hi.</span>`;
  shell.appendChild(glitch);

  spawnParticles(shell, 24);

  requestAnimationFrame(() => glitch.classList.add('is-visible'));
  setTimeout(() => {
    glitch.classList.remove('is-visible');
    setTimeout(() => glitch.remove(), 400);
  }, 2200);
}

function spawnParticles(container, count) {
  const colors = ['#00d2ff', '#b026ff'];
  for (let i = 0; i < count; i++) {
    const p = document.createElement('span');
    p.className = 'jt-easter-particle';
    p.style.left = 50 + (Math.random() * 40 - 20) + '%';
    p.style.top = '18%';
    p.style.background = colors[i % 2];
    p.style.setProperty('--dx', (Math.random() * 200 - 100) + 'px');
    p.style.setProperty('--dy', (Math.random() * 260 + 80) + 'px');
    p.style.setProperty('--rot', (Math.random() * 360) + 'deg');
    p.style.animationDelay = (Math.random() * 120) + 'ms';
    container.appendChild(p);
    setTimeout(() => p.remove(), 1600);
  }
}

// Inject the small amount of CSS this feature needs, so no separate
// stylesheet has to be wired into index.html for one hidden feature.
const style = document.createElement('style');
style.textContent = `
  .jt-easter-glitch {
    position: absolute; left: 50%; top: 14%;
    transform: translate(-50%, -6px);
    z-index: 400;
    padding: 10px 16px;
    border-radius: 999px;
    background: rgba(14,14,38,0.9);
    border: 1px solid rgba(0,210,255,0.4);
    color: #eef0fb;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.04em;
    white-space: nowrap;
    opacity: 0;
    transition: opacity 300ms ease, transform 300ms ease;
    box-shadow: 0 0 24px rgba(0,210,255,0.35);
  }
  .jt-easter-glitch.is-visible { opacity: 1; transform: translate(-50%, 0); }
  .jt-easter-particle {
    position: absolute;
    width: 6px; height: 6px;
    border-radius: 2px;
    z-index: 399;
    animation: jt-particle-fly 1.3s ease-out forwards;
  }
  @keyframes jt-particle-fly {
    to {
      transform: translate(var(--dx), var(--dy)) rotate(var(--rot));
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);
             
