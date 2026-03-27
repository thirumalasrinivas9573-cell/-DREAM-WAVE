const API_URL = "https://your-render-url.onrender.com";
function getToken() { return localStorage.getItem('token') || ''; }
function scrollBottom() { const c = document.getElementById('chat'); c.scrollTop = c.scrollHeight; }
function removeWelcome() { const w = document.getElementById('welcome-card'); if (w) w.remove(); }
function playBell() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator(), gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(528, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(264, ctx.currentTime + 1.2);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.4);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 1.4);
  } catch(e) {}
}
function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function appendUser(text) {
  removeWelcome();
  const chat = document.getElementById('chat');
  const row = document.createElement('div');
  row.className = 'msg-row user';
  row.innerHTML = '<div class="bubble-wrap"><div class="sender-name">You</div><div class="bubble">' + esc(text) + '</div></div><div class="msg-avatar">person</div>';
  chat.appendChild(row); scrollBottom();
}
function showTyping() {
  const chat = document.getElementById('chat');
  const row = document.createElement('div');
  row.className = 'msg-row krishna'; row.id = 'typing-row';
  row.innerHTML = '<div class="msg-avatar">lotus</div><div class="bubble-wrap"><div class="sender-name">Krishna</div><div class="bubble" style="display:flex;align-items:center;gap:8px;"><div class="typing-bubble"><span></span><span></span><span></span></div><span style="font-size:0.78rem;color:#8878b0;">Krishna is thinking...</span></div></div>';
  chat.appendChild(row); scrollBottom();
}
function hideTyping() { const el = document.getElementById('typing-row'); if (el) el.remove(); }
function parseResponse(raw) {
  const patterns = [
    {key:'empathy',emoji:'E',label:'Empathy'},{key:'clarity',emoji:'C',label:'Clarity'},
    {key:'guidance',emoji:'G',label:'Guidance'},{key:'action',emoji:'A',label:'Action Steps'},
    {key:'principle',emoji:'P',label:'Principle'},{key:'wisdom',emoji:'W',label:'Wisdom'},
    {key:'empowerment',emoji:'R',label:'Empowerment'}
  ];
  const emojiMap = {'E':'💛','C':'🔍','G':'🌟','A':'⚡','P':'🏛','W':'✨','R':'🔥'};
  const labelMap = {'E':'💛 Empathy','C':'🔍 Clarity','G':'🌟 Guidance','A':'⚡ Action Steps','P':'🏛 Principle','W':'✨ Wisdom','R':'🔥 Empowerment'};
  const sections = [];
  const allEmojis = Object.values(emojiMap);
  for (const p of patterns) {
    const em = emojiMap[p.emoji];
    const rest = allEmojis.filter(e => e !== em).join('');
    const re = new RegExp(em + '[^\\n]*\\n([\\s\\S]*?)(?=[' + rest + ']|$)');
    const m = raw.match(re);
    if (m && m[1].trim()) sections.push({ key: p.key, label: labelMap[p.emoji], body: m[1].trim() });
  }
  return sections.length > 0 ? sections : null;
}
function typeText(el, text, speed) {
  speed = speed || 11;
  return new Promise(function(resolve) {
    let i = 0; el.textContent = '';
    function next() { if (i < text.length) { el.textContent += text[i++]; scrollBottom(); setTimeout(next, speed); } else resolve(); }
    next();
  });
}
async function appendKrishna(raw, question) {
  const chat = document.getElementById('chat');
  const sections = parseResponse(raw);
  const row = document.createElement('div');
  row.className = 'msg-row krishna';
  const plainText = sections ? sections.map(function(s){ return s.label + ': ' + s.body; }).join(' | ') : raw;
  if (!sections) {
    row.innerHTML = '<div class="msg-avatar">lotus</div><div class="bubble-wrap"><div class="sender-name">Krishna</div><div class="bubble" style="position:relative;"><button class="star-btn">star</button><div id="type-target"></div></div></div>';
    chat.appendChild(row); scrollBottom();
    await typeText(row.querySelector('#type-target'), raw);
  } else {
    const blockHtml = sections.map(function(s, i) {
      return '<div class="w-section' + (s.key==='wisdom'?' is-wisdom':'') + (s.key==='empowerment'?' is-empowerment':'') + '"><div class="w-title">' + esc(s.label) + '</div><div class="w-body" id="ws-' + i + '"></div></div>';
    }).join('');
    row.innerHTML = '<div class="msg-avatar">lotus</div><div class="bubble-wrap"><div class="sender-name">Krishna</div><div class="bubble" style="position:relative;"><button class="star-btn">star</button><div class="wisdom-block">' + blockHtml + '</div></div></div>';
    chat.appendChild(row); scrollBottom();
    for (let i = 0; i < sections.length; i++) { await typeText(row.querySelector('#ws-' + i), sections[i].body, 10); }
  }
  const starBtn = row.querySelector('.star-btn');
  starBtn.addEventListener('click', function() { saveFavorite(question, plainText); starBtn.textContent = 'saved'; starBtn.classList.add('starred'); });
  playBell();
}
function appendError(msg) {
  const chat = document.getElementById('chat');
  const row = document.createElement('div');
  row.className = 'msg-row krishna';
  row.innerHTML = '<div class="msg-avatar">lotus</div><div class="bubble-wrap"><div class="sender-name">Krishna</div><div class="bubble" style="color:#e05050;">' + esc(msg) + '</div></div>';
  chat.appendChild(row); scrollBottom();
}
async function send(question) {
  question = (question || '').trim(); if (!question) return;
  const input = document.getElementById('question'), btn = document.getElementById('send-btn');
  input.value = ''; btn.disabled = true;
  appendUser(question); saveHistory(question); showTyping();
  try {
    let res;
    try {
      res = await fetch(API_URL + '/chat', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({message:question}) });
    } catch (err) {
      hideTyping();
      appendError('Network error. Please try again.');
      return;
    }
    hideTyping();
    if (!res.ok) { const err = await res.json().catch(function(){return{};}); appendError('Krishna could not respond. '+(err.message||'Please try again.')); }
    else {
      const data = await res.json();
      const reply = data.reply || data.response || 'No response from AI.';
      await appendKrishna(reply, question);
    }
  } catch(e) { hideTyping(); appendError('Could not reach the server.'); }
  finally { btn.disabled = false; input.focus(); }
}
function askSuggestion(el) { send(el.textContent); }
function askCategory(q) { send(q); }
document.getElementById('send-btn').addEventListener('click', function(){ send(document.getElementById('question').value); });
document.getElementById('question').addEventListener('keydown', function(e){ if(e.key==='Enter'&&!e.shiftKey) send(this.value); });
loadDailyWisdom();
</script></body></html>
