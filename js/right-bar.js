// js/right-bar.js
(function initializeRightSidebar() {
    // 1. Dynamic Value Updates for Sliders
    const tempSlider = document.getElementById('temp-slider');
    const tempValue = document.getElementById('temp-value');
    
    if (tempSlider && tempValue) {
        tempSlider.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value).toFixed(1);
            tempValue.textContent = val;
            // Dispatch event for internal configuration updates
            window.dispatchEvent(new CustomEvent('jt-config-update', { 
                detail: { parameter: 'temperature', value: val } 
            }));
        });
    }

    const tokenSlider = document.getElementById('token-slider');
    const tokenValue = document.getElementById('token-value');

    if (tokenSlider && tokenValue) {
        tokenSlider.addEventListener('input', (e) => {
            tokenValue.textContent = e.target.value;
            window.dispatchEvent(new CustomEvent('jt-config-update', { 
                detail: { parameter: 'max_tokens', value: e.target.value } 
            }));
        });
    }

    // 2. Model Selection Logic
    const modelSelect = document.getElementById('ai-model-select');
    if (modelSelect) {
        modelSelect.addEventListener('change', (e) => {
            console.log(`SYSTEM: AI Core switched to ${e.target.value}`);
            window.dispatchEvent(new CustomEvent('jt-model-switch', { 
                detail: { model: e.target.value } 
            }));
        });
    }

    // 3. Developer Toggles Logic
    const voiceToggle = document.getElementById('toggle-voice');
    if (voiceToggle) {
        voiceToggle.addEventListener('change', (e) => {
            if(e.target.checked) {
                console.log("SYSTEM: Voice Synthesizer Module Activated.");
                // This will later trigger the voice visualizer canvas logic
                window.dispatchEvent(new Event('jt-voice-activated'));
            } else {
                console.log("SYSTEM: Voice Synthesizer Module Deactivated.");
                window.dispatchEvent(new Event('jt-voice-deactivated'));
            }
        });
    }

    const debugToggle = document.getElementById('toggle-debug');
    if (debugToggle) {
        debugToggle.addEventListener('change', (e) => {
            window.JT_DEBUG_MODE = e.target.checked;
            if (window.JT_DEBUG_MODE) {
                console.warn("SYSTEM: Debug mode enabled. Exposing raw API traces.");
            }
        });
    }
})();
                                     
