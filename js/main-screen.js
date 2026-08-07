// js/main-screen.js
(function initializeMainScreen() {
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    const chatLog = document.getElementById('chat-log');
    const welcomeContainer = document.getElementById('welcome-container');
    const actionCards = document.querySelectorAll('.action-card');
    const chatFeed = document.getElementById('chat-feed');

    // 1. Auto-resize textarea
    chatInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight < 150 ? this.scrollHeight : 150) + 'px';
        if (this.value.trim() !== '') {
            sendBtn.style.opacity = '1';
        } else {
            sendBtn.style.opacity = '0.7';
        }
    });

    // 2. Handle Message Submission
    const handleSend = () => {
        const text = chatInput.value.trim();
        if (!text) return;

        // Hide Welcome Screen on first message
        if (welcomeContainer.style.display !== 'none') {
            welcomeContainer.style.display = 'none';
        }

        // Create User Message Element
        appendMessage(text, 'user');

        // Reset Input
        chatInput.value = '';
        chatInput.style.height = 'auto';

        // Simulate AI Processing & Response
        setTimeout(() => {
            appendMessage("Processing sequence... I am the JOHNNY TEC AI. This is a simulated local response. API integration required for live data.", 'ai');
        }, 800);
    };

    // Append Message Helper
    const appendMessage = (content, sender) => {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${sender}`;
        msgDiv.textContent = content; // Safe from XSS
        chatLog.appendChild(msgDiv);
        
        // Auto-scroll to bottom
        chatFeed.scrollTop = chatFeed.scrollHeight;
    };

    // 3. Event Listeners for Input
    sendBtn.addEventListener('click', handleSend);
    
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    });

    // 4. Quick Action Grid Interactions
    actionCards.forEach(card => {
        card.addEventListener('click', function() {
            const promptText = this.getAttribute('data-prompt');
            chatInput.value = promptText;
            // Trigger input event to auto-resize
            chatInput.dispatchEvent(new Event('input'));
            // Auto-focus input
            chatInput.focus();
        });
    });

    // 5. Global Event Listener for "New Chat" (Emitted from left-bar.js)
    window.addEventListener('jt-new-chat', () => {
        chatLog.innerHTML = ''; // Clear log
        welcomeContainer.style.display = 'flex'; // Show welcome
        chatInput.value = '';
        chatInput.style.height = 'auto';
    });

})();

