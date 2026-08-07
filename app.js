document.addEventListener("DOMContentLoaded", () => {
    initThemeToggle();
    initMenuHandlers();
    initActionCards();
    initPillPrompts();
    initChatSender();
});

/* 1. DARK / LIGHT MODE TOGGLE */
function initThemeToggle() {
    const themeBtn = document.getElementById("theme-btn");
    if (!themeBtn) return;

    themeBtn.addEventListener("click", () => {
        document.body.classList.toggle("light-mode");
        if (document.body.classList.contains("light-mode")) {
            themeBtn.innerText = "☀️";
        } else {
            themeBtn.innerText = "🌙";
        }
    });
}

/* 2. 3-LINES & 3-DOTS MENU TOGGLES */
function initMenuHandlers() {
    const menuBtn = document.getElementById("menu-btn");
    const moreBtn = document.getElementById("more-btn");
    const moreMenu = document.getElementById("more-menu");

    // 3-Lines Hamburger Left Drawer Toggle
    if (menuBtn) {
        menuBtn.addEventListener("click", () => {
            const leftSidebar = document.getElementById("left-sidebar");
            if (leftSidebar) {
                leftSidebar.classList.toggle("open");
            }
        });
    }

    // 3-Dots Dropdown Toggle
    if (moreBtn && moreMenu) {
        moreBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            moreMenu.classList.toggle("show");
        });

        document.addEventListener("click", () => {
            moreMenu.classList.remove("show");
        });
    }
}

/* 3. QUICK ACTION CARDS CLICK HANDLER */
function initActionCards() {
    const cards = document.querySelectorAll(".action-card");
    const chatInput = document.getElementById("chat-input");

    cards.forEach(card => {
        card.addEventListener("click", () => {
            const promptText = card.getAttribute("data-prompt");
            if (chatInput && promptText) {
                chatInput.value = promptText;
                chatInput.focus();
            }
        });
    });
}

/* 4. SUGGESTION PILLS CLICK HANDLER */
function initPillPrompts() {
    const pills = document.querySelectorAll(".pill-btn");
    const chatInput = document.getElementById("chat-input");

    pills.forEach(pill => {
        pill.addEventListener("click", () => {
            if (chatInput) {
                chatInput.value = pill.innerText;
                document.getElementById("send-btn").click();
            }
        });
    });
}

/* 5. CHAT MESSAGING ENGINE */
function initChatSender() {
    const sendBtn = document.getElementById("send-btn");
    const chatInput = document.getElementById("chat-input");
    const chatArea = document.getElementById("chat-area");

    if (!sendBtn || !chatInput) return;

    function sendMessage() {
        const text = chatInput.value.trim();
        if (!text) return;

        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // Add User Message
        const userHTML = `
            <div class="message-wrapper user-wrapper">
                <div class="message-bubble user-bubble">${text}</div>
                <div class="message-meta">${time}</div>
            </div>`;
        chatArea.innerHTML += userHTML;
        chatInput.value = "";
        chatArea.scrollTop = chatArea.scrollHeight;

        // Add Thinking Indicator
        const thinkingId = "thinking-" + Date.now();
        const thinkingHTML = `
            <div class="message-wrapper ai-wrapper" id="${thinkingId}">
                <div class="ai-avatar-icon">🤖</div>
                <div class="ai-content-box">
                    <div class="message-bubble ai-bubble" style="color:var(--text-secondary);">Johnny Tec AI is typing...</div>
                </div>
            </div>`;
        chatArea.innerHTML += thinkingHTML;
        chatArea.scrollTop = chatArea.scrollHeight;

        // Simulated AI Response (Hook Groq API fetch here)
        setTimeout(() => {
            const thinkingEl = document.getElementById(thinkingId);
            if (thinkingEl) thinkingEl.remove();

            const aiResponseHTML = `
                <div class="message-wrapper ai-wrapper">
                    <div class="ai-avatar-icon">🤖</div>
                    <div class="ai-content-box">
                        <div class="message-bubble ai-bubble">
                            I processed your request for: <strong>"${text}"</strong>. How else can I assist you?
                        </div>
                        <div class="response-actions">
                            <button class="action-pill-btn" onclick="readAloud(this)">▶ Read Aloud</button>
                            <div class="action-icons">
                                <button class="icon-action-btn" title="Copy" onclick="copyResponse(this)">📋</button>
                                <button class="icon-action-btn" title="Regenerate">🔄</button>
                                <button class="icon-action-btn" title="Like">👍</button>
                                <button class="icon-action-btn" title="Dislike">👎</button>
                            </div>
                        </div>
                        <div class="message-meta">${time}</div>
                    </div>
                </div>`;
            chatArea.innerHTML += aiResponseHTML;
            chatArea.scrollTop = chatArea.scrollHeight;
        }, 1200);
    }

    sendBtn.addEventListener("click", sendMessage);
    chatInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") sendMessage();
    });
}

/* 6. UTILITY FUNCTIONS */
function readAloud(btn) {
    const bubble = btn.closest(".ai-content-box").querySelector(".ai-bubble");
    if (bubble) {
        const utterance = new SpeechSynthesisUtterance(bubble.innerText);
        window.speechSynthesis.speak(utterance);
    }
}

function copyResponse(btn) {
    const bubble = btn.closest(".ai-content-box").querySelector(".ai-bubble");
    if (bubble) {
        navigator.clipboard.writeText(bubble.innerText);
        alert("Response copied to clipboard!");
    }
}

function clearChat() {
    const chatArea = document.getElementById("chat-area");
    if (chatArea) chatArea.innerHTML = "";
        }
