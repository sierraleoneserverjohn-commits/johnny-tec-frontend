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
// js/left-bar.js

// This function fetches your sub-files and injects them into the main screen
async function loadView(viewName) {
    const mainContainer = document.getElementById('main-content'); // Make sure your center screen has this ID!
    
    try {
        // Fetch the HTML sub-file from the components folder
        const response = await fetch(`components/${viewName}.html`);
        if (!response.ok) throw new Error("Component not found");
        
        const html = await response.text();
        mainContainer.innerHTML = html; // Swap the UI instantly
        
    } catch (error) {
        console.error("Routing Error:", error);
        mainContainer.innerHTML = `<div class="error">Failed to load ${viewName} UI.</div>`;
    }
}

// Attach click listeners to all menu items in the left sidebar
document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', (e) => {
        const targetView = e.currentTarget.getAttribute('data-view');
        
        if (targetView) {
            // Remove 'active' highlight from all buttons
            document.querySelectorAll('.menu-item').forEach(btn => btn.classList.remove('active'));
            // Add 'active' highlight to the clicked button
            e.currentTarget.classList.add('active');
            
            // Load the new sub-file
            loadView(targetView);
        }
    });
});

