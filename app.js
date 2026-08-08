/**
 * app.js — JOHNNY TEC AI Assistant orchestrator.
 *
 * Boot sequence:
 *   1. Fetch + inject the loading screen, run its progress animation.
 *   2. In parallel, fetch + inject every other component's HTML.
 *   3. Once all HTML is in the DOM, dynamically import + init() each
 *      component's JS module (so querySelector calls inside init()
 *      never race against missing markup).
 *   4. Reveal the app shell and fade out the loading screen.
 *
 * Adding a new component later: add one entry to COMPONENTS below.
 */

const COMPONENTS = [
  { name: 'left-bar', mount: '#left-bar', js: './js/left-bar.js' },
  { name: 'main-screen', mount: '#main-screen', js: './js/main-screen.js' },
  { name: 'right-bar', mount: '#right-bar', js: './js/right-bar.js' },
  { name: 'voice-visualizer', mount: '#voice-visualizer', js: './js/voice-visualizer.js' },
];

// JS-only modules that don't own a mounted HTML fragment.
const SCRIPT_ONLY_MODULES = ['./js/easter-egg.js'];

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
        mod.init?.();
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
  const scrim = document.createElement('div');
  scrim.className = 'sidebar-scrim';
  document.getElementById('app-shell').appendChild(scrim);

  const syncScrim = () => {
    const open = leftBar?.classList.contains('is-open') || rightBar?.classList.contains('is-open');
    scrim.classList.toggle('is-visible', !!open);
  };

  document.addEventListener('jt:toggle-left-bar', () => {
    leftBar?.classList.toggle('is-open');
    syncScrim();
  });
  document.addEventListener('jt:toggle-right-bar', syncScrim);

  scrim.addEventListener('click', () => {
    leftBar?.classList.remove('is-open');
    rightBar?.classList.remove('is-open');
    syncScrim();
  });

  document.addEventListener('jt:navigate', (e) => {
    if (e.detail === 'voice') {
      document.dispatchEvent(new CustomEvent('jt:open-voice'));
    }
    leftBar?.classList.remove('is-open');
    syncScrim();
  });
}

function revealApp() {
  const shell = document.getElementById('app-shell');
  const loadingMount = document.getElementById('loading-screen');

  shell.hidden = false;
  requestAnimationFrame(() => {
    loadingMount.classList.add('hide');
  });

  setTimeout(() => {
    loadingMount.remove();
  }, 500);
}

boot();
