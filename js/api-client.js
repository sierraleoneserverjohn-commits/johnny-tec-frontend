// JS/API-CLIENT.JS - Live Backend Connector
const API_BASE_URL = 'https://johnny-tec-backend-in37.onrender.com/api';
const SESSION_ID = localStorage.getItem('jt_session_id') || `session_${Date.now()}`;
localStorage.setItem('jt_session_id', SESSION_ID);

// 1. CHAT API CALL (Supports Groq, GPT, Claude switching)
export async function sendChatMessage(message, provider = 'groq') {
  try {
    const res = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: SESSION_ID,
        message: message,
        provider: provider
      })
    });
    
    const data = await res.json();
    return data.reply;
  } catch (err) {
    console.error('Chat API Error:', err);
    return "⚠️ Server connection error. Please try again.";
  }
}

// 2. IMAGE GENERATION API CALL
export async function generateAIImage(prompt) {
  try {
    const res = await fetch(`${API_BASE_URL}/generate-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    
    const data = await res.json();
    return data.imageUrl;
  } catch (err) {
    console.error('Image API Error:', err);
    return null;
  }
}

// 3. LIVE VOICE WEBSOCKET CONNECTOR
export function connectLiveVoiceSocket(onAudioReceived) {
  const wsUrl = API_BASE_URL.replace('https://', 'wss://').replace('/api', '');
  const socket = new WebSocket(wsUrl);

  socket.onopen = () => {
    console.log('🎙️ Connected to Johnny Tec Live Voice WebSocket');
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (onAudioReceived) onAudioReceived(data);
  };

  socket.onerror = (err) => console.error('WebSocket Error:', err);

  return socket;
                  }
