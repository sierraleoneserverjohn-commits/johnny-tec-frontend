// js/avatar.js

export function initAvatar() {
  const avatarBtn = document.getElementById('brandAvatarBtn');
  const face = document.getElementById('aiFaceMini');

  if (!avatarBtn || !face) {
    console.warn("JOHNNY TEC AI: Avatar elements not found in the DOM.");
    return;
  }

  // 30 Unique 3D Expressions
  const expressions = [
    'normal', 'happy', 'winking', 'surprised', 'thinking', 
    'excited', 'sad', 'angry', 'sleepy', 'dizzy', 
    'shocked', 'neutral', 'skeptical', 'laughing', 'focused',
    'pleading', 'annoyed', 'smug', 'curious', 'scared',
    'zen', 'mischievous', 'loading', 'glitch', 'aww',
    'exhausted', 'cheeky', 'proud', 'shifty', 'in_love'
  ];

  // Track the current expression index
  let currentIndex = 0;

  avatarBtn.addEventListener('click', (e) => {
    e.preventDefault();
    
    // Remove current expression class
    face.classList.remove(expressions[currentIndex]);
    
    // Increment index, loop back to 0 if we hit 30
    currentIndex = (currentIndex + 1) % expressions.length;
    
    // Add the new expression class
    face.classList.add(expressions[currentIndex]);
  });
}
