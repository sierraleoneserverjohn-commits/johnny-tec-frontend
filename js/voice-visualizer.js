// js/voice-visualizer.js
(function initializeVoiceVisualizer() {
    const overlay = document.getElementById('voice-overlay');
    const closeBtn = document.getElementById('close-voice-btn');
    const canvas = document.getElementById('audio-canvas');
    const ctx = canvas ? canvas.getContext('2d') : null;
    
    let animationId = null;
    let isActive = false;

    // Handle high-DPI displays for crisp canvas rendering
    function resizeCanvas() {
        if (!canvas) return;
        const rect = canvas.parentElement.getBoundingClientRect();
        // Accounting for flex layout height
        const width = rect.width - 40; 
        const height = 250; 
        
        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        
        ctx.scale(dpr, dpr);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
    }

    // Mathematical Sine Wave Generator
    function drawVisualizer() {
        if (!isActive || !ctx) return;
        
        const width = canvas.width / (window.devicePixelRatio || 1);
        const height = canvas.height / (window.devicePixelRatio || 1);
        const centerY = height / 2;
        
        ctx.clearRect(0, 0, width, height);
        
        const time = Date.now() * 0.002;
        
        // Define wave parameters [amplitude, frequency, speed, color, lineWidth]
        const waves = [
            [40, 0.02, 1.5, '#00d2ff', 3], // Neon Cyan
            [30, 0.03, 1.0, '#b026ff', 2], // Neon Purple
            [20, 0.04, 2.0, 'rgba(255, 255, 255, 0.3)', 1] // Ghost Wave
        ];

        ctx.globalCompositeOperation = 'screen';

        waves.forEach(wave => {
            const [amp, freq, speed, color, lineWidth] = wave;
            ctx.beginPath();
            ctx.moveTo(0, centerY);
            
            for (let x = 0; x < width; x++) {
                // Modulate amplitude based on center distance for a "burst" effect
                const distanceToCenter = Math.abs(x - width / 2);
                const dampening = Math.max(0, 1 - (distanceToCenter / (width / 2)));
                
                const y = Math.sin(x * freq + time * speed) * (amp * dampening);
                ctx.lineTo(x, centerY + y);
            }
            
            ctx.strokeStyle = color;
            ctx.lineWidth = lineWidth;
            // Add native canvas glow
            ctx.shadowBlur = 15;
            ctx.shadowColor = color;
            ctx.stroke();
            ctx.shadowBlur = 0; // Reset for next line
        });

        animationId = requestAnimationFrame(drawVisualizer);
    }

    // Event Listeners for Activation/Deactivation
    window.addEventListener('jt-voice-activated', () => {
        if (!overlay) return;
        overlay.classList.add('active');
        isActive = true;
        resizeCanvas();
        drawVisualizer();
    });

    const stopVoiceEngine = () => {
        if (!overlay) return;
        overlay.classList.remove('active');
        isActive = false;
        if (animationId) cancelAnimationFrame(animationId);
        
        // Reset the right sidebar toggle if closed manually
        const voiceToggle = document.getElementById('toggle-voice');
        if (voiceToggle && voiceToggle.checked) {
            voiceToggle.checked = false;
        }
    };

    window.addEventListener('jt-voice-deactivated', stopVoiceEngine);
    if (closeBtn) closeBtn.addEventListener('click', stopVoiceEngine);

    // Handle Window Resize
    window.addEventListener('resize', () => {
        if (isActive) resizeCanvas();
    });
})();
                  
