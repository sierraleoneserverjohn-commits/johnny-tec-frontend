/**
 * Isolated Left Sidebar Logic
 */
export function initLeftBar() {
  const navList = document.getElementById('navList');
  const newChatBtn = document.getElementById('newChatBtn');
  const upgradeBtn = document.getElementById('upgradeBtn');
  const profileBtn = document.getElementById('profileBtn');

  // Navigation tab click handlers
  if (navList) {
    const items = navList.querySelectorAll('.nav-item');
    items.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        items.forEach((item) => item.classList.remove('is-active'));
        btn.classList.add('is-active');

        const navTarget = btn.dataset.nav;
        document.dispatchEvent(new CustomEvent('jt:nav-change', { detail: navTarget }));
      });
    });
  }

  // Action Buttons
  newChatBtn?.addEventListener('click', () => {
    document.dispatchEvent(new CustomEvent('jt:new-chat'));
  });

  upgradeBtn?.addEventListener('click', () => {
    document.dispatchEvent(new CustomEvent('jt:open-upgrade'));
  });

  profileBtn?.addEventListener('click', () => {
    document.dispatchEvent(new CustomEvent('jt:open-profile'));
  });
}
