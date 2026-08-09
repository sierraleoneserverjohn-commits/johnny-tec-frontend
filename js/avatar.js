document.addEventListener('DOMContentLoaded', () => {
  const avatarBtn = document.getElementById('brandAvatarBtn');
  const face = document.getElementById('aiFaceMini');

  if (!avatarBtn || !face) return;

  // 30 Unique Expressions
  const expressions = [
    'normal', 'happy', 'winking', 'surprised', 'thinking', 
    'excited', 'sad', 'angry', 'sleepy', 'dizzy', 
    'shocked', 'neutral', 'skeptical', 'laughing', 'focused',
    'pleading', 'annoyed', 'smug', 'curious', 'scared',
    'zen', 'mischievous', 'loading', 'glitch', 'aww',
    'exhausted', 'cheeky', 'proud', 'shifty', 'in_love'
  ];

  let currentIndex = 0;

  avatarBtn.addEventListener('click', (e) => {
    e.preventDefault();
    
    // Remove current expression
    face.classList.remove(expressions[currentIndex]);
    
    // Increment and loop back to 0 if at the end
    currentIndex = (currentIndex + 1) % expressions.length;
    
    // Add the new expression
    face.classList.add(expressions[currentIndex]);
  });
});
