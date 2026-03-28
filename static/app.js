const chatEl = document.getElementById('chat');
const formEl = document.getElementById('chat-form');
const msgEl = document.getElementById('message');
const modeEl = document.getElementById('mode');

// Optional controls so this script works with both older and newer index.html layouts.
const apiBaseEl = document.getElementById('api-base');
const bannerEl = document.getElementById('banner');
const clearBtnEl = document.getElementById('clear-chat');

const history = [];

function normalizeBase(url) {
  if (!url) return '';
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

function renderBanner(text = '') {
  if (!bannerEl) return;

  if (!text) {
    bannerEl.hidden = true;
    bannerEl.textContent = '';
    return;
  }

  bannerEl.hidden = false;
  bannerEl.textContent = text;
}

function getApiBase() {
  if (!apiBaseEl) return window.location.origin;

  const userValue = normalizeBase(apiBaseEl.value.trim());
  if (userValue) return userValue;

  if (window.location.protocol === 'file:') {
    renderBanner('Running from file:// mode. Set API Base (default: http://127.0.0.1:8000).');
    apiBaseEl.value = 'http://127.0.0.1:8000';
    return apiBaseEl.value;
  }

  apiBaseEl.value = window.location.origin;
  return apiBaseEl.value;
}

if (apiBaseEl && !apiBaseEl.value) {
  apiBaseEl.value = window.location.protocol === 'file:'
    ? 'http://127.0.0.1:8000'
    : window.location.origin;
}

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
}

async function sendMessage(text) {
  const apiBase = getApiBase();

  const payload = {
    message: text,
    mode: modeEl.value,
    history,
  };

  const endpoint = `${normalizeBase(apiBase)}/api/chat`;
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

if (clearBtnEl) {
  clearBtnEl.addEventListener('click', clearChat);
}
