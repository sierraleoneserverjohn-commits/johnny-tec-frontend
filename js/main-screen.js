/**
 * Main chat screen — composer submission, quick-action prompts,
 * message rendering, and the topbar controls (menu / theme / avatar).
 *
 * NOTE: `getAssistantReply()` is a stub. Swap its body for a real call
 * to your AI backend/API when one is wired up — everything else
 * (rendering, scrolling, typing indicator) already works against it.
 */

const FOLLOW_UPS = [
  'Can you give an example?',
  'How does this work in practice?',
  'What are the real-world applications?',
  'Explain more simply',
];

let chatLog, chatScroll, greeting, suggestions, composerInput;

// SYSTEM STATE: Set this to true when you hook up your local API or OpenAI/Gemini
let isApiConnected = false; 

export function init() {
  const root = document.getElementById('main-screen');
  if (!root) return;

  chatLog = root.querySelector('#chatLog');
  chatScroll = root.querySelector('#chatScroll');
  greeting = root.querySelector('#greeting');
  suggestions = root.querySelector('#suggestions');
  composerInput = root.querySelector('#composerInput');
  const composer = root.querySelector('#composer');

  if (composer) {
    composer.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = composerInput.value.trim();
      if (!text) return;
      sendMessage(text);
      composerInput.value = '';
    });
  }

  root.querySelectorAll('.quick-card').forEach((card) => {
    card.addEventListener('click', () => {
      if (composerInput) {
        composerInput.value = card.dataset.prompt || '';
        composerInput.focus();
      }
    });
  });

  root.querySelector('#menuToggle')?.addEventListener('click', () => {
    document.dispatchEvent(new CustomEvent('jt:toggle-left-bar'));
  });

  root.querySelector('#themeToggle')?.addEventListener('click', () => {
    document.body.classList.toggle('theme-light');
  });

  root.querySelector('#rightBarToggle')?.addEventListener('click', () => {
    document.dispatchEvent(new CustomEvent('jt:toggle-right-bar'));
  });

  document.addEventListener('jt:new-chat', resetChat);

  // --- NEW WIRING: Listen for Sidebar Navigation ---
  document.addEventListener('jt:switch-view', (e) => {
    loadView(e.detail, root);
  });

  // Wire up the standalone mic buttons if they exist in the UI
  wireVoiceButtons(root);
}

// --- NEW WIRING: Router logic to swap sub-files ---
async function loadView(viewName, rootElement) {
  // Map the 'chat' button back to the main-screen component
  const fileName = viewName === 'chat' ? 'main-screen' : viewName;
  
  try {
    const response = await fetch(`components/${fileName}.html`);
    if (!response.ok) throw new Error(`Component ${fileName} not found`);
    
    const html = await response.text();
    rootElement.innerHTML = html;
    
    // Re-bind all the buttons and chat logic if we navigate back to the main chat
    if (viewName === 'chat') {
      setTimeout(init, 50); 
    }
  } catch (error) {
    console.error("Routing Error:", error);
    rootElement.innerHTML = `<div class="error" style="padding: 2rem; color: #ff5555; text-align: center;">Failed to load UI view: ${viewName}. Make sure components/${fileName}.html exists.</div>`;
  }
}

function sendMessage(text) {
  greeting?.setAttribute('hidden', '');
  appendMessage('user', text);
  const typingEl = appendTyping();

  // Simulated latency before the assistant "responds"
  setTimeout(() => {
    // API CHECK FALLBACK LOGIC
    if (!isApiConnected) {
      const offlineReply = "⚠️ SYSTEM ALERT: JT API Engine is currently disconnected. Please configure your API endpoint in the Right Sidebar settings to initiate live data stream.";
      resolveTyping(typingEl, offlineReply);
      
      // Dispatch offline event so the left-sidebar can turn the status dot red
      window.dispatchEvent(new Event('jt-api-offline'));
    } else {
      // Normal flow when API is connected
      const reply = getAssistantReply(text);
      resolveTyping(typingEl, reply);
      renderSuggestions();
    }
  }, 900 + Math.random() * 500);
}

function appendMessage(role, text) {
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const el = document.createElement('div');
  el.className = `msg msg-${role}`;

  const avatar = role === 'user'
    ? `<img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Johnny&backgroundColor=0a0a1c" alt="">`
    : `🤖`;

  el.innerHTML = `
    <span class="msg-avatar">${avatar}</span>
    <div class="msg-body">
      <div class="msg-bubble">${escapeHtml(text)}</div>
      <span class="msg-time">${time}</span>
      ${role === 'assistant' ? assistantActionsHtml() : ''}
    </div>
  `;
  chatLog.appendChild(el);
  scrollToBottom();
  return el;
}

function appendTyping() {
  const el = document.createElement('div');
  el.className = 'msg msg-assistant';
  el.innerHTML = `
    <span class="msg-avatar">🤖</span>
    <div class="msg-body">
      <div class="msg-bubble"><div class="typing-indicator"><span></span><span></span><span></span></div></div>
    </div>
  `;
  chatLog.appendChild(el);
  scrollToBottom();
  return el;
}

