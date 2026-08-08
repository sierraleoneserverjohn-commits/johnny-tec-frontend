/**
 * js/left-bar.js — Handles left sidebar navigation and drawer events
 */

export function init() {
  const navList = document.getElementById('navList');
  const newChatBtn = document.getElementById('newChatBtn');
  const upgradeBtn = document.getElementById('upgradeBtn');
  const profileBtn = document.getElementById('profileBtn');

  // 1. Handle Navigation Menu Clicks (.nav-item buttons using data-nav)
  if (navList) {
    const items = navList.querySelectorAll('.nav-item');
    items.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Update active highlight
        items.forEach((item) => item.classList.remove('is-active'));
        btn.classList.add('is-active');

        // Grab destination (e.g. "image", "code", "dashboard", "voice")
        const navTarget = btn.dataset.nav;

        // Tell app.js to switch views or open voice visualizer
        if (navTarget) {
          document.dispatchEvent(new CustomEvent('jt:nav-change', { detail: navTarget }));
        }
      });
    });
  }

  // 2. New Chat Button: Resets highlight to "AI Chat" and switches view
  newChatBtn?.addEventListener('click', () => {
    if (navList) {
      navList.querySelectorAll('.nav-item').forEach((item) => item.classList.remove('is-active'));
      const chatBtn = navList.querySelector('[data-nav="chat"]');
      chatBtn?.classList.add('is-active');
    }
    document.dispatchEvent(new CustomEvent('jt:nav-change', { detail: 'chat' }));
  });

  // 3. Upgrade Button
  upgradeBtn?.addEventListener('click', () => {
    document.dispatchEvent(new CustomEvent('jt:open-upgrade'));
  });

  // 4. Profile Button: Opens the Right Sidebar Settings Drawer
  profileBtn?.addEventListener('click', () => {
    document.dispatchEvent(new CustomEvent('jt:toggle-right-bar'));
  });
}
