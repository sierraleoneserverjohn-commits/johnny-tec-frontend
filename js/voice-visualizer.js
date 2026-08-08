// --- DOM Elements ---
const canvas = document.getElementById('visualizerCanvas');
const ctx = canvas.getContext('2d');
const statusText = document.getElementById('statusText');
const primaryText = document.getElementById('primaryText');
const secondaryText = document.getElementById('secondaryText');
const errorMessage = document.getElementById('errorMessage');
const btnStop = document.getElementById('btnStop');
const btnHome = document.getElementById('btnHome');
const aiAudioElement = document.getElementById('aiAudio');

// --- Audio & State Variables ---
let audioCtx;
let analyser;
let microphoneStream;
let sourceNode;
let dataArray;
let bufferLength;
let animationId;

let currentState = 'idle'; // 'idle', 'listening', 'processing', 'speaking'
let targetRadiusMultiplier = 1;
let currentRadiusMultiplier = 1;

// --- Canvas Resizing ---
function resizeCanvas() {
  // Use device pixel ratio for crisp rendering on mobile
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);
  canvas.style.width = `${rect.width}px`;
  canvas.style.height = `${rect.height}px`;
}
window.addEventListener('resize', resizeCanvas);

// --- State Management ---
function updateUIState(state) {
  currentState = state;
  switch(state) {
    case 'idle':
      statusText.innerText = "Standby";
      primaryText.innerText = "Ready";
      secondaryText.innerText = "Tap mic to start";
      targetRadiusMultiplier = 0.5;
      break;
    case 'listening':
      statusText.innerText = "Listening...";
      primaryText.innerText = "I'm listening";
      secondaryText.innerText = "Speak now, I'm here to help";
      targetRadiusMultiplier = 1.0;
      break;
    case 'processing':
      statusText.innerText = "Thinking...";
      primaryText.innerText = "Processing...";
      secondaryText.innerText = "Give me a moment";
      targetRadiusMultiplier = 0.8;
      break;
    case 'speaking':
      statusText.innerText = "Speaking...";
      primaryText.innerText = "Here is my answer";
      secondaryText.innerText = "Listen closely";
      targetRadiusMultiplier = 1.2;
      break;
  }
}

// --- Audio Initialization ---
async function startListening() {
  try {
    errorMessage.innerText = "";
    
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      await audioCtx.resume();
    }

    microphoneStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    sourceNode = audioCtx.createMediaStreamSource(microphoneStream);
    
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256; // 128 data points
    bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);
    
    sourceNode.connect(analyser);
    // Do NOT connect to destination (speakers) or you'll get feedback loop!
    
    updateUIState('listening');
    resizeCanvas();
    drawVisualizer();

  } catch (err) {
    console.error("Microphone access denied or error:", err);
    errorMessage.innerText = "Microphone access required.";
    updateUIState('idle');
  }
}

// --- AI Audio Hook (For when your backend responds) ---
// Call this function and pass the URL of the AI speech audio
function playAIResponse(audioUrl) {
  stopMicrophone(); // Stop listening to user
  
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  
  aiAudioElement.src = audioUrl;
  
  // Re-route AI audio through analyser
  const aiSource = audioCtx.createMediaElementSource(aiAudioElement);
  analyser = audioCtx.createAnalyser();
  analyser.fftSize = 256;
  bufferLength = analyser.frequencyBinCount;
  dataArray = new Uint8Array(bufferLength);
  
  aiSource.connect(analyser);
  analyser.connect(audioCtx.destination); // Play out loud
  
  aiAudioElement.play();
  updateUIState('speaking');
  drawVisualizer();
  
  aiAudioElement.onended = () => {
    updateUIState('idle');
    // Optionally automatically go back to startListening() here
  };
}

// --- Cleanup & Stop ---
function stopMicrophone() {
  if (microphoneStream) {
    microphoneStream.getTracks().forEach(track => track.stop());
  }
  if (sourceNode) {
    sourceNode.disconnect();
  }
}

function cleanupAndExit() {
  cancelAnimationFrame(animationId);
  stopMicrophone();
  if (aiAudioElement) {
    aiAudioElement.pause();
    aiAudioElement.src = "";
  }
  if (audioCtx) {
    audioCtx.close();
    audioCtx = null;
  }
  // Redirect back to main dashboard
  window.location.href = 'index.html'; // Update with your actual home route
}

