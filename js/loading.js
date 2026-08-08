/**
 * Loading Module
 * Manages the exact 7-second loading sequence and the 60FPS background canvas waveform.
 */
export function init() {
  return new Promise((resolve) => {
    const loadingScreen = document.getElementById('loading-screen');
    const fill = document.getElementById('loadingBarFill');
    const percentLabel = document.getElementById('loadingPercent');
    const track = document.querySelector('.loading-bar-track');
    const canvas = document.getElementById('loadingCanvas');
    
    if (!loadingScreen || !fill || !percentLabel) {
      resolve();
      return;
    }

    // --- 1. Canvas Waveform Animation ---
    let rafId;
    let time = 0;
    
    function setupCanvas() {
      if (!canvas) return null;
      const ctx = canvas.getContext('2d');
      const dpr = window.devicePixelRatio || 1;
      
      const resize = () => {
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        ctx.scale(dpr, dpr);
      };
      
      window.addEventListener('resize', resize);
      resize();
      
      return { ctx, dpr };
    }

    const canvasData = setupCanvas();

    function drawWaveform() {
      if (!canvasData) return;
      const { ctx } = canvasData;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const cx = w / 2;
      const cy = h / 2 - 80; // Offset slightly upwards to center around the logo
      
      ctx.clearRect(0, 0, w, h);
      time += 0.02;

      const drawRing = (radius, amplitude, frequency, color, phaseOffset) => {
        ctx.beginPath();
        for (let i = 0; i <= Math.PI * 2; i += 0.05) {
          // Calculate organic wave distortion
          const distortion = Math.sin(i * frequency + time + phaseOffset) * amplitude;
          const r = radius + distortion;
          const x = cx + Math.cos(i) * r;
          const y = cy + Math.sin(i) * r;
          
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.shadowBlur = 15;
        ctx.shadowColor = color;
        ctx.stroke();
      };

      // Draw three distinct glowing rings
      drawRing(110, 15, 3, 'rgba(0, 210, 255, 0.6)', 0);      // Cyan wave
      drawRing(130, 20, 5, 'rgba(176, 38, 255, 0.5)', 2);     // Purple wave
      drawRing(150, 10, 4, 'rgba(255, 38, 165, 0.3)', -1);    // Magenta wave

      rafId = requestAnimationFrame(drawWaveform);
    }
    
    // Start Canvas Animation
    drawWaveform();

    // --- 2. Loading Timer Logic (Exactly 7 Seconds) ---
    const TOTAL_DURATION = 7000; // 7000 milliseconds = 7 seconds
    let startTime = null;

    function updateProgress(timestamp) {
      if (!startTime) startTime = timestamp;
      
      const elapsed = timestamp - startTime;
      // Calculate progress from 0.0 to 1.0 based strictly on time
      const progress = Math.min(elapsed / TOTAL_DURATION, 1);
      const currentPercent = Math.floor(progress * 100);

      // Update UI
      fill.style.width = `${currentPercent}%`;
      percentLabel.textContent = `${currentPercent}%`;
      if (track) track.setAttribute('aria-valuenow', currentPercent.toString());

      if (progress < 1) {
        requestAnimationFrame(updateProgress);
      } else {
        // Exactly 7 seconds have passed
        finishLoading();
      }
    }

    function finishLoading() {
      // Trigger CSS fade out transition
      loadingScreen.classList.add('hide');
      
      // Wait for the CSS opacity transition to complete before resolving and stopping canvas
      setTimeout(() => {
        cancelAnimationFrame(rafId);
        resolve();
      }, 800); // Matches the 0.8s transition in CSS
    }

    // Start Timer
    requestAnimationFrame(updateProgress);
  });
      }
