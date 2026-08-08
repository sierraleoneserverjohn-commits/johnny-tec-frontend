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
// Add this to the bottom of js/left-bar.js
window.addEventListener('jt-api-offline', () => {
    const statusIndicator = document.querySelector('.status-indicator');
    const statusText = document.querySelector('.status-header h4');
    if (statusIndicator && statusText) {
        statusIndicator.style.backgroundColor = '#ff2a2a'; // Neon Red
        statusIndicator.style.boxShadow = '0 0 8px #ff2a2a';
        statusText.textContent = "JT API: OFFLINE";
    }
});
// Open Left bar Js
const sidebarVoiceBtn = document.getElementById('YOUR_SIDEBAR_VOICE_BUTTON_ID'); // Change to your actual ID

if (sidebarVoiceBtn) {
  sidebarVoiceBtn.addEventListener('click', (e) => {
    e.preventDefault();
    // Navigate to the voice visualizer page
    // If you are using iframes, use window.parent.location.href instead
    window.location.href = 'voice_visualizer.html';
  });
}


