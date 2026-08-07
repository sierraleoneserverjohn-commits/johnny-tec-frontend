// js/loading.js
(function initializeLoadingSequence() {
    const statusText = document.getElementById('loading-status');
    
    // Cyberpunk boot sequence messages
    const bootMessages = [
        "Initializing Neural Net...",
        "Loading Core Modules...",
        "Establishing Secure Uplink...",
        "Bypassing Security Protocols...",
        "System Online."
    ];

    let msgIndex = 0;
    
    // Cycle through messages to match the 2.5s orchestrator timeout in app.js
    const messageInterval = setInterval(() => {
        msgIndex++;
        if (msgIndex < bootMessages.length && statusText) {
            statusText.innerText = bootMessages[msgIndex];
        } else {
            clearInterval(messageInterval);
        }
    }, 500); 
})();