function resolveTyping(typingEl, replyText) {
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  typingEl.querySelector('.msg-body').innerHTML = `
    <div class="msg-bubble">${replyText}</div>
    <span class="msg-time">${time}</span>
    ${assistantActionsHtml()}
  `;
  scrollToBottom();
}

function assistantActionsHtml() {
  return `
    <div class="msg-actions">
      <button class="read-aloud" type="button" aria-label="Read aloud">
        <svg viewBox="0 0 24 24"><path d="m5 9 4 0 5-4v14l-5-4-4 0Z"/></svg> Read Aloud
      </button>
      <button type="button" aria-label="Copy"><svg viewBox="0 0 24 24"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg></button>
      <button type="button" aria-label="Regenerate"><svg viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 1 3 6.7"/><path d="M3 4v6h6"/></svg></button>
      <button type="button" aria-label="Good response"><svg viewBox="0 0 24 24"><path d="M7 11v10H4a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1h3Zm0 0 4-8a2 2 0 0 1 4 2v5h4.5a2 2 0 0 1 2 2.4l-1.4 7A2 2 0 0 1 18.1 21H7"/></svg></button>
      <button type="button" aria-label="Poor response"><svg viewBox="0 0 24 24"><path d="M17 13V3h3a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-3Zm0 0-4 8a2 2 0 0 1-4-2v-5H4.5a2 2 0 0 1-2-2.4l1.4-7A2 2 0 0 1 5.9 3H17"/></svg></button>
    </div>
  `;
}

function renderSuggestions() {
  if (!suggestions) return;
  suggestions.innerHTML = FOLLOW_UPS
    .map((q) => `<button class="suggestion-chip" type="button">${q}</button>`)
    .join('');
  suggestions.hidden = false;
  suggestions.querySelectorAll('.suggestion-chip').forEach((chip) => {
    chip.addEventListener('click', () => sendMessage(chip.textContent));
  });
}

function resetChat() {
  if (chatLog) chatLog.innerHTML = '';
  if (suggestions) {
    suggestions.hidden = true;
    suggestions.innerHTML = '';
  }
  greeting?.removeAttribute('hidden');
}

function scrollToBottom() {
  requestAnimationFrame(() => {
    if (chatScroll) chatScroll.scrollTop = chatScroll.scrollHeight;
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Stub reply generator — swap for a real API call.
function getAssistantReply(prompt) {
  return `Here's a starting point on "${escapeHtml(prompt)}" — connect a real AI backend in <code>getAssistantReply()</code> (main-screen.js) to replace this placeholder with live answers.`;
}

// --- WIRING UP THE VOICE INTERFACE BUTTONS ---
function wireVoiceButtons(root) {
  const navVoiceBtn = root.querySelector('#nav-voice-btn');
  const chatMicBtn = root.querySelector('#chat-mic-btn');

  if (navVoiceBtn) {
    navVoiceBtn.addEventListener('click', openVoiceInterface);
  }
  if (chatMicBtn) {
    chatMicBtn.addEventListener('click', openVoiceInterface);
  }
}

function openVoiceInterface() {
  // Replaced window.location.href with the central SPA event
  document.dispatchEvent(new CustomEvent('jt:open-voice'));
}


// --- WIRING UP THE READ ALOUD BUTTON ---
document.addEventListener('click', function(e) {
    // WIRED: Updated class to match the button in assistantActionsHtml()
    const readAloudBtn = e.target.closest('.read-aloud');
    
    if (readAloudBtn) {
        // WIRED: Updated classes to match the structure in appendMessage()
        const messageBox = e.target.closest('.msg-body');
        
        if (messageBox) {
            const textToRead = messageBox.querySelector('.msg-bubble').innerText;
            
            // Use the browser's built-in voice
            const speech = new SpeechSynthesisUtterance(textToRead);
            
            // Optional: Make it sound a bit more robotic/AI-like
            speech.rate = 1.0; 
            speech.pitch = 1.1; 
            
            window.speechSynthesis.speak(speech);
        }
    }
});
async function loadView(viewName, rootElement) {
  // Map short nav names from left-bar.html to your actual component filenames
  const viewMap = {
    'chat': 'main-screen',
    'code': 'code-assistant',    // Maps data-nav="code" to components/code-assistant.html
    'image': 'image-generator',  // Maps data-nav="image" to components/image-generator.html
    'dashboard': 'main-screen',  // Or create dashboard.html later
    'documents': 'documents',
    'knowledge': 'knowledge',
    'history': 'history'
  };

  const fileName = viewMap[viewName] || viewName;
  
  try {
    const response = await fetch(`components/${fileName}.html`);
    if (!response.ok) throw new Error(`Component ${fileName} not found`);
    
    const html = await response.text();
    rootElement.innerHTML = html;
    
    // Re-bind chat logic if returning to chat/dashboard
    if (viewName === 'chat' || viewName === 'dashboard') {
      setTimeout(init, 50); 
    }
  } catch (error) {
    console.error("Routing Error:", error);
    rootElement.innerHTML = `<div class="error" style="padding: 2rem; color: #ff5555; text-align: center;">Failed to load UI view: ${viewName}. Make sure components/${fileName}.html exists.</div>`;
  }
}

    
