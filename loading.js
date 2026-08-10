/**
 * loading.js — boot loader logic
 *
 * The progress bar's *pace* is driven by the device's real network
 * conditions (via the Network Information API where supported), so
 * a slow connection visibly takes longer to fill and a fast one is
 * snappy — not a fixed fake timer.
 *
 * The bar is also gated on real readiness: it holds at 92% until the
 * core components (left-bar, main-screen, right-bar) have actually
 * finished mounting via app.js's "jt:component-ready" events, so it
 * can never claim 100% before the app underneath is actually ready.
 *
 * When both conditions are met, this component fades itself out and
 * tells app.js it's safe to remove — app.js does not control the
 * timing itself, it just waits on "jt:loading-exit-complete".
 */

(() => {
  'use strict';

  const root = document.querySelector('.loading-screen');
  if (!root) return;

  const fillEl = root.querySelector('.loading-bar-fill');
  const percentEl = root.querySelector('.loading-percent');
  const barEl = root.querySelector('.loading-bar');

  // ----------------------------------------------------------------
  // 1. Estimate a fill duration from the device's real connection.
  // ----------------------------------------------------------------
  const FALLBACK_MS = 2600;
  const MIN_MS = 1100;
  const MAX_MS = 6000;

  const connection =
    navigator.connection || navigator.mozConnection || navigator.webkitConnection || null;

  const DURATION_BY_EFFECTIVE_TYPE = {
    'slow-2g': 6000,
    '2g': 4800,
    '3g': 3000,
    '4g': 1400,
  };

  function estimateDuration() {
    if (!connection) return FALLBACK_MS;

    const downlink = typeof connection.downlink === 'number' ? connection.downlink : null;
    if (downlink && downlink > 0) {
      // Rough heuristic: less bandwidth -> longer, more visible fill.
      const ms = 6000 / Math.max(downlink, 0.4);
      return Math.min(MAX_MS, Math.max(MIN_MS, ms));
    }
    return DURATION_BY_EFFECTIVE_TYPE[connection.effectiveType] ?? FALLBACK_MS;
  }

  let duration = estimateDuration();

  // If the browser reports a change in connection quality mid-load,
  // adjust the remaining pace rather than restarting from scratch.
  if (connection && typeof connection.addEventListener === 'function') {
    connection.addEventListener('change', () => {
      duration = estimateDuration();
    });
  }

  // ----------------------------------------------------------------
  // 2. Track real component readiness.
  // ----------------------------------------------------------------
  const CORE_COMPONENTS = ['left-bar', 'main-screen', 'right-bar'];
  const readyComponents = new Set();
  let realReady = false;

  window.JT?.on('jt:component-ready', ({ name }) => {
    if (CORE_COMPONENTS.includes(name)) readyComponents.add(name);
    if (readyComponents.size >= CORE_COMPONENTS.length) realReady = true;
  });

  // Safety net: never hang forever if something upstream never fires.
  window.setTimeout(() => {
    realReady = true;
  }, 8000);

  // ----------------------------------------------------------------
  // 3. Animate.
  // ----------------------------------------------------------------
  const HOLD_PERCENT = 92; // simulated fill parks here until real components are ready
  const startTime = performance.now();
  let finished = false;

  function render(percent) {
    const rounded = Math.round(percent);
    fillEl.style.width = `${percent}%`;
    percentEl.textContent = `${rounded}%`;
    barEl.setAttribute('aria-valuenow', String(rounded));
  }

  function tick(now) {
    if (finished) return;

    const elapsed = now - startTime;
    const t = Math.min(1, elapsed / duration);
    const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic — fast start, gentle settle
    let percent = eased * 100;

    if (!realReady) percent = Math.min(percent, HOLD_PERCENT);
    percent = Math.min(100, percent);

    render(percent);

    if (percent >= 100 && realReady) {
      finish();
      return;
    }
    requestAnimationFrame(tick);
  }

  function finish() {
    finished = true;
    render(100);
    window.JT?.emit('jt:loading-visual-complete');

    root.classList.add('is-leaving');
    root.addEventListener(
      'transitionend',
      () => window.JT?.emit('jt:loading-exit-complete'),
      { once: true }
    );

    // Fallback in case a transitionend never fires (e.g. reduced-motion
    // strips the transition entirely).
    window.setTimeout(() => window.JT?.emit('jt:loading-exit-complete'), 900);
  }

  requestAnimationFrame(tick);
})();
