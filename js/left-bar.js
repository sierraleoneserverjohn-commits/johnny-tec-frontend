/**
 * left-bar.js — primary navigation sidebar logic
 *
 * Handles: New Chat, nav item switching (emits "jt:navigate" so other
 * components can react — main-screen currently shows a placeholder for
 * modules that don't have their own page yet), the Recent list, and
 * mobile open/close (main-screen's hamburger emits "jt:toggle-left-bar").
 */

(() => {
  'use strict';

  const root = document.querySelector('.left-bar');
  if (!root) return;

  // The mobile show/hide transform (see global.css) lives on the outer
  // mount wrapper, not this inner element — .is-open toggles there.
  const mountEl = document.getElementById('mount-left-bar') || root;

  // ==================================================================
  // 1. New Chat
  // ==================================================================
  root.querySelector('#lbNewChatBtn')?.addEventListener('click', () => {
    window.JT?.emit('jt:new-chat');
    setActiveNav('chat');
    closeMobile();
  });

  // ==================================================================
  // 2. Nav — Chat / Voice & Audio / Image Generator / Security Recon
  // ==================================================================
  const navItems = Array.from(root.querySelectorAll('.lb-nav-item'));

  function setActiveNav(view) {
    navItems.forEach((item) => {
      const isActive = item.dataset.view === view;
      item.classList.toggle('is-active', isActive);
      if (isActive) item.setAttribute('aria-current', 'page');
      else item.removeAttribute('aria-current');
    });
  }

  navItems.forEach((item) => {
    item.addEventListener('click', () => {
      setActiveNav(item.dataset.view);
      window.JT?.emit('jt:navigate', { view: item.dataset.view, label: item.querySelector('.lb-nav-label')?.textContent });
      closeMobile();
    });
  });

  // ==================================================================
  // 3. Recent — demo data until conversation history is persisted
  // ==================================================================
  const RECENT_DEMO = [
    { title: 'Fix login authentication bug', time: '2h ago' },
    { title: 'Cyberpunk city skyline, neon', time: '5h ago' },
    { title: 'Recon scan — staging.example.com', time: '1d ago' },
    { title: 'Voice memo transcript cleanup', time: '2d ago' },
    { title: 'Explain vector databases', time: '3d ago' },
  ];

  const recentListEl = root.querySelector('#lbRecentList');

  function renderRecent(items) {
    recentListEl.innerHTML = '';
    if (!items.length) {
      recentListEl.innerHTML = '<p class="lb-recent-empty">No recent activity yet.</p>';
      return;
    }
    items.forEach((entry) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'lb-recent-item';
      btn.innerHTML = `
        <span class="lb-recent-item-title">${entry.title}</span>
        <span class="lb-recent-item-time">${entry.time}</span>
      `;
      btn.addEventListener('click', () => {
        window.JT?.emit('jt:load-conversation', entry);
        closeMobile();
      });
      recentListEl.appendChild(btn);
    });
  }

  renderRecent(RECENT_DEMO);

  // ==================================================================
  // 4. Mobile open/close — hamburger in main-screen emits jt:toggle-left-bar
  // ==================================================================
  let scrimEl = null;

  function isMobileLayout() {
    return window.matchMedia('(max-width: 1024px)').matches;
  }

  function openMobile() {
    mountEl.classList.add('is-open');
    if (!scrimEl) {
      scrimEl = document.createElement('div');
      scrimEl.className = 'lb-scrim';
      Object.assign(scrimEl.style, {
        position: 'fixed', inset: '0', zIndex: '39',
        background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)',
      });
      scrimEl.addEventListener('click', closeMobile);
      document.body.appendChild(scrimEl);
    }
    document.addEventListener('keydown', onEscape);
  }

  function closeMobile() {
    mountEl.classList.remove('is-open');
    scrimEl?.remove();
    scrimEl = null;
    document.removeEventListener('keydown', onEscape);
  }

  function onEscape(e) {
    if (e.key === 'Escape') closeMobile();
  }

  window.JT?.on('jt:toggle-left-bar', () => {
    if (!isMobileLayout()) return; // desktop: sidebar is always visible, nothing to toggle
    if (mountEl.classList.contains('is-open')) closeMobile();
    else openMobile();
  });

  root.querySelector('#lbCloseBtn')?.addEventListener('click', closeMobile);
})();
