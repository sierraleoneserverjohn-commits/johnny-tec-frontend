/**
 * app.js — JOHNNY TEC AI Assistant orchestrator
 *
 * Responsibilities:
 *   1. Define the component registry (where each component's HTML/CSS/JS lives).
 *   2. Fetch + inject each component's HTML into its mount point.
 *   3. Lazy-load that component's CSS and JS once its HTML is in the DOM.
 *   4. Provide a tiny pub/sub event bus (window.JT) so components can talk
 *      to each other without importing one another directly — keeps the
 *      "every component is its own HTML/CSS/JS file" rule intact.
 *
 * Nothing in here knows about any component's internal markup or styling.
 * Component JS files are responsible for their own DOM wiring; they should
 * listen for the "jt:component-ready" event (or just run on load, since
 * they're only injected once their HTML exists) rather than assuming
 * anything about load order beyond what's declared below.
 */

(() => {
  'use strict';

  // ----------------------------------------------------------------
  // 1. Tiny global event bus — cross-component communication only.
  //    Components should never reach into each other's DOM directly.
  // ----------------------------------------------------------------
  const listeners = new Map();

  window.JT = {
    on(event, handler) {
      if (!listeners.has(event)) listeners.set(event, new Set());
      listeners.get(event).add(handler);
      return () => listeners.get(event)?.delete(handler);
    },
    emit(event, detail) {
      listeners.get(event)?.forEach((handler) => {
        try {
          handler(detail);
        } catch (err) {
          console.error(`[JT] listener for "${event}" threw:`, err);
        }
      });
      // Also dispatch as a DOM event so components can use addEventListener
      // on document if they prefer that style.
      document.dispatchEvent(new CustomEvent(event, { detail }));
    },
  };

  // ----------------------------------------------------------------
  // 2. Component registry
  //    "core" components load immediately and block the loading screen.
  //    "deferred" components (voice visualizer) load in the background
  //    after the core shell is visible, since they're opened on demand.
  // ----------------------------------------------------------------
  const COMPONENTS = {
    loading: {
      mount: '#mount-loading',
      html: 'components/loading.html',
      css: 'css/loading.css',
      js: 'js/loading.js',
      core: true,
    },
    'left-bar': {
      mount: '#mount-left-bar',
      html: 'components/left-bar.html',
      css: 'css/left-bar.css',
      js: 'js/left-bar.js',
      core: true,
    },
    'main-screen': {
      mount: '#mount-main-screen',
      html: 'components/main-screen.html',
      css: 'css/main-screen.css',
      js: 'js/main-screen.js',
      core: true,
    },
    'right-bar': {
      mount: '#mount-right-bar',
      html: 'components/right-bar.html',
      css: 'css/right-bar.css',
      js: 'js/right-bar.js',
      core: true,
    },
    'voice-visualizer': {
      mount: '#mount-voice-visualizer',
      html: 'components/voice-visualizer.html',
      css: 'css/voice-visualizer.css',
      js: 'js/voice-visualization.js',
      core: false,
    },
  };

  const loadedCss = new Set();
  const loadedJs = new Set();

  // ----------------------------------------------------------------
  // 3. Loaders
  // ----------------------------------------------------------------
  function loadCss(href) {
    if (loadedCss.has(href)) return;
    loadedCss.add(href);
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }

  function loadJs(src) {
    if (loadedJs.has(src)) return Promise.resolve();
    loadedJs.add(src);
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.body.appendChild(script);
    });
  }

  async function mountComponent(name) {
    const config = COMPONENTS[name];
    if (!config) {
      console.error(`[JT] Unknown component "${name}"`);
      return;
    }

    const mountEl = document.querySelector(config.mount);
    if (!mountEl) {
      console.error(`[JT] No mount point "${config.mount}" for component "${name}"`);
      return;
    }

    try {
      const res = await fetch(config.html);
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      mountEl.innerHTML = await res.text();

      loadCss(config.css);
      await loadJs(config.js);

      window.JT.emit('jt:component-ready', { name });
    } catch (err) {
      console.error(`[JT] Failed to mount component "${name}":`, err);
      window.JT.emit('jt:component-error', { name, error: err });
    }
  }

  // ----------------------------------------------------------------
  // 4. Boot sequence
  // ----------------------------------------------------------------
  async function boot() {
    // Loading screen first and on its own, so it's visible immediately
    // while the rest of the shell is still being fetched.
    await mountComponent('loading');
    window.JT.emit('jt:boot-start');

    const coreNames = Object.keys(COMPONENTS).filter((name) => COMPONENTS[name].core && name !== 'loading');

    await Promise.all(coreNames.map(mountComponent));

    // Reveal the shell underneath the loading screen (still on top, z-index
    // 100) and let the loading component's own JS decide when it's actually
    // safe to fade out — it paces itself off real network speed and gates
    // on these same "jt:component-ready" events, so it knows best.
    const appShell = document.getElementById('app-shell');
    const loadingMount = document.getElementById('mount-loading');
    appShell.hidden = false;
    window.JT.emit('jt:boot-complete');

    window.JT.on('jt:loading-exit-complete', () => {
      loadingMount.hidden = true;
      loadingMount.innerHTML = '';
    });

    // Deferred components (things opened on demand, like the voice
    // visualizer overlay) load quietly in the background afterward.
    const deferredNames = Object.keys(COMPONENTS).filter((name) => !COMPONENTS[name].core);
    deferredNames.forEach(mountComponent);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
      
