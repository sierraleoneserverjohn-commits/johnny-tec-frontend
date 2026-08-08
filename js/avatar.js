/**
 * Isolated Avatar Interaction Handler
 */
export function initAvatar() {
  const container = document.getElementById('avatarContainer');
  
  // Render html dynamically if empty
  if (container && !container.innerHTML.trim()) {
    container.innerHTML = `
      <div class="brand-ring" id="brandAvatarBtn" role="button" aria-label="Tap to change expression" tabindex="0">
        <div class="ai-face-mini normal" id="aiFaceMini">
          <div class="ai-eyes-mini">
            <div class="ai-eye-mini left"></div>
            <div class="ai-eye-mini right"></div>
          </div>
          <div class="ai-mouth-mini"></div>
        </div>
      </div>
    `;
  }

  const brandAvatarBtn = document.getElementById('brandAvatarBtn');
  const aiFaceMini = document.getElementById('aiFaceMini');
  
  if (!brandAvatarBtn || !aiFaceMini) return;

  const expressions = ['normal', 'happy', 'winking', 'surprised', 'thinking', 'excited', 'sad', 'angry', 'sleepy', 'dizzy'];
  let currentIndex = 0;
  let autoExpressionTimer = null;

  brandAvatarBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    
    brandAvatarBtn.style.transform = 'scale(0.92)';
    setTimeout(() => { brandAvatarBtn.style.transform = 'scale(1)'; }, 150);

    if (autoExpressionTimer) {
      clearInterval(autoExpressionTimer);
      autoExpressionTimer = null;
      aiFaceMini.className = 'ai-face-mini normal';
      currentIndex = 0;
    } else {
      currentIndex = 1;
      aiFaceMini.className = `ai-face-mini ${expressions[currentIndex]}`;
      autoExpressionTimer = setInterval(() => {
        currentIndex = (currentIndex + 1) % expressions.length;
        aiFaceMini.className = `ai-face-mini ${expressions[currentIndex]}`;
      }, 1800);
    }
  });
}
