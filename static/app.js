const chatEl = document.getElementById('chat');
const formEl = document.getElementById('chat-form');
const msgEl = document.getElementById('message');
const modeEl = document.getElementById('mode');
const apiBaseEl = document.getElementById('api-base');
const bannerEl = document.getElementById('banner');
const clearBtnEl = document.getElementById('clear-chat');

const history = [];

function normalizeBase(url) {
  if (!url) return '';
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

function renderBanner(text = '') {
  if (!text) {
    bannerEl.hidden = true;
    bannerEl.textContent = '';
    return;
  }
  bannerEl.hidden = false;
  bannerEl.textContent = text;
}

function detectDefaultApiBase() {
  if (window.location.protocol === 'file:') {
    renderBanner(
      'Running from file:// mode. Set API Base to your backend (default: http://127.0.0.1:8000).'
    );
    return 'http://127.0.0.1:8000';
  }

  renderBanner('');
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

function clearChat() {
  history.length = 0;
  chatEl.innerHTML = '';
  renderBanner('Chat history cleared.');
  setTimeout(() => {
    if (window.location.protocol === 'file:') return;
    renderBanner('');
  }, 1500);
}

async function sendMessage(text) {
  const apiBase = normalizeBase(apiBaseEl.value.trim());
  if (!apiBase) {
    throw new Error('API Base is required (example: http://127.0.0.1:8000).');
  }

  const payload = {
    message: text,
    mode: modeEl.value,
    history,
  };

  const endpoint = `${apiBase}/api/chat`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(err || `Request failed: ${response.status}`);
  }

  const data = await response.json();
  return data.reply;
}

formEl.addEventListener('submit', async (event) => {
  event.preventDefault();

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

clearBtnEl.addEventListener('click', clearChat);
