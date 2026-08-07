document.addEventListener("DOMContentLoaded", () => {
    setupThemeToggle();
    setupDropdownMenu();
    setupQuickCards();
    setupPills();
    setupMessageSender();
});

/* 1. Dark/Light Mode Switcher */
function setupThemeToggle() {
    const themeBtn = document.getElementById("theme-btn");
    if (!themeBtn) return;

    themeBtn.addEventListener("click", () => {
        document.body.classList.toggle("light-theme");
        themeBtn.innerText = document.body.classList.contains("light-theme") ? "☀️" : "🌙";
    });
}

/* 2. 3-Dots Dropdown Toggle */
function setupDropdownMenu() {
    const moreBtn = document.getElementById("more-btn");
    const dropdown = document.getElementById("more-dropdown");

    if (moreBtn && dropdown) {
        moreBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            dropdown.classList.toggle("active");
        });

        document.addEventListener("click", () => {
            dropdown.classList.remove("active");
        });
    }
}

/* 3. Action Cards */
function setupQuickCards() {
    const cards = document.querySelectorAll(".action-card");
    const input = document.getElementById("chat-input");

    cards.forEach(card => {
        card.addEventListener("click", () => {
            const prompt = card.getAttribute("data-prompt");
            if (input && prompt) {
                input.value = prompt;
                input.focus();
            }
        });
    });
}

/* 4. Suggestion Pills */
function setupPills() {
    const pills = document.querySelectorAll(".suggestion-pill");
    const input = document.getElementById("chat-input");

    pills.forEach(pill => {
        pill.addEventListener("click", () => {
            if (input) {
                input.value = pill.innerText;
                document.getElementById("send-btn").click();
            }
        });
    });
}

/* 5. Chat Engine */
function setupMessageSender() {
    const sendBtn = document.getElementById("send-btn");
    const chatInput = document.getElementById("chat-input");
    const chatArea = document.getElementById("chat-area");

    if (!sendBtn || !chatInput) return;

    function send() {
        const val = chatInput.value.trim();
        if (!val) return;

        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // User Message
        chatArea.innerHTML += `
            <div class="chat-row user-row">
                <div class="user-bubble-container">
                    <div class="message-bubble user-bubble">${val}</div>
                    <div class="timestamp">${time}</div>
                </div>
                <div class="chat-avatar user-thumb">👤</div>
            </div>`;

        chatInput.value = "";
        chatArea.scrollTop = chatArea.scrollHeight;
    }

    sendBtn.addEventListener("click", send);
    chatInput.addEventListener("keypress", (e) => { if (e.key === "Enter") send(); });
}

function readAloud(btn) {
    const text = btn.closest(".ai-bubble-container").querySelector(".ai-bubble").innerText;
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
}

function copyResponse(btn) {
    const text = btn.closest(".ai-bubble-container").querySelector(".ai-bubble").innerText;
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
}

function clearChat() {
    const chatArea = document.getElementById("chat-area");
    if (chatArea) chatArea.innerHTML = "";
}
