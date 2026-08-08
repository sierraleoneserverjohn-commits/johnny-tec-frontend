document.addEventListener('DOMContentLoaded', () => {
  const avatarBtn = document.getElementById('brandAvatarBtn');
  const face = document.getElementById('aiFaceMini');

  if (!avatarBtn || !face) return;

  // The 15 expressions defined in the CSS
  const expressions = [
    'normal', 
    'happy', 
    'winking', 
    'surprised', 
    'thinking', 
    'excited', 
    'sad', 
    'angry', 
    'sleepy', 
    'dizzy', 
    'shocked', 
    'suspicious', 
    'relieved', 
    'determined', 
    'laughing'
  ];

  let currentIndex = 0;

  avatarBtn.addEventListener('click', (e) => {
    // Prevent the click from triggering other sidebar events if necessary
    e.stopPropagation();

    // 1. Remove the current expression class
    face.classList.remove(expressions[currentIndex]);
    
    // 2. Calculate the next index (loops back to 0 after 14)
    currentIndex = (currentIndex + 1) % expressions.length;
    
    // 3. Add the new expression class
    face.classList.add(expressions[currentIndex]);
  });
});
document.addEventListener('DOMContentLoaded', () => {
  // IMPORTANT: Change 'profileCircle' to whatever ID your actual outer ring uses
  const outerContainer = document.getElementById('profileCircle'); 
  const face = document.getElementById('aiFaceMini');

  if (!outerContainer || !face) return;

  const expressions = [
    'normal', 'happy', 'winking', 'surprised', 'thinking', 
    'excited', 'sad', 'angry', 'sleepy', 'dizzy', 
    'shocked', 'suspicious', 'relieved', 'determined', 'laughing'
  ];

  let currentIndex = 0;

  outerContainer.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevents messing with sidebar toggle events
    face.classList.remove(expressions[currentIndex]);
    currentIndex = (currentIndex + 1) % expressions.length;
    face.classList.add(expressions[currentIndex]);
  });
});

