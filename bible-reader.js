// bible-reader.js

document.addEventListener('DOMContentLoaded', () => {
    initAuth();
    initHighlighting();
    initAI();
});

// --- Auth Logic ---
function initAuth() {
    const signinBtn = document.getElementById('signin-btn');
    const authModal = document.getElementById('auth-modal');
    const closeAuth = document.getElementById('close-auth');
    const authForm = document.getElementById('auth-form');
    const createAccountBtn = document.getElementById('create-account-btn');
    const authTitle = authModal ? authModal.querySelector('h2') : null;
    const authSubmitBtn = authForm ? authForm.querySelector('button[type="submit"]') : null;

    let isSignUp = false;

    if (signinBtn) {
        signinBtn.addEventListener('click', (e) => {
            e.preventDefault();
            authModal.style.display = 'flex';
        });
    }

    if (closeAuth) {
        closeAuth.addEventListener('click', () => {
            authModal.style.display = 'none';
        });
    }

    if (createAccountBtn) {
        createAccountBtn.addEventListener('click', () => {
            isSignUp = !isSignUp;
            if (isSignUp) {
                authTitle.textContent = 'Create Account';
                authSubmitBtn.textContent = 'Sign Up';
                createAccountBtn.textContent = 'Already have an account? Sign In';
            } else {
                authTitle.textContent = 'Join Rooted Daily';
                authSubmitBtn.textContent = 'Sign In';
                createAccountBtn.textContent = 'Create Account';
            }
        });
    }

    if (authForm) {
        authForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const action = isSignUp ? 'Account created' : 'Welcome back';
            alert(`${action}! successful for ${email}. (Note: This is a demo; real Supabase integration requires keys)`);
            authModal.style.display = 'none';
            if (signinBtn) signinBtn.textContent = 'Account';
        });
    }
}

// --- Highlighting Logic ---
function initHighlighting() {
    const verses = document.querySelectorAll('.verse');
    const menu = document.getElementById('highlight-menu');
    let selectedVerse = null;

    verses.forEach(verse => {
        verse.addEventListener('mouseup', (e) => {
            const selection = window.getSelection();
            if (selection.toString().length > 0) {
                selectedVerse = verse;
                menu.style.display = 'flex';
                menu.style.top = `${e.pageY - 50}px`;
                menu.style.left = `${e.pageX}px`;
            } else {
                menu.style.display = 'none';
            }
        });
    });

    document.addEventListener('mousedown', (e) => {
        if (!menu.contains(e.target) && !e.target.classList.contains('verse')) {
            menu.style.display = 'none';
        }
    });

    document.getElementById('btn-highlight').addEventListener('click', () => {
        if (selectedVerse) {
            selectedVerse.classList.toggle('highlighted');
            menu.style.display = 'none';
            saveHighlight(selectedVerse.querySelector('.verse-num').textContent);
        }
    });

    document.getElementById('btn-reflect').addEventListener('click', () => {
        if (selectedVerse) {
            const text = selectedVerse.textContent;
            openAIChat(`Reflect on this verse: ${text}`);
            menu.style.display = 'none';
        }
    });
}

function saveHighlight(verseNum) {
    const chapter = document.title.split('|')[0].trim();
    let highlights = JSON.parse(localStorage.getItem('rooted_highlights') || '[]');
    highlights.push({ chapter, verseNum, date: new Date().toISOString() });
    localStorage.setItem('rooted_highlights', JSON.stringify(highlights));
}

// --- AI Logic ---
function initAI() {
    const bubble = document.getElementById('ai-bubble');
    const chatWindow = document.getElementById('ai-chat-window');
    const closeChat = document.getElementById('close-chat');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const messages = document.getElementById('chat-messages');

    if (bubble) {
        bubble.addEventListener('click', () => {
            chatWindow.style.display = chatWindow.style.display === 'flex' ? 'none' : 'flex';
        });
    }

    if (closeChat) {
        closeChat.addEventListener('click', () => {
            chatWindow.style.display = 'none';
        });
    }

    if (chatForm) {
        chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const text = chatInput.value;
            if (!text) return;

            addMessage(text, 'user');
            chatInput.value = '';

            setTimeout(() => {
                addMessage("I'm Rooted, your AI Bible companion. This is a demo of how I can help you reflect on scripture. In the full version, I'll provide deep insights based on the context of this passage.", 'ai');
            }, 1000);
        });
    }
}

function openAIChat(initialMessage) {
    const chatWindow = document.getElementById('ai-chat-window');
    chatWindow.style.display = 'flex';
    if (initialMessage) {
        addMessage(initialMessage, 'user');
        setTimeout(() => {
            addMessage("That's a profound verse. How does it speak to your heart today?", 'ai');
        }, 1000);
    }
}

function addMessage(text, sender) {
    const messages = document.getElementById('chat-messages');
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', sender);
    msgDiv.textContent = text;
    messages.appendChild(msgDiv);
    messages.scrollTop = messages.scrollHeight;
}
