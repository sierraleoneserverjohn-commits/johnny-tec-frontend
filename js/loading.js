/**
 * Loading module — animates the boot progress bar.
 * Exposes init() which resolves once the animated fill hits 100%,
 * so app.js can await it before revealing the app shell.
 */
export function init() {
  return new Promise((resolve) => {
    const fill = document.getElementById('loadingBarFill');
    const percentLabel = document.getElementById('loadingPercent');
    const track = document.querySelector('.loading-bar-track');

    if (!fill || !percentLabel) { resolve(); return; }

    let pct = 0;
    // Uneven increments feel more "alive" than a linear tween.
    const step = () => {
      pct += Math.random() * 14 + 6;
      if (pct >= 100) pct = 100;

      fill.style.width = pct + '%';
      percentLabel.textContent = Math.round(pct) + '%';
      track?.setAttribute('aria-valuenow', String(Math.round(pct)));

      if (pct < 100) {
        setTimeout(step, 140 + Math.random() * 160);
      } else {
        setTimeout(resolve, 260);
      }
    };
    step();
  });
}
