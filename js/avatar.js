document.addEventListener('DOMContentLoaded', () => {
  const avatarBtn = document.getElementById('brandAvatarBtn');
  const face = document.getElementById('aiFaceMini');

  if (!avatarBtn || !face) return;

  const expressions = [
    'normal', 'happy', 'winking', 'surprised', 'thinking', 
    'excited', 'sad', 'angry', 'sleepy', 'dizzy', 
    'shocked', 'neutral', 'skeptical', 'laughing', 'focused'
  ];

  let currentIndex = 0;

  avatarBtn.addEventListener('click', (e) => {
    e.preventDefault(); // Stop any default link behavior just in case
    
    // Remove current expression
    face.classList.remove(expressions[currentIndex]);
    
    // Increment and loop back to 0 if at the end
    currentIndex = (currentIndex + 1) % expressions.length;
    
    // Add the new expression
    face.classList.add(expressions[currentIndex]);
  });
});
