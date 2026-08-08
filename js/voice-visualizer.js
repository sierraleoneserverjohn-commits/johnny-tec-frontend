/**
 * Voice Assistant Visualizer
 * Implements a real-time responsive circular waveform using the Web Audio API.
 */

let audioCtx, analyser, source, stream, rafId;
let currentState = 'idle'; // 'listening', 'processing', 'ai-speaking', 'idle'
let aiAudioElement = null; // Reference to the AI's audio element if applicable

// DOM Elements
let overlay, canvas, topStatus, mainText, subText, micIcon, ringPulse;

export function init() {
  overlay = document.getElementById('voiceOverlay');
  canvas = document.getElementById('voiceCanvas');
  topStatus = document.getElementById('voiceTopStatus');
  mainText = document.getElementById('voiceMainText');
  subText = document.getElementById('voiceSubText');
  micIcon = document.getElementById('voiceMicIcon');
  ringPulse = document.querySelector('.voice-pulse');

  if (!overlay || !canvas) return;

  // Event Listeners for Opening/Closing
  document.addEventListener('jt:open-voice', openVoiceInterface);
  document.querySelector('[data-nav="voice"]')?.addEventListener('click', openVoiceInterface);
  document.querySelector('#micBtn')?.addEventListener('click', openVoiceInterface);
  
  // Close / Stop Listeners
  document.getElementById('voiceClose')?.addEventListener('click', closeVoiceInterface);
  document.getElementById('voiceStop')?.addEventListener('click', closeVoiceInterface);
  
  // New Home Button Routing
  document.getElementById('voiceHome')?.addEventListener('click', () => {
    closeVoiceInterface();
    // Insert your routing logic to go to dashboard here:
    // window.location.href = '/dashboard'; or similar router push
  });

  // Handle Window Resize for Canvas
  window.addEventListener('resize', () => {
    if (!overlay.hidden) fitCanvas(canvas);
  });
}

// ---------------------------------------------------------
// Core Audio & State Functions
// ---------------------------------------------------------

async function openVoiceInterface() {
  overlay.hidden = false;
  fitCanvas(canvas);
  setUIState('listening');

  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 512; // High resolution for smooth curves
    analyser.smoothingTimeConstant = 0.8;
    
    source = audioCtx.createMediaStreamSource(stream);
    source.connect(analyser);
    
    drawCircularWaveform();
  } catch (err) {
    console.error("Microphone access denied:", err);
    setUIState('error');
    drawAmbientWaveform(); // Fallback animation
  }
}

function closeVoiceInterface() {
  overlay.hidden = true;
  cancelAnimationFrame(rafId);
  
  // Cleanup Audio Context and Streams to prevent memory leaks
  if (stream) stream.getTracks().forEach(t => t.stop());
  if (audioCtx && audioCtx.state !== 'closed') audioCtx.close().catch(console.error);
  
  audioCtx = analyser = source = stream = null;
  setUIState('idle');
}

/**
 * Update UI text and animations based on current state.
 * Expected states: 'listening', 'processing', 'ai-speaking', 'error', 'idle'
 */
export function setUIState(state) {
  currentState = state;
  switch(state) {
    case 'listening':
      topStatus.textContent = 'Listening...';
      mainText.textContent = "I'm listening";
      subText.textContent = "Speak now, I'm here to help";
      ringPulse.style.display = 'block';
      micIcon.style.stroke = '#fff';
      break;
    case 'processing':
      topStatus.textContent = 'Thinking...';
      mainText.textContent = "Processing";
      subText.textContent = "Just a moment...";
      ringPulse.style.display = 'none'; // Calm down during processing
      micIcon.style.stroke = '#b026ff';
      break;
    case 'ai-speaking':
      topStatus.textContent = 'Speaking...';
      mainText.textContent = "AI Assistant";
      subText.textContent = "Here is your answer";
      ringPulse.style.display = 'block';
      micIcon.style.stroke = '#00d2ff';
      break;
    case 'error':
      topStatus.textContent = 'Mic Unavailable';
      mainText.textContent = "Microphone Error";
      subText.textContent = "Check permissions to enable voice";
      ringPulse.style.display = 'none';
      micIcon.style.stroke = 'rgba(255,255,255,0.3)';
      break;
  }
}

// ---------------------------------------------------------
// Visualizer Rendering Engine
// ---------------------------------------------------------

function fitCanvas(cvs) {
  const dpr = window.devicePixelRatio || 1;
  const rect = cvs.parentElement.getBoundingClientRect();
  cvs.width = rect.width * dpr;
  cvs.height = rect.height * dpr;
  const ctx = cvs.getContext('2d');
  ctx.scale(dpr, dpr);
}

