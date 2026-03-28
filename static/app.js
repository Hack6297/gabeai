const chatEl = document.getElementById('chat');
const formEl = document.getElementById('chat-form');
const msgEl = document.getElementById('message');
const modeEl = document.getElementById('mode');
const apiBaseEl = document.getElementById('api-base');
const bannerEl = document.getElementById('banner');

const history = [];

function normalizeBase(url) {
  if (!url) return '';
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

function detectDefaultApiBase() {
  if (window.location.protocol === 'file:') {
    bannerEl.hidden = false;
    bannerEl.textContent =
      'You opened index.html directly from disk. Set API Base to a running GabeAI server (default: http://127.0.0.1:8000).';
    return 'http://127.0.0.1:8000';
  }

  bannerEl.hidden = true;
  return window.location.origin;
}

apiBaseEl.value = detectDefaultApiBase();

function addMessage(role, content) {
  const div = document.createElement('div');
  div.className = `msg ${role}`;
  div.textContent = `${role === 'user' ? 'You' : 'GabeAI'}: ${content}`;
  chatEl.appendChild(div);
  chatEl.scrollTop = chatEl.scrollHeight;
  history.push({ role, content });
}

async function sendMessage(text) {
  const payload = {
    message: text,
    mode: modeEl.value,
    history,
  };

  const apiBase = normalizeBase(apiBaseEl.value.trim());
  const endpoint = `${apiBase}/api/chat`;

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `Request failed: ${res.status}`);
  }

  const data = await res.json();
  return data.reply;
}

formEl.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = msgEl.value.trim();
  if (!text) return;

  addMessage('user', text);
  msgEl.value = '';

  try {
    const reply = await sendMessage(text);
    addMessage('assistant', reply);
  } catch (error) {
    addMessage('assistant', `Error: ${error.message}`);
  }
});
