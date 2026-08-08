/**
 * Left sidebar — nav switching, new chat, usage bar animation, and interactive AI avatar.
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

  // Interactive AI Avatar Expression Cycler
  const avatarBtn = root.querySelector('#aiAvatarBtn');
  const aiFace = root.querySelector('#aiFace');
  const statusText = root.querySelector('#aiStatusText');
  
  if (avatarBtn && aiFace) {
    const expressions = [
      { name: 'normal', label: 'Building Digital Excellence' },
      { name: 'happy', label: 'Feeling awesome! 😊' },
      { name: 'surprised', label: 'Whoa, check that out! 😮' },
      { name: 'thinking', label: 'Processing code... 🤔' },
      { name: 'sleepy', label: 'Low power mode... 😴' }
    ];
    
    let currentIndex = 0;

    avatarBtn.addEventListener('click', () => {
      currentIndex = (currentIndex + 1) % expressions.length;
      const current = expressions[currentIndex];

      // Remove all expression classes and add the new one
      aiFace.className = `ai-face ${current.name}`;

      // Update subtitle status text dynamically
      if (statusText) {
        statusText.textContent = current.label;
      }

      // Optional feedback event dispatch
      document.dispatchEvent(new CustomEvent('jt:ai-expression', { detail: current.name }));
    });
  }

  // Animate the usage fill in from 0 for a bit of life on load.
  const fill = root.querySelector('#usageFill');
  if (fill) {
    const target = fill.style.width;
    fill.style.width = '0%';
    requestAnimationFrame(() => requestAnimationFrame(() => { fill.style.width = target; }));
  }
      }
  
