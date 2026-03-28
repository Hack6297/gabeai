const chatEl = document.getElementById('chat');
const formEl = document.getElementById('chat-form');
const msgEl = document.getElementById('message');
const modeEl = document.getElementById('mode');

const history = [];

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

  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || 'Request failed');
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
