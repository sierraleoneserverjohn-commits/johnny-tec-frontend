/**
 * profile.js — sidebar identity block logic
 *
 * Just the popover menu for now (Settings / Usage / Sign out are
 * stubs — wire them to the real account/settings backend once it
 * exists; each already emits a distinct "jt:profile-action" event
 * so that hookup is a one-line listener, not a rewrite here).
 */

(() => {
  'use strict';

  const root = document.querySelector('.profile-block');
  if (!root) return;

  const btn = root.querySelector('#profileBtn');
  const menu = root.querySelector('#profileMenu');
  if (!btn || !menu) return;

  function close() {
    menu.hidden = true;
    btn.setAttribute('aria-expanded', 'false');
  }
  function open() {
    menu.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
  }

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (menu.hidden) open(); else close();
  });
  menu.addEventListener('click', (e) => e.stopPropagation());
  document.addEventListener('click', close);

  menu.querySelectorAll('[role="menuitem"]').forEach((item) => {
    item.addEventListener('click', () => {
      window.JT?.emit('jt:profile-action', { action: item.dataset.action });
      close();
    });
  });
})();

