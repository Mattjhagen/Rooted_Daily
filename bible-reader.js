// bible-reader.js

// Configuration
const SUPABASE_URL = 'https://xphxtkdsshqsddajzlkj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwaHh0a2Rzc2hxc2RkYWp6bGtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4Mzg1MzksImV4cCI6MjA5MTQxNDUzOX0.zkXqNnFkOxkYEkQh8pYpsfUMdJMd8ri_Bta5_Jn_8lg'; // ADDED REAL ANON KEY
const AI_PROXY_URL = 'https://rooted-ai.mattjhagen.workers.dev';

let supabaseClient = null;
if (SUPABASE_ANON_KEY) {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

document.addEventListener('DOMContentLoaded', () => {
    initAuth();
    initHighlighting();
    initAI();
    checkUser();
});

async function checkUser() {
    if (!supabaseClient) return;
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (user) {
        const signinBtn = document.getElementById('signin-btn');
        if (signinBtn) signinBtn.textContent = 'Account';
        loadHighlights(user.id);
    }
}

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
        authForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            if (!supabaseClient) {
                alert(`Demo Mode: ${isSignUp ? 'Account created' : 'Welcome back'}! (To enable real auth, add your SUPABASE_ANON_KEY to bible-reader.js)`);
                authModal.style.display = 'none';
                if (signinBtn) signinBtn.textContent = 'Account';
                return;
            }

            try {
                let result;
                if (isSignUp) {
                    result = await supabaseClient.auth.signUp({ email, password });
                } else {
                    result = await supabaseClient.auth.signInWithPassword({ email, password });
                }

                if (result.error) throw result.error;

                alert(isSignUp ? 'Account created! Please check your email.' : 'Welcome back!');
                authModal.style.display = 'none';
                if (signinBtn) signinBtn.textContent = 'Account';
                loadHighlights(result.data.user.id);
            } catch (err) {
                alert(err.message);
            }
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
            saveHighlight(selectedVerse.querySelector('.verse-num').textContent, selectedVerse.textContent);
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

async function saveHighlight(verseNum, text) {
    const chapter = document.title.split('|')[0].trim();
    
    // Local fallback
    let highlights = JSON.parse(localStorage.getItem('rooted_highlights') || '[]');
    highlights.push({ chapter, verseNum, date: new Date().toISOString() });
    localStorage.setItem('rooted_highlights', JSON.stringify(highlights));

    // Supabase sync
    if (supabaseClient) {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (user) {
            await supabaseClient.from('highlights').upsert({
                user_id: user.id,
                reference: `${chapter}:${verseNum}`,
                content: text,
                created_at: new Date().toISOString()
            });
        }
    }
}

async function loadHighlights(userId) {
    if (!supabaseClient) return;
    const { data, error } = await supabaseClient
        .from('highlights')
        .select('*')
        .eq('user_id', userId);
    
    if (data) {
        const chapter = document.title.split('|')[0].trim();
        data.forEach(h => {
            if (h.reference.startsWith(chapter)) {
                const verseNum = h.reference.split(':')[1];
                const verseEl = Array.from(document.querySelectorAll('.verse-num'))
                    .find(el => el.textContent === verseNum);
                if (verseEl) verseEl.parentElement.classList.add('highlighted');
            }
        });
    }
}

// --- AI Logic ---
function initAI() {
    const bubble = document.getElementById('ai-bubble');
    const chatWindow = document.getElementById('ai-chat-window');
    const closeChat = document.getElementById('close-chat');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');

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
        chatForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const text = chatInput.value;
            if (!text) return;

            addMessage(text, 'user');
            chatInput.value = '';

            try {
                const response = await callAIProxy([{ role: 'user', content: text }]);
                addMessage(response, 'ai');
            } catch (err) {
                console.error('AI Proxy Error:', err);
                addMessage("I'm having trouble connecting to my thoughts right now. Please try again in a moment.", 'ai');
            }
        });
    }
}

async function callAIProxy(messages) {
    const response = await fetch(AI_PROXY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages })
    });

    if (!response.ok) throw new Error('AI Proxy failed');
    const data = await response.json();
    return data.choices?.[0]?.message?.content || data.text || "I'm not sure how to respond to that.";
}

function openAIChat(initialMessage) {
    const chatWindow = document.getElementById('ai-chat-window');
    chatWindow.style.display = 'flex';
    if (initialMessage) {
        addMessage(initialMessage, 'user');
        callAIProxy([{ role: 'user', content: initialMessage }])
            .then(response => addMessage(response, 'ai'))
            .catch(() => addMessage("That's a profound verse. How does it speak to your heart today?", 'ai'));
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
