// js/avatar.js

// Using event delegation so it works even if the avatar is dynamically mounted by app.js later!
document.addEventListener('click', (e) => {
  // Check if what we clicked is (or is inside) the avatar button
  const avatarBtn = e.target.closest('#brandAvatarBtn');
  
  if (!avatarBtn) return; // If we clicked somewhere else, do nothing
  
  e.preventDefault(); 
  
  const face = document.getElementById('aiFaceMini');
  if (!face) return;

  // The 30 Expressions
  const expressions = [
    'normal', 'happy', 'winking', 'surprised', 'thinking', 
    'excited', 'sad', 'angry', 'sleepy', 'dizzy', 
    'shocked', 'neutral', 'skeptical', 'laughing', 'focused',
    'pleading', 'annoyed', 'smug', 'curious', 'scared',
    'zen', 'mischievous', 'loading', 'glitch', 'aww',
    'exhausted', 'cheeky', 'proud', 'shifty', 'in_love'
  ];

  // Get the current index stored on the element, default to 0
  let currentIndex = parseInt(face.dataset.expressionIndex || 0);
  
  // Remove the old expression class
  face.classList.remove(expressions[currentIndex]);
  
  // Calculate the next expression
  currentIndex = (currentIndex + 1) % expressions.length;
  
  // Add the new expression class
  face.classList.add(expressions[currentIndex]);
  
  // Save the new index back to the element
  face.dataset.expressionIndex = currentIndex;
});