function drawCircularWaveform() {
  const ctx = canvas.getContext('2d');
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  
  let phase = 0; // For continuous flowing animation

  function render() {
    if (!audioCtx) return;
    rafId = requestAnimationFrame(render);
    
    // Get actual microphone data
    analyser.getByteTimeDomainData(dataArray);

    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const cx = w / 2;
    const cy = h / 2;
    
    ctx.clearRect(0, 0, w, h);
    
    // Calculate RMS (Volume) to pulse the overall radius
    let rms = 0;
    for (let i = 0; i < bufferLength; i++) {
      let val = (dataArray[i] - 128) / 128;
      rms += val * val;
    }
    rms = Math.sqrt(rms / bufferLength);
    
    // Base radius fits around the central microphone ring
    const baseRadius = 90 + (rms * 100); 
    phase += 0.02; // Rotate waves

    // Draw 3 layered waves for the "neon mesh" effect seen in the reference
    drawWaveLayer(ctx, dataArray, cx, cy, baseRadius, phase, '#00d2ff', 1.0, 1);
    drawWaveLayer(ctx, dataArray, cx, cy, baseRadius, phase * 1.5, '#b026ff', 0.6, 2);
    drawWaveLayer(ctx, dataArray, cx, cy, baseRadius, -phase, '#7000ff', 0.4, 3);
  }
  
  render();
}

function drawWaveLayer(ctx, dataArray, cx, cy, radius, phase, color, alpha, layerIndex) {
  ctx.beginPath();
  const points = 120; // Number of points in the circle
  const step = Math.floor(dataArray.length / points);
  
  for (let i = 0; i <= points; i++) {
    const dataIndex = (i * step) % dataArray.length;
    // Normalize audio data (-1 to 1)
    const audioVal = (dataArray[dataIndex] - 128) / 128; 
    
    // Create organic distortion
    const angle = (i / points) * Math.PI * 2;
    
    // In Processing/AI states, quiet the user wave unless AI is speaking
    let ampMultiplier = 40;
    if (currentState === 'processing') ampMultiplier = 5; // Minimal movement
    if (currentState === 'ai-speaking') ampMultiplier = 60; // Larger for AI
    
    // Apply actual audio amplitude + some sine wave math for smooth rendering
    const waveDistortion = (audioVal * ampMultiplier) * Math.sin(angle * (layerIndex * 2) + phase);
    const r = radius + waveDistortion;
    
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  
  ctx.closePath();
  ctx.strokeStyle = color;
  ctx.lineWidth = layerIndex === 1 ? 2 : 1;
  ctx.globalAlpha = alpha;
  
  // Neon Glow effect
  ctx.shadowBlur = layerIndex === 1 ? 15 : 5;
  ctx.shadowColor = color;
  
  ctx.stroke();
  
  // Reset shadow for next draw
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1.0;
}

// Fallback if Mic is denied
function drawAmbientWaveform() {
  const ctx = canvas.getContext('2d');
  let phase = 0;
  
  // Create dummy flat data array so drawWaveLayer still functions
  const dummyData = new Uint8Array(512).fill(128); 

  function render() {
    rafId = requestAnimationFrame(render);
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    ctx.clearRect(0, 0, w, h);
    
    phase += 0.02;
    const cx = w / 2;
    const cy = h / 2;
    const baseRadius = 90;
    
    // Simulate gentle breathing
    const breath = Math.sin(phase) * 5;
    
    drawWaveLayer(ctx, dummyData, cx, cy, baseRadius + breath, phase, '#00d2ff', 0.5, 1);
    drawWaveLayer(ctx, dummyData, cx, cy, baseRadius + breath, -phase, '#b026ff', 0.3, 2);
  }
  render();
}

/**
 * Call this when your AI starts speaking to hook its audio output into the visualizer.
 * @param {HTMLAudioElement} audioElement - The DOM audio element playing the AI's voice
 */
export function connectAIAudio(audioElement) {
  if (!audioCtx || audioCtx.state === 'closed') {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 512;
    drawCircularWaveform(); // Restart rendering loop
  }
  
  try {
    const aiSource = audioCtx.createMediaElementSource(audioElement);
    aiSource.connect(analyser);
    analyser.connect(audioCtx.destination); // Ensure audio still plays
    aiAudioElement = audioElement;
    
    audioElement.onplay = () => setUIState('ai-speaking');
    audioElement.onended = () => setUIState('listening'); // Return to listening when done
  } catch(e) {
    console.warn("Audio element already connected to context", e);
    setUIState('ai-speaking');
  }
}
  
