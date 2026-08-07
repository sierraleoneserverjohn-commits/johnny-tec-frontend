// js/left-bar.js
(function initializeLeftSidebar() {
    // 1. Progress Bar Animation
    // We delay slightly to allow the DOM to render so the CSS transition fires smoothly
    setTimeout(() => {
        const usageFill = document.getElementById('ai-usage-fill');
        if (usageFill) {
            usageFill.style.width = '78%';
        }
    }, 100);

    // 2. Navigation Active State Switching
    const navItems = document.querySelectorAll('#nav-list .nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remove active class from all
            navItems.forEach(nav => nav.classList.remove('active'));
            // Add active class to clicked item
            this.classList.add('active');
            
            // Dispatch custom event for the main orchestrator/other components to listen to
            const target = this.getAttribute('data-target');
            window.dispatchEvent(new CustomEvent('jt-nav-change', { detail: { view: target } }));
        });
    });

    // 3. New Chat Button Logic
    const newChatBtn = document.getElementById('btn-new-chat');
    if (newChatBtn) {
        newChatBtn.addEventListener('click', () => {
            // Trigger visual feedback
            newChatBtn.style.transform = 'scale(0.95)';
            setTimeout(() => newChatBtn.style.transform = 'translateY(-2px)', 150);
            
            // Dispatch system event
            window.dispatchEvent(new CustomEvent('jt-new-chat'));
            console.log("SYSTEM: Initializing New Chat Protocol...");
        });
    }
})();

