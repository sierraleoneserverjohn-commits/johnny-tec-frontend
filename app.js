document.addEventListener("DOMContentLoaded", () => {
    loadLoadingScreen();
});

// Load 15s Loading Screen Component
function loadLoadingScreen() {
    fetch('loading.html')
        .then(res => res.text())
        .then(html => {
            document.getElementById('root').innerHTML = html;
            runCounter();
            
            // Wait 15 seconds, then load the Home Dashboard layout
            setTimeout(() => {
                loadHomeScreen();
            }, 15000);
        });
}

// Increment Percentage Counter during loading
function runCounter() {
    let percent = 0;
    const interval = setInterval(() => {
        const el = document.getElementById('percent-text');
        if (el && percent < 100) {
            percent++;
            el.innerText = percent + '%';
        } else {
            clearInterval(interval);
        }
    }, 150);
}

// Load Home Layout & Sidebar Components
function loadHomeScreen() {
    fetch('home.html')
        .then(res => res.text())
        .then(html => {
            document.getElementById('root').innerHTML = html;

            // Fetch Left Sidebar
            fetch('left.html')
                .then(res => res.text())
                .then(data => { document.getElementById('left-sidebar').innerHTML = data; });

            // Fetch Right Sidebar
            fetch('right.html')
                .then(res => res.text())
                .then(data => { document.getElementById('right-sidebar').innerHTML = data; });

            // Initialize Groq Chat Listener
            initChatEngine();
        });
}

// Groq API Communication Logic
function initChatEngine() {
    const GROQ_API_KEY = "PASTE_YOUR_GROQ_API_KEY_HERE"; 
    
    // Wait briefly for DOM injection to settle
    setTimeout(() => {
        const sendBtn = document.getElementById("send-btn");
        const chatInput = document.getElementById("chat-input");
        const chatArea = document.getElementById("chat-area");

        if (!sendBtn) return;

        sendBtn.addEventListener("click", async () => {
            const text = chatInput.value.trim();
            if (!text) return;

            // Add User Bubble
            chatArea.innerHTML += `<div class="chat-bubble user-bubble">${text}</div>`;
            chatInput.value = "";
            
            // Add Thinking Indicator
            chatArea.innerHTML += `<div class="chat-bubble ai-bubble" id="thinking">Johnny Tec AI is thinking...</div>`;
            chatArea.scrollTop = chatArea.scrollHeight;

            try {
                const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${GROQ_API_KEY}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        model: "llama-3.1-70b-versatile",
                        messages: [{ role: "user", content: text }]
                    })
                });

                const data = await response.json();
                document.getElementById("thinking").remove();
                
                const reply = data.choices[0].message.content;
                chatArea.innerHTML += `<div class="chat-bubble ai-bubble">${reply}</div>`;
            } catch (err) {
                if (document.getElementById("thinking")) {
                    document.getElementById("thinking").remove();
                }
                chatArea.innerHTML += `<div class="chat-bubble ai-bubble" style="color:#ff4444;">Error connecting to Groq API. Check your API key.</div>`;
            }
            chatArea.scrollTop = chatArea.scrollHeight;
        });
    }, 500);
}
