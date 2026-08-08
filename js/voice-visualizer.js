/**
 * Voice Assistant Visualizer — HTML5 canvas frequency wave.
 * Uses getUserMedia + Web Audio API when the user grants mic access;
 * falls back to an ambient animated waveform otherwise so the UI
 * never looks broken.
 */

let audioCtx, analyser, source, stream, rafId;

export function init() {
  const overlay = document.getElementById('voiceOverlay');
  const canvas = document.getElementById('voiceCanvas');
  const statusEl = document.getElementById('voiceStatus');
  if (!overlay || !canvas) return;

  document.addEventListener('jt:open-voice', () => open(overlay, canvas, statusEl));
  document.querySelector('[data-nav="voice"]')?.addEventListener('click', () => open(overlay, canvas, statusEl));

  overlay.querySelector('#voiceClose')?.addEventListener('click', () => close(overlay));
  overlay.querySelector('#voiceStop')?.addEventListener('click', () => close(overlay));
  document.querySelector('#micBtn')?.addEventListener('click', () => open(overlay, canvas, statusEl));
}

async function open(overlay, canvas, statusEl) {
  overlay.hidden = false;
  fitCanvas(canvas);

  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    source = audioCtx.createMediaStreamSource(stream);
    source.connect(analyser);
    statusEl.textContent = 'Listening…';
    drawLive(canvas);
  } catch (err) {
    // Mic denied/unavailable — show an ambient wave instead of a dead canvas.
    statusEl.textContent = 'Microphone unavailable — ambient preview';
    drawAmbient(canvas);
  }
}

function close(overlay) {
  overlay.hidden = true;
  cancelAnimationFrame(rafId);
  stream?.getTracks().forEach((t) => t.stop());
  audioCtx?.close().catch(() => {});
  audioCtx = analyser = source = stream = null;
}

function fitCanvas(canvas) {
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.clientWidth;
  const h = canvas.clientHeight || 100;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function drawLive(canvas) {
  const ctx = canvas.getContext('2d');
  const w = canvas.clientWidth;
  const h = canvas.clientHeight || 100;
  const data = new Uint8Array(analyser.frequencyBinCount);

  const grad = ctx.createLinearGradient(0, 0, w, 0);
  grad.addColorStop(0, '#00d2ff');
  grad.addColorStop(1, '#b026ff');

  function frame() {
    rafId = requestAnimationFrame(frame);
    analyser.getByteFrequencyData(data);
    ctx.clearRect(0, 0, w, h);

    const barCount = 48;
    const step = Math.floor(data.length / barCount);
    const barW = w / barCount;

    for (let i = 0; i < barCount; i++) {
      const v = data[i * step] / 255;
      const barH = Math.max(4, v * h);
      ctx.fillStyle = grad;
      const x = i * barW;
      const y = (h - barH) / 2;
      roundRect(ctx, x + barW * 0.18, y, barW * 0.64, barH, 3);
      ctx.fill();
    }
  }
  frame();
}

function drawAmbient(canvas) {
  const ctx = canvas.getContext('2d');
  const w = canvas.clientWidth;
  const h = canvas.clientHeight || 100;
  const barCount = 48;
  const barW = w / barCount;
  let t = 0;

  const grad = ctx.createLinearGradient(0, 0, w, 0);
  grad.addColorStop(0, '#00d2ff');
  grad.addColorStop(1, '#b026ff');

  function frame() {
    rafId = requestAnimationFrame(frame);
    t += 0.06;
    ctx.clearRect(0, 0, w, h);
    for (let i = 0; i < barCount; i++) {
      const v = (Math.sin(t + i * 0.35) + 1) / 2;
      const barH = Math.max(4, v * h * 0.7);
      ctx.fillStyle = grad;
      const x = i * barW;
      const y = (h - barH) / 2;
      roundRect(ctx, x + barW * 0.18, y, barW * 0.64, barH, 3);
      ctx.fill();
    }
  }
  frame();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
