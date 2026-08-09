document.addEventListener('DOMContentLoaded', () => {
  const scanKeysBtn = document.getElementById('scanKeysBtn');
  const keysGrid = document.getElementById('keysGrid');
  const sendBtn = document.getElementById('sendBtn');
  const userInput = document.getElementById('userInput');
  const chatConsole = document.getElementById('chatConsole');
  const providerSelect = document.getElementById('providerSelect');

  // Auto-scan API Key Status on start
  checkApiKeys();

  scanKeysBtn.addEventListener('click', checkApiKeys);
  sendBtn.addEventListener('click', handleChat);
  userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleChat();
  });

  // -------------------------------------------------------------
  // 1. Fetch API Health Status from Backend
  // -------------------------------------------------------------
  async function checkApiKeys() {
    try {
      keysGrid.innerHTML = `<span class="key-badge pending">Scanning Render server...</span>`;
      const res = await fetch('/api/keys-status');
      const data = await res.json();

      if (data.success) {
        keysGrid.innerHTML = '';
        Object.entries(data.keys).forEach(([key, active]) => {
          const badge = document.createElement('span');
          badge.className = `key-badge ${active ? 'valid' : 'invalid'}`;
          badge.textContent = `${active ? '✓' : '✗'} ${key}`;
          keysGrid.appendChild(badge);
        });
      }
    } catch (err) {
      keysGrid.innerHTML = `<span class="key-badge invalid">Offline / Error scanning keys</span>`;
    }
  }

  // -------------------------------------------------------------
  // 2. Submit Chat Message to Active Provider
  // -------------------------------------------------------------
  async function handleChat() {
    const message = userInput.value.trim();
    if (!message) return;

    appendMessage('User', message, 'user-msg');
    userInput.value = '';

    const provider = providerSelect.value;
    
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, provider })
      });
      const data = await res.json();

      if (data.success) {
        appendMessage(`AI (${data.provider})`, data.reply, 'ai-msg');
      } else {
        appendMessage('System Error', data.error, 'system-msg');
      }
    } catch (err) {
      appendMessage('System Error', 'Failed to reach server backend.', 'system-msg');
    }
  }

  function appendMessage(sender, text, className) {
    const msgDiv = document.createElement('div');
    msgDiv.className = className;
    msgDiv.innerHTML = `<strong>[${sender}]:</strong> ${text}`;
    chatConsole.appendChild(msgDiv);
    chatConsole.scrollTop = chatConsole.scrollHeight;
  }
});
