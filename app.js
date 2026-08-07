const sendBtn = document.getElementById('send-btn');
const userInput = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');

sendBtn.addEventListener('click', sendMessage);

function sendMessage() {
    const text = userInput.value.trim();
    if (text === '') return;

    // Create the user message bubble
    const userMessage = document.createElement('div');
    userMessage.classList.add('message', 'user-message');
    userMessage.textContent = text;
    
    // Add it to the screen and clear the input
    chatBox.appendChild(userMessage);
    userInput.value = '';

    // Scroll to the bottom
    chatBox.scrollTop = chatBox.scrollHeight;

    // TODO for later: Send this text to the backend!
}
