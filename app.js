/**
 * app.js — JOHNNY TEC AI Assistant orchestrator.
 *
 * Boot sequence:
 *   1. Fetch + inject the loading screen, run its progress animation.
 *   2. In parallel, fetch + inject every other component's HTML.
 *   3. Once all HTML is in the DOM, dynamically import + init() each
 *      component's JS module.
 *   4. Reveal the app shell and fade out the loading screen.
 */

const COMPONENTS = [
  { name: 'left-bar', mount: '#left-bar', js: './js/left-bar.js' },
  { name: 'main-screen', mount: '#main-screen', js: './js/main-screen.js' },
  { name: 'right-bar', mount: '#right-bar', js: './js/right-bar.js' },
  { name: 'voice-visualizer', mount: '#voice-visualizer', js: './js/voice-visualizer.js' },
];

const SCRIPT_ONLY_MODULES = [
  './js/easter-egg.js',
  './js/avatar.js'
];

async function fetchHtml(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
  return res.text();
}

async function boot() {
  // 1. Loading screen: inject markup, then run its own progress animation.
  const loadingMount = document.getElementById('loading-screen');
  try {
    loadingMount.innerHTML = await fetchHtml('./components/loading.html');
  } catch (err) {
    console.error(err);
  }
  const loadingModule = await import('./js/loading.js').catch(() => null);
  const loadingDone = loadingModule?.init ? loadingModule.init() : Promise.resolve();

  // 2. Fetch + inject every other component's HTML in parallel.
  await Promise.all(
    COMPONENTS.map(async ({ mount, name }) => {
      const el = document.querySelector(mount);
      if (!el) return;
      try {
        el.innerHTML = await fetchHtml(`./components/${name}.html`);
      } catch (err) {
        console.error(err);
        el.innerHTML = `<div class="load-error">Couldn't load ${name}.</div>`;
      }
    })
  );

  // 3. Now that all markup exists, safely init every component's JS.
  await Promise.all(
    [...COMPONENTS.map((c) => c.js), ...SCRIPT_ONLY_MODULES].map(async (js) => {
      try {
        const mod = await import(js);
        
        // SMART INIT: Looks for init(), initLeftBar(), initRightBar(), or initAvatar()
        if (typeof mod.init === 'function') {
          mod.init();
        } else {
          // Finds any exported function that starts with 'init' and runs it
          const initFn = Object.keys(mod).find(key => key.startsWith('init') && typeof mod[key] === 'function');
          if (initFn) mod[initFn]();
        }
      } catch (err) {
        console.error(`Failed to init ${js}`, err);
      }
    })
  );

  wireGlobalEvents();

  // 4. Reveal the shell once both the fake progress bar and real fetches finish.
  await loadingDone;
  revealApp();
}

function wireGlobalEvents() {
  const leftBar = document.getElementById('left-bar');
  const rightBar = document.getElementById('right-bar');
  
  // Create or select scrim backdrop
  let scrim = document.querySelector('.sidebar-scrim');
  if (!scrim) {
    scrim = document.createElement('div');
    scrim.className = 'sidebar-scrim';
    document.getElementById('app-shell')?.appendChild(scrim);
  }

  const syncScrim = () => {
    const open = leftBar?.classList.contains('is-open') || rightBar?.classList.contains('is-open');
    scrim.classList.toggle('is-visible', !!open);
  };

  // Toggle Left Sidebar
  document.addEventListener('jt:toggle-left-bar', () => {
    leftBar?.classList.toggle('is-open');
    rightBar?.classList.remove('is-open'); // Close right bar if open
    syncScrim();
  });
  
  // FIXED: Toggle Right Sidebar
  document.addEventListener('jt:toggle-right-bar', () => {
    rightBar?.classList.toggle('is-open');
    leftBar?.classList.remove('is-open'); // Close left bar if open
    syncScrim();
  });

  // Tap background backdrop to close both sidebars
  scrim.addEventListener('click', () => {
    leftBar?.classList.remove('is-open');
    rightBar?.classList.remove('is-open');
    syncScrim();
  });

  // Handle Menu Navigation Switches
  document.addEventListener('jt:nav-change', (e) => {
    const targetView = e.detail;

    if (targetView === 'voice') {
      document.dispatchEvent(new CustomEvent('jt:open-voice'));
    } else {
      // Forward view change to main-screen listener
      document.dispatchEvent(new CustomEvent('jt:switch-view', { detail: targetView }));
    }

    // Close sidebar on item tap
    leftBar?.classList.remove('is-open');
    syncScrim();
  });
  
  // Fallback listener for older event names
  document.addEventListener('jt:navigate', (e) => {
      document.dispatchEvent(new CustomEvent('jt:nav-change', { detail: e.detail }));
  });
}

function revealApp() {
  const shell = document.getElementById('app-shell');
  const loadingMount = document.getElementById('loading-screen');

  if (shell) shell.hidden = false;
  
  if (loadingMount) {
    requestAnimationFrame(() => {
      loadingMount.classList.add('hide');
    });

    setTimeout(() => {
      loadingMount.remove();
    }, 500);
  }
}
// MASTER UI CONTROLLER - Put this in your main app.js
document.addEventListener('click', (e) => {
  // 1. Right Sidebar (3-Dots Toggle)
  const rightToggle = e.target.closest('#rightBarToggle');
  if (rightToggle) {
    const rightAside = document.querySelector('#right-bar aside, .right-bar, .right-panel');
    if (rightAside) rightAside.classList.toggle('is-open');
    return; // Stop execution after handling
  }

  // 2. Left Sidebar (Menu Toggle)
  const leftToggle = e.target.closest('#menuToggle');
  if (leftToggle) {
    const leftAside = document.querySelector('#left-bar aside, .left-sidebar');
    if (leftAside) leftAside.classList.toggle('is-open');
    return;
  }

  // 3. Close Sidebars when clicking outside (Optional but recommended)
  if (!e.target.closest('#right-bar') && !e.target.closest('#left-bar') && !e.target.closest('aside') && !e.target.closest('button')) {
    document.querySelectorAll('.is-open').forEach(el => el.classList.remove('is-open'));
  }
});

boot();
