const FOLLOW_UPS = [
  'Can you give an example?',
  'How does this work in practice?',
  'What are the real-world applications?',
  'Explain more simply',
];

let chatLog, chatScroll, greeting, suggestions, composerInput;
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

  document.addEventListener('jt:new-chat', resetChat);

  // --- FIX 1: BULLETPROOF ROUTING & EVENT DELEGATION ---
  if (!window.hasGlobalListeners) {
    
    // 1. Sidebar Navigation Listener
    document.addEventListener('jt:switch-view', (e) => {
      loadView(e.detail, document.getElementById('main-screen'));
    });

    // 2. Fixed 3-Dots Right Bar Toggle (Works on every page!)
    document.addEventListener('click', (e) => {
      if (e.target.closest('#rightBarToggle')) {
        document.dispatchEvent(new CustomEvent('jt:toggle-right-bar'));
      }
    });

    // 3. FAKE VOICE API HOOK
    // This listens for any button that says "Stop Listening"
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (btn && btn.textContent.includes('Stop Listening')) {
        // Hide visualizer (assumes you have a way to close it, or we force it)
        const visualizer = document.getElementById('voice-visualizer');
        if (visualizer) visualizer.hidden = true;
        
        // Jump back to chat and send fake voice message
        document.dispatchEvent(new CustomEvent('jt:switch-view', { detail: 'chat' }));
        setTimeout(() => {
          sendMessage("🎤 [Voice Note Captured]");
        }, 300);
      }
    });

    // 4. Read Aloud Listener
    document.addEventListener('click', function(e) {
      const readAloudBtn = e.target.closest('.read-aloud');
      if (readAloudBtn) {
          const messageBox = e.target.closest('.msg-body');
          if (messageBox) {
              const textToRead = messageBox.querySelector('.msg-bubble').innerText;
              const speech = new SpeechSynthesisUtterance(textToRead);
              speech.rate = 1.0; 
              speech.pitch = 1.1; 
              window.speechSynthesis.speak(speech);
          }
      }
    });

    window.hasGlobalListeners = true;
  }

  wireVoiceButtons(root);
}

// --- ROUTER LOGIC ---
async function loadView(viewName, rootElement) {
  const viewMap = {
    'chat': 'main-screen',
    'code': 'code-assistant',      
    'image': 'image-generator',    
    'documents': 'documents',      
    'knowledge': 'knowledge',      
    'voice': 'voice-assistant',
    'history': 'history'           
  };

  const fileName = viewMap[viewName] || viewName;
  
  try {
    const response = await fetch(`components/${fileName}.html`);
    if (!response.ok) throw new Error(`Component ${fileName}.html not found`);
    
    const html = await response.text();
    rootElement.innerHTML = html;
    
    if (viewName === 'chat') {
      setTimeout(init, 50); 
    }
  } catch (error) {
    console.error("Routing Error:", error);
    rootElement.innerHTML = `
      <div class="error" style="padding: 2rem; color: #ff5555; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%;">
        <h3>View Not Found</h3>
        <p>Make sure you created: <code>components/${fileName}.html</code></p>
      </div>`;
  }
}

function sendMessage(text) {
  greeting?.setAttribute('hidden', '');
  appendMessage('user', text);
  const typingEl = appendTyping();

  setTimeout(() => {
    if (!isApiConnected) {
      // Custom fake response if they used the microphone
      if (text.includes("Voice Note Captured")) {
        resolveTyping(typingEl, "I heard you, bro! But my Voice-to-Text API and main brain aren't connected to the server yet. Hook up the API keys in the settings to enable live voice processing!");
      } else {
        const offlineReply = "⚠️ SYSTEM ALERT: JT API Engine is currently disconnected. Please configure your API endpoint in the Right Sidebar settings.";
        resolveTyping(typingEl, offlineReply);
      }
    } else {
      const reply = getAssistantReply(text);
      resolveTyping(typingEl, reply);
      renderSuggestions();
    }
  }, 1000 + Math.random() * 500);
}

function appendMessage(role, text) {
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const el = document.createElement('div');
  el.className = `msg msg-${role}`;
  const avatar = role === 'user' ? `<img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Johnny&backgroundColor=0a0a1c" alt="">` : `🤖`;

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
    </div>
  `;
}

function renderSuggestions() {
  if (!suggestions) return;
  suggestions.innerHTML = FOLLOW_UPS.map((q) => `<button class="suggestion-chip" type="button">${q}</button>`).join('');
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

function getAssistantReply(prompt) {
  return `Here's a starting point on "${escapeHtml(prompt)}" — connect a real AI backend to replace this placeholder.`;
}

function wireVoiceButtons(root) {
  const chatMicBtn = root.querySelector('#chat-mic-btn');
  if (chatMicBtn) {
    chatMicBtn.addEventListener('click', openVoiceInterface);
  }
}

function openVoiceInterface() {
  document.dispatchEvent(new CustomEvent('jt:open-voice'));
    }