// --- Canvas Rendering Loop ---
function drawVisualizer() {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const centerX = width / 2;
  const centerY = height / 2;
  const baseRadius = 85; // slightly larger than the outer mic ring

  ctx.clearRect(0, 0, width, height);

  if (analyser && (currentState === 'listening' || currentState === 'speaking')) {
    analyser.getByteTimeDomainData(dataArray);
  } else {
    // If processing or idle, simulate a flat calm line
    if (!dataArray) dataArray = new Uint8Array(128).fill(128);
    for(let i=0; i<dataArray.length; i++) {
        dataArray[i] = 128 + Math.sin(Date.now() / 300 + i) * 5; 
    }
  }

  // Smooth radius transitions based on state
  currentRadiusMultiplier += (targetRadiusMultiplier - currentRadiusMultiplier) * 0.1;

  ctx.globalCompositeOperation = 'screen';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Draw 3 layers of waveforms for that complex 1000036667.png look
  drawWaveLayer(width, height, centerX, centerY, baseRadius, 1.0, 3, 0);   // Main
  drawWaveLayer(width, height, centerX, centerY, baseRadius, 0.6, 1.5, 45); // Inner tight
  drawWaveLayer(width, height, centerX, centerY, baseRadius, 1.4, 1, 90);  // Outer subtle

  animationId = requestAnimationFrame(drawVisualizer);
}

// Helper to draw a single reactive ring + horizontal extensions
function drawWaveLayer(width, height, cx, cy, baseRadius, sensitivity, lineWidth, offsetPhase) {
  ctx.beginPath();
  
  // Create Cyan to Magenta gradient
  const gradient = ctx.createLinearGradient(cx - 150, cy, cx + 150, cy);
  gradient.addColorStop(0, '#00d2ff');
  gradient.addColorStop(0.5, '#3a7bd5');
  gradient.addColorStop(1, '#ff3cb4');
  
  ctx.strokeStyle = gradient;
  ctx.lineWidth = lineWidth;
  ctx.shadowBlur = 15;
  ctx.shadowColor = gradient;

  // Draw Circular Waveform
  for (let i = 0; i < bufferLength; i++) {
    // Calculate amplitude (normalize 0-255 to -1 to 1)
    const v = dataArray[i] / 128.0; 
    const amplitude = (v - 1) * 50 * sensitivity * currentRadiusMultiplier;
    
    // Map to circle
    const angle = (i * 2 * Math.PI) / bufferLength + (offsetPhase * Math.PI / 180);
    const radius = baseRadius + amplitude;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;

    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();

  // Draw Horizontal extensions (the heartbeat line effect fading to edges)
  ctx.beginPath();
  ctx.moveTo(0, cy);
  for (let i = 0; i < bufferLength; i++) {
    const v = dataArray[i] / 128.0;
    const amplitude = (v - 1) * 30 * sensitivity * currentRadiusMultiplier;
    
    // Map array across the screen width
    const x = (i / bufferLength) * width;
    
    // Dampen amplitude towards edges so it connects smoothly to the center
    const distanceToCenter = Math.abs(x - cx);
    const dampening = Math.max(0, 1 - (distanceToCenter / (width / 2)));
    const y = cy + (amplitude * dampening);
    
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  
  // Create a faded gradient for the horizontal line
  const horizGradient = ctx.createLinearGradient(0, cy, width, cy);
  horizGradient.addColorStop(0, 'transparent');
  horizGradient.addColorStop(0.3, '#00d2ff');
  horizGradient.addColorStop(0.7, '#ff3cb4');
  horizGradient.addColorStop(1, 'transparent');
  
  ctx.strokeStyle = horizGradient;
  ctx.lineWidth = lineWidth * 0.8;
  ctx.shadowBlur = 10;
  ctx.stroke();
}

// --- Event Listeners ---
btnHome.addEventListener('click', cleanupAndExit);

btnStop.addEventListener('click', () => {
  stopMicrophone();
  updateUIState('processing'); // Usually stopping triggers processing in AI
  
  // Simulate AI Response after 2 seconds (REMOVE THIS IN PRODUCTION)
  setTimeout(() => {
    // In your real app, call playAIResponse(audioUrl) here
    updateUIState('idle'); 
  }, 2000);
});

// Start listening immediately on load (Note: Browsers might block this until user interaction)
window.addEventListener('DOMContentLoaded', () => {
  resizeCanvas();
  // We trigger it here, but if blocked, they can click the Home/Stop button to reset.
  startListening(); 
});
// Inside Voice visulization Js
function cleanupAndExit() {
  cancelAnimationFrame(animationId);
  stopMicrophone();
  if (aiAudioElement) {
    aiAudioElement.pause();
    aiAudioElement.src = "";
  }
  if (audioCtx) {
    audioCtx.close();
    audioCtx = null;
  }
  
  // This takes you back to your main app!
  window.location.href = 'index.html'; 
}

