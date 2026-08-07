// --- GROQ API SETTINGS ---
const GROQ_API_KEY = "PASTE_YOUR_GROQ_API_KEY_HERE"; // Get this from console.groq.com
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL_NAME = "llama-3.1-70b-versatile"; // The fastest Llama model on Groq

// Function to send messages to Groq AI
async function fetchGroqResponse(userMessage) {
    try {
        const response = await fetch(GROQ_API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${GROQ_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: MODEL_NAME,
                messages: [{ role: "user", content: userMessage }]
            })
        });

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error("Groq API Error:", error);
        return "Error: Could not connect to Johnny Tec AI.";
    }
}

// Handle Send Button Click
document.addEventListener("DOMContentLoaded", () => {
    // Wait a second for the HTML components to load first
    setTimeout(() => {
        const sendBtn = document.getElementById("send-btn");
        const chatInput = document.getElementById("chat-input");
        const chatArea = document.getElementById("chat-area");

        if(sendBtn) {
            sendBtn.addEventListener("click", async () => {
                const text = chatInput.value.trim();
                if (!text) return;

                // Add User Bubble
                chatArea.innerHTML += `<div class="chat-bubble user-bubble">${text}</div>`;
                chatInput.value = "";
                
                // Show thinking...
                chatArea.innerHTML += `<div class="chat-bubble ai-bubble" id="thinking">Johnny Tec is thinking...</div>`;
                chatArea.scrollTop = chatArea.scrollHeight;

                // Call Groq API
                const aiResponse = await fetchGroqResponse(text);
                
                // Remove thinking and add AI Bubble
                document.getElementById("thinking").remove();
                chatArea.innerHTML += `<div class="chat-bubble ai-bubble">${aiResponse}</div>`;
                chatArea.scrollTop = chatArea.scrollHeight;
            });
        }
    }, 1500); // 1.5 second delay to ensure layout is fetched
});
        
