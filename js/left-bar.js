/**
 * Left sidebar — nav switching, new chat, usage bar animation on mount.
 */
export function init() {
  const root = document.getElementById('left-bar');
  if (!root) return;

  const navItems = root.querySelectorAll('.nav-item');
  navItems.forEach((btn) => {
    btn.addEventListener('click', () => {
      navItems.forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      document.dispatchEvent(new CustomEvent('jt:navigate', { detail: btn.dataset.nav }));
    });
  });

  root.querySelector('#newChatBtn')?.addEventListener('click', () => {
    document.dispatchEvent(new CustomEvent('jt:new-chat'));
  });

  root.querySelector('#profileBtn')?.addEventListener('click', () => {
    document.dispatchEvent(new CustomEvent('jt:toggle-right-bar'));
  });

  // Animate the usage fill in from 0 for a bit of life on load.
  const fill = root.querySelector('#usageFill');
  if (fill) {
    const target = fill.style.width;
    fill.style.width = '0%';
    requestAnimationFrame(() => requestAnimationFrame(() => { fill.style.width = target; }));
  }
}
