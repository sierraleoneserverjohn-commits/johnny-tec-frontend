/**
 * js/avatar.js — Interactive Avatar Component
 */
export function initAvatar() {
  const container = document.getElementById('avatarContainer');
  
  if (!container) {
    console.warn('avatarContainer element not found in DOM.');
    return;
  }

  // Inject the avatar markup directly into the container
  container.innerHTML = `
    <div class="avatar-wrapper">
      <div class="avatar-glow"></div>
      <div class="avatar-face" id="avatarFace">
        <svg viewBox="0 0 100 100" class="avatar-svg">
          <defs>
            <linearGradient id="avatarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#00d2ff" />
              <stop offset="100%" stop-color="#b026ff" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="42" fill="url(#avatarGrad)" />
          <circle cx="35" cy="42" r="4" fill="#ffffff" class="eye eye-left" />
          <circle cx="65" cy="42" r="4" fill="#ffffff" class="eye eye-right" />
          <path d="M 36 62 Q 50 72 64 62" stroke="#ffffff" stroke-width="3.5" fill="none" stroke-linecap="round" class="avatar-mouth" />
        </svg>
      </div>
    </div>
  `;
}

// Automatically try initializing if loaded after DOM is ready
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  setTimeout(initAvatar, 50);
}
