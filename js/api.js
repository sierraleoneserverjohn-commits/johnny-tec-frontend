document.addEventListener('DOMContentLoaded', () => {
  const userInput = document.getElementById('userInput');
  const sendBtn = document.getElementById('sendBtn');
  const chatConsole = document.getElementById('chatConsole');
  const welcomeSection = document.getElementById('welcomeSection');
  const autoApiToggle = document.getElementById('autoApiToggle');
  const providerSelect = document.getElementById('providerSelect');

  // Voice setup
  VoiceModule.init((transcribedText) => {
    userInput.value = transcribedText;
  });

  document.getElementById('speechToTextBtn').addEventListener('click', () => VoiceModule.startMic());
  document.getElementById('liveVoiceBtn').addEventListener('click', () => VoiceModule.openLiveOverlay());
  document.getElementById('closeLiveVoiceBtn').addEventListener('click', () => VoiceModule.closeLiveOverlay());
  document.getElementById('stopLiveListeningBtn').addEventListener('click', () => VoiceModule.closeLiveOverlay());

  // Chat Submission
  sendBtn.addEventListener('click', handleSubmit);
  userInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleSubmit(); });

  async function handleSubmit() {
    const text = userInput.value.trim();
    if (!text) return;

    welcomeSection.classList.add('hidden');
    appendMsg(text, 'user');
    userInput.value = '';

    const response = await ApiModule.execute(text, autoApiToggle.checked, providerSelect.value);
    appendMsg(response.html, 'ai');
  }

  function appendMsg(content, sender) {
    const div = document.createElement('div');
    div.className = `chat-msg ${sender}`;
    div.innerHTML = content;
    chatConsole.appendChild(div);
    chatConsole.scrollTop = chatConsole.scrollHeight;
  }
});
                          
