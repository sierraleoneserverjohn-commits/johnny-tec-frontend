/**
 * main-screen.js — center hub logic
 *
 * Owns: the AI-generated greeting, the quick-action grid, the chat log,
 * and the omni-input bar (attach menu, mic-to-text, and the button that
 * morphs between "start live conversation" and "send" depending on
 * whether the input has text).
 *
 * INTEGRATION POINTS (clearly marked below) — update these two
 * constants once the Sierra Leone Server routes are finalized:
 *   - GREETING_ENDPOINT: returns a freshly generated greeting
 *   - ROUTE_ENDPOINT:    the omni-input intent router described in
 *                        the project architecture (raw text in,
 *                        { type, content, meta } out)
 * Both calls fail gracefully — the UI stays fully usable (with local
 * fallbacks) even before the backend is wired up.
 */

(() => {
  'use strict';

  const root = document.querySelector('.main-screen');
  if (!root) return;

  // ----------------------------------------------------------------
  // Config — point these at the real backend when ready
  // ----------------------------------------------------------------
  const GREETING_ENDPOINT = '/api/assistant/greeting';
  const ROUTE_ENDPOINT = '/api/route';
  const USER_NAME = 'Johnny';
  const FETCH_TIMEOUT_MS = 2500;

  function fetchWithTimeout(url, options = {}) {
    const controller = new AbortController();
    const id = window.setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    return fetch(url, { ...options, signal: controller.signal }).finally(() => window.clearTimeout(id));
  }

  // ==================================================================
  // 1. AI-generated greeting — different phrasing every time it opens
  // ==================================================================
  const greetingLineEl = root.querySelector('#msGreetingLine');
  const greetingNameEl = root.querySelector('#msGreetingName');
  const headlineEl = root.querySelector('#msHeadline');
  const sublineEl = root.querySelector('#msSubline');

  // Local fallback pool, used instantly if the backend isn't reachable
  // (or hasn't been wired up yet). Mixes "greets the user" and
  // "introduces itself" styles per the brief.
  const GREETING_POOL = [
    { wave: '👋', line: `Hey ${USER_NAME},`, headline: 'How can I help you today?', sub: 'Your AI assistant is ready to help you with anything you need.' },
    { wave: '⚡', line: `Hey ${USER_NAME}, I'm Johnny Tec —`, headline: 'What are we building today?', sub: 'Ask me anything, or drop in an image, file, or voice note.' },
    { wave: '✨', line: `Welcome back, ${USER_NAME}.`, headline: 'Where should we start?', sub: 'Code, writing, research, or just talk it through — I\'m ready.' },
    { wave: '🌙', line: `Late one, ${USER_NAME}?`, headline: 'Let\'s make it count.', sub: 'I\'m fully online — Gemini, GPT, Claude, and the rest of the stack are ready.' },
    { wave: '🚀', line: `Hi ${USER_NAME}, Johnny Tec here —`, headline: 'Ready when you are.', sub: 'Type, talk, or attach something to get started.' },
    { wave: '👋', line: `Good to see you, ${USER_NAME}.`, headline: 'What\'s on your mind?', sub: 'I can write, explain, create, or help you solve something tricky.' },
  ];

  function renderGreeting({ wave, line, headline, sub }) {
    greetingLineEl.style.opacity = '0';
    headlineEl.style.opacity = '0';
    sublineEl.style.opacity = '0';

    window.setTimeout(() => {
      greetingLineEl.innerHTML = `<span aria-hidden="true">${wave}</span> ${line}`;
      headlineEl.textContent = headline;
      sublineEl.textContent = sub;
      greetingLineEl.style.opacity = '';
      headlineEl.style.opacity = '';
      sublineEl.style.opacity = '';
    }, 120);
  }

  async function loadGreeting() {
    try {
      const res = await fetchWithTimeout(GREETING_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: USER_NAME }),
      });
      if (!res.ok) throw new Error(`greeting endpoint returned ${res.status}`);
      const data = await res.json();
      if (!data || !data.headline) throw new Error('malformed greeting response');
      renderGreeting({
        wave: data.wave || '👋',
        line: data.line || `Hey ${USER_NAME},`,
        headline: data.headline,
        sub: data.sub || '',
      });
    } catch (err) {
      // Backend not reachable yet (or still being built) — a random
      // local variation keeps the "different every time" promise.
      const pick = GREETING_POOL[Math.floor(Math.random() * GREETING_POOL.length)];
      renderGreeting(pick);
    }
  }

  loadGreeting();

  // ==================================================================
  // 2. Quick action grid — pre-fills the input with a starter prompt
  // ==================================================================
  const inputEl = root.querySelector('#msInput');
  const inputBarEl = root.querySelector('.ms-inputbar');

  root.querySelectorAll('.ms-quick-card').forEach((card) => {
    card.addEventListener('click', () => {
      inputEl.value = card.dataset.prompt || '';
      inputEl.focus();
      inputEl.setSelectionRange(inputEl.value.length, inputEl.value.length);
      syncSendButtonState();
    });
  });

  // ==================================================================
  // 3. Popovers — notifications, avatar menu, plus/attach menu
  //    Generic open/close-on-outside-click wiring for all three.
  // ==================================================================
  function wirePopover(btnId, popoverId) {
    const btn = root.querySelector(`#${btnId}`);
    const popover = root.querySelector(`#${popoverId}`);
    if (!btn || !popover) return;

    function close() {
      popover.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
    }
    function open() {
      // Close any other open popovers first.
      root.querySelectorAll('[role="menu"]:not([hidden])').forEach((el) => { el.hidden = true; });
      root.querySelectorAll('.ms-icon-btn[aria-expanded="true"], .ms-bar-btn[aria-expanded="true"]').forEach((el) => el.setAttribute('aria-expanded', 'false'));
      popover.hidden = false;
      btn.setAttribute('aria-expanded', 'true');
    }

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (popover.hidden) open(); else close();
    });
    popover.addEventListener('click', (e) => e.stopPropagation());
    document.addEventListener('click', close);

    return { open, close };
  }

  wirePopover('msNotifBtn', 'msNotifPopover');
  wirePopover('msAvatarBtn', 'msAvatarPopover');
  const plusMenu = wirePopover('msPlusBtn', 'msPlusMenu');

  const notifDot = root.querySelector('#msNotifDot');
  root.querySelector('#msNotifBtn')?.addEventListener('click', () => {
    if (notifDot) notifDot.hidden = true;
  });

  // ---- Menu (hamburger) — opens the left bar on mobile ----
  root.querySelector('#msMenuBtn')?.addEventListener('click', () => {
    window.JT?.emit('jt:toggle-left-bar');
  });

  // ---- Theme toggle — stubbed out until a light theme exists ----
  const themeBtn = root.querySelector('#msThemeBtn');
  themeBtn?.addEventListener('click', () => {
    const pressed = themeBtn.getAttribute('aria-pressed') === 'true';
    themeBtn.setAttribute('aria-pressed', String(!pressed));
    window.JT?.emit('jt:toggle-theme', { light: !pressed });
  });

  // ==================================================================
  // 4. Attachments — plus menu (image/video/file) + paperclip shortcut
  // ==================================================================
  const fileInputEl = root.querySelector('#msFileInput');
  const attachmentsEl = root.querySelector('#msAttachments');
  const attachedFiles = [];

  function renderAttachments() {
    attachmentsEl.innerHTML = '';
    attachmentsEl.hidden = attachedFiles.length === 0;
    attachedFiles.forEach((file, i) => {
      const chip = document.createElement('div');
      chip.className = 'ms-attachment-chip';
      chip.innerHTML = `<span>${file.name}</span>`;
      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.setAttribute('aria-label', `Remove ${file.name}`);
      removeBtn.textContent = '×';
      removeBtn.addEventListener('click', () => {
        attachedFiles.splice(i, 1);
        renderAttachments();
      });
      chip.appendChild(removeBtn);
      attachmentsEl.appendChild(chip);
    });
  }

  function openFilePicker(accept) {
    fileInputEl.value = '';
    fileInputEl.accept = accept || '';
    fileInputEl.click();
  }

  fileInputEl.addEventListener('change', () => {
    Array.from(fileInputEl.files || []).forEach((f) => attachedFiles.push(f));
    renderAttachments();
  });

  root.querySelectorAll('#msPlusMenu [role="menuitem"]').forEach((item) => {
    item.addEventListener('click', () => {
      openFilePicker(item.dataset.accept);
      plusMenu?.close();
    });
  });

  root.querySelector('#msClipBtn')?.addEventListener('click', () => openFilePicker());

  // ==================================================================
  // 5. Mic — voice to text, right into the input bar
  // ==================================================================
  const micBtn = root.querySelector('#msMicBtn');
  const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognition = null;
  let isListening = false;

  if (SpeechRecognitionCtor) {
    recognition = new SpeechRecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    let baseValue = '';

    recognition.addEventListener('start', () => {
      isListening = true;
      baseValue = inputEl.value ? `${inputEl.value} ` : '';
      micBtn.setAttribute('aria-pressed', 'true');
    });

    recognition.addEventListener('result', (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      inputEl.value = baseValue + transcript;
      syncSendButtonState();
    });

    recognition.addEventListener('end', () => {
      isListening = false;
      micBtn.setAttribute('aria-pressed', 'false');
    });

    recognition.addEventListener('error', () => {
      isListening = false;
      micBtn.setAttribute('aria-pressed', 'false');
    });

    micBtn.addEventListener('click', () => {
      if (isListening) recognition.stop();
      else recognition.start();
    });
  } else {
    micBtn.disabled = true;
    micBtn.title = 'Voice input isn\'t supported in this browser';
    micBtn.style.opacity = '0.35';
  }

  // ==================================================================
  // 6. Sparkle — quick prompt ideas
  // ==================================================================
  const PROMPT_IDEAS = [
    'Summarize this in 3 bullet points: ',
    'Write a short poem about ',
    'Debug this code: ',
    'Give me 5 ideas for ',
    'Turn this into a professional email: ',
    'Explain like I\'m new to this: ',
  ];

  root.querySelector('#msSparkleBtn')?.addEventListener('click', () => {
    const idea = PROMPT_IDEAS[Math.floor(Math.random() * PROMPT_IDEAS.length)];
    inputEl.value = idea;
    inputEl.focus();
    inputEl.setSelectionRange(inputEl.value.length, inputEl.value.length);
    syncSendButtonState();
  });

  // ==================================================================
  // 7. Send / Live-conversation button — morphs based on input content
  // ==================================================================
  function syncSendButtonState() {
    const hasText = inputEl.value.trim().length > 0;
    inputBarEl.classList.toggle('has-text', hasText);
    const sendBtn = root.querySelector('#msSendBtn');
    sendBtn.setAttribute('aria-label', hasText ? 'Send message' : 'Start live conversation');
  }

  inputEl.addEventListener('input', syncSendButtonState);

  // ==================================================================
  // 8. Chat log + submit handling
  // ==================================================================
  const welcomeEl = root.querySelector('#msWelcome');
  const chatLogEl = root.querySelector('#msChatLog');
  const formEl = root.querySelector('#msInputForm');
  let conversationStarted = false;

  function activateConversationView() {
    if (conversationStarted) return;
    conversationStarted = true;
    welcomeEl.classList.add('is-hidden');
    chatLogEl.hidden = false;
  }

  function appendBubble(role, text) {
    const row = document.createElement('div');
    row.className = `ms-bubble-row is-${role}`;
    const bubble = document.createElement('div');
    bubble.className = 'ms-bubble';
    bubble.textContent = text;
    row.appendChild(bubble);
    chatLogEl.appendChild(row);
    chatLogEl.parentElement.scrollTop = chatLogEl.parentElement.scrollHeight;
    return row;
  }

  function appendTypingBubble() {
    const row = document.createElement('div');
    row.className = 'ms-bubble-row is-assistant';
    row.innerHTML = `<div class="ms-bubble is-typing"><span class="ms-typing-dot"></span><span class="ms-typing-dot"></span><span class="ms-typing-dot"></span></div>`;
    chatLogEl.appendChild(row);
    chatLogEl.parentElement.scrollTop = chatLogEl.parentElement.scrollHeight;
    return row;
  }

  // ---- The omni-input intent router ----
  // Sends the raw text to the backend router described in the project
  // architecture: it classifies intent (chat / image gen / voice / etc.)
  // and dispatches to whichever provider fits, returning a normalized
  // { type, content } shape so this file never needs to know which
  // provider (Replicate, OpenAI, Groq...) actually served the request.
  async function routeMessage(text) {
    try {
      const res = await fetchWithTimeout(ROUTE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error(`route endpoint returned ${res.status}`);
      const data = await res.json();
      return data.content || 'Done.';
    } catch (err) {
      // Backend not wired up yet — a clear placeholder so the flow is
      // demonstrable end to end without blocking on that work.
      return `(Demo response — connect ${ROUTE_ENDPOINT} to route this to the real AI stack.)\n\nYou said: "${text}"`;
    }
  }

  async function handleSend(text) {
    activateConversationView();
    appendBubble('user', text);
    inputEl.value = '';
    syncSendButtonState();

    const typingRow = appendTypingBubble();
    const reply = await routeMessage(text);
    typingRow.remove();
    appendBubble('assistant', reply);
  }

  formEl.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = inputEl.value.trim();

    if (!text) {
      // Empty input -> this is the "live conversation" button.
      window.JT?.emit('jt:open-voice-mode');
      return;
    }

    handleSend(text);
  });

  syncSendButtonState();

  // ==================================================================
  // 9. Sidebar integration — New Chat reset + module nav placeholder
  //    Voice & Audio / Image Generator / Security Recon each become
  //    their own dedicated component (own HTML/CSS/JS) in a later
  //    step; until then, this just confirms the nav actually works.
  // ==================================================================
  function resetConversation() {
    chatLogEl.innerHTML = '';
    chatLogEl.hidden = true;
    welcomeEl.classList.remove('is-hidden');
    conversationStarted = false;
    inputEl.value = '';
    syncSendButtonState();
    loadGreeting();
  }

  window.JT?.on('jt:new-chat', resetConversation);

  window.JT?.on('jt:navigate', ({ view, label }) => {
    if (view === 'chat') { resetConversation(); return; }
    activateConversationView();
    appendBubble('assistant', `${label} is coming online as its own module next — for now, ask me anything below and I'll route it for you.`);
  });
})();
 
