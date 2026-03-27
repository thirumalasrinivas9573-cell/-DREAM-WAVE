checkAuth();

const CATS = {
  cooking:  { icon: '🍳', title: 'Cooking Assistant',    sub: 'Enter ingredients or ask for any recipe — get step-by-step guidance',       placeholder: 'e.g. I have rice, lentils, tomato, onion — what can I make?',          tags: ['Rice + Lentils recipe', 'Chicken curry recipe', 'Quick breakfast ideas', 'Healthy dinner', 'Dessert with milk'] },
  workout:  { icon: '💪', title: 'Workout Planner',      sub: 'Get personalized workout plans and fitness routines',                         placeholder: 'e.g. Build muscle at home, beginner, 30 mins/day',                     tags: ['Beginner home workout', 'Chest and arms', 'Full body 30 min', 'Weight loss plan', 'Core and abs'] },
  jogging:  { icon: '🏃', title: 'Running Coach',        sub: 'Structured running programs, pace guidance, and training schedules',          placeholder: 'e.g. I want to run 5km, currently can run 1km',                        tags: ['Couch to 5K plan', 'Morning jog routine', 'Improve running pace', 'Half marathon', 'Running warm-up'] },
  health:   { icon: '🌿', title: 'Health & Wellness',    sub: 'Natural remedies, lifestyle tips, and holistic health guidance',              placeholder: 'e.g. I feel tired all day, how to boost energy naturally?',            tags: ['Boost energy naturally', 'Better sleep tips', 'Reduce stress', 'Improve digestion', 'Immunity foods'] },
  routine:  { icon: '⏰', title: 'Daily Routine Builder', sub: 'Get a structured daily schedule tailored to your goals',                     placeholder: 'e.g. Student, 8 hours available, want to study and exercise',          tags: ['Student daily routine', 'Work + fitness balance', 'Morning productivity', 'Entrepreneur schedule', 'Early riser'] },
  room:     { icon: '🏠', title: 'Room Design AI',       sub: 'Interior design ideas, color palettes, and furniture layout tips',            placeholder: 'e.g. Small bedroom 10x12 ft, modern minimalist on a budget',          tags: ['Small bedroom design', 'Living room palette', 'Home office setup', 'Budget decor', 'Minimalist ideas'] },
  general:  { icon: '✨', title: 'General Life Assistant', sub: 'Ask anything about daily life, habits, productivity, or lifestyle',         placeholder: 'Ask me anything about your daily life...',                             tags: ['Morning habits for success', 'Stay motivated', 'Reduce screen time', 'Build better habits', 'Work-life balance'] }
};

// Per-category chat history (in-memory)
const chatHistories = Object.fromEntries(Object.keys(CATS).map(k => [k, []]));
let currentCat = 'cooking';

function selectCat(cat) {
  currentCat = cat;
  document.querySelectorAll('.cat-tab').forEach(t => t.classList.toggle('active', t.dataset.cat === cat));

  const cfg = CATS[cat];
  document.getElementById('chatIcon').textContent = cfg.icon;
  document.getElementById('chatTitle').textContent = cfg.title;
  document.getElementById('chatSub').textContent = cfg.sub;
  document.getElementById('chatInput').placeholder = cfg.placeholder;

  document.getElementById('quickTagsBar').innerHTML = cfg.tags.map(t =>
    `<span class="qtag" onclick="fillAndSend('${t.replace(/'/g, "\\'")}')">${t}</span>`
  ).join('');

  renderHistory(cat);
}

function renderHistory(cat) {
  const container = document.getElementById('chatMessages');
  container.innerHTML = '';
  const history = chatHistories[cat];
  if (!history.length) {
    addBubble('ai', `Hi! I'm your ${CATS[cat].title}. ${CATS[cat].sub}. How can I help you today?`, false);
  } else {
    history.forEach(m => addBubble(m.role, m.text, false));
  }
}

function addBubble(role, text, save = true) {
  const container = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.className = `msg ${role}`;
  // Format AI responses: convert **bold**, numbered lists, bullet points
  const formatted = role === 'ai' ? formatAIResponse(text) : escapeHtml(text).replace(/\n/g, '<br>');
  div.innerHTML = `
    <div class="msg-avatar">${role === 'ai' ? '🤖' : '👤'}</div>
    <div class="msg-bubble">${formatted}</div>`;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
  if (save) chatHistories[currentCat].push({ role, text });
}

function formatAIResponse(text) {
  return text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^#{1,3}\s+(.+)$/gm, '<strong style="color:#c4b5fd;font-size:0.95rem">$1</strong>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');
}

function escapeHtml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function fillAndSend(text) {
  document.getElementById('chatInput').value = text;
  sendMessage();
}

function clearChat() {
  chatHistories[currentCat] = [];
  renderHistory(currentCat);
}


let loading = false;
let debounceTimeout = null;

async function sendMessage() {
  if (loading) return;
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if (!text) return;
  clearTimeout(debounceTimeout);
  loading = true;
  const btn = document.getElementById('sendBtn');
  input.value = '';
  input.style.height = 'auto';
  addBubble('user', text, true);
  btn.disabled = true;
  btn.textContent = 'Thinking...';
  // Typing animation
  const typingDiv = document.createElement('div');
  typingDiv.className = 'msg ai';
  typingDiv.innerHTML = '<div class="msg-avatar">🤖</div><div class="msg-bubble ai-typing"><span class="dot"></span><span class="dot"></span><span class="dot"></span> <span class="typing-text">AI is thinking...</span></div>';
  document.getElementById('chatMessages').appendChild(typingDiv);
  scrollChatToBottom();
  let retryCount = 0;
  let reply = '';
  async function fetchAI() {
    try {
      const modeContext = currentCat !== 'general'
        ? `[Mode: ${CATS[currentCat].title}] ${text}`
        : text;
      const res = await fetch(`${API_URL}/ai/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: modeContext, type: 'daily' })
      });
      if (res.ok) {
        const data = await res.json();
        reply = data.reply || '';
        typingDiv.remove();
        addBubble('ai', formatAIResponse(reply), false, true);
        loading = false;
        btn.disabled = false;
        btn.textContent = 'Ask AI';
        scrollChatToBottom();
      } else {
        throw new Error('API error');
      }
    } catch (e) {
      retryCount++;
      if (retryCount <= 1) {
        setTimeout(fetchAI, 1200);
      } else {
        typingDiv.remove();
        addBubble('ai', `<span style='color:#f44'>AI error. <button onclick='sendMessage()'>Retry</button></span>`, false, true);
        loading = false;
        btn.disabled = false;
        btn.textContent = 'Ask AI';
        scrollChatToBottom();
      }
    }
  }
  fetchAI();
}

function addBubble(role, text, save = true, isAI = false) {
  const container = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.className = `msg ${role}`;
  const formatted = role === 'ai' ? formatAIResponse(text) : escapeHtml(text).replace(/\n/g, '<br>');
  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  div.innerHTML = `
    <div class="msg-avatar">${role === 'ai' ? '🤖' : '👤'}</div>
    <div class="msg-bubble">${formatted}<div class="msg-time">${time}</div></div>`;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
  if (save) chatHistories[currentCat].push({ role, text });
}

function scrollChatToBottom() {
  const chat = document.getElementById('chatMessages');
  chat.scrollTop = chat.scrollHeight;
}

document.getElementById('chatInput').addEventListener('input', function() {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {}, 300);
});

function formatAIResponse(text) {
  if (!text) return '';
  text = text.replace(/^(\d+\.[^\n]+)/gm, '<h4 style="color:#7c3aed;font-weight:800;">$1</h4>');
  text = text.replace(/^[\-\*] (.+)$/gm, '<li>$1</li>');
  text = text.replace(/^Q:/gm, '<b>Q:</b>');
  text = text.replace(/^A:/gm, '<b>A:</b>');
  text = text.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
  return text;
}
// Typing animation CSS
const style = document.createElement('style');
style.innerHTML = `
.ai-typing { display: flex; align-items: center; gap: 6px; }
.dot { width: 7px; height: 7px; border-radius: 50%; background: #a78bfa; display: inline-block; animation: blink 1.2s infinite both; }
.dot:nth-child(2) { animation-delay: 0.2s; }
.dot:nth-child(3) { animation-delay: 0.4s; }
@keyframes blink { 0%, 80%, 100% { opacity: 0.2; } 40% { opacity: 1; } }
.msg-time { font-size: 0.7rem; color: #b4b4b4; margin-top: 6px; text-align: right; }
`;
document.head.appendChild(style);

function getFallback(cat, input) {
  const fb = {
    cooking:  `Here are some ideas for "${input}":\n\n**Base technique:** Sauté onion + garlic, add your main ingredient, season with salt, pepper, and spices, simmer with water or stock.\n\n**Quick options:**\n- Stir-fry with soy sauce and vegetables\n- Curry with tomato base and spices\n- Simple soup with stock and herbs\n\nTip: Most ingredients work well with cumin, turmeric, and coriander.`,
    workout:  `**Workout plan for "${input}":**\n\n**Warm-up (5 min):** Light jog or jumping jacks\n\n**Main workout (20 min):**\n- Push-ups: 3 sets × 10 reps\n- Squats: 3 sets × 15 reps\n- Plank: 3 × 30 seconds\n- Lunges: 3 sets × 10 each leg\n\n**Cool-down (5 min):** Stretching\n\nProgress weekly by adding reps or sets.`,
    jogging:  `**Running plan for "${input}":**\n\n- Week 1–2: Walk 5 min, jog 1 min, repeat 5×\n- Week 3–4: Walk 3 min, jog 2 min, repeat 5×\n- Week 5–6: Walk 2 min, jog 5 min, repeat 4×\n- Week 7–8: Jog continuously for 20–30 min\n\n**Key tips:** Breathe through your nose, land mid-foot, keep a conversational pace.`,
    health:   `**Natural health tips for "${input}":**\n\n- Start mornings with warm lemon water\n- Eat whole foods, reduce processed sugar\n- Sleep 7–8 hours consistently\n- Walk 20–30 minutes daily\n- Practice 5 minutes of deep breathing\n- Stay hydrated (8 glasses/day)\n\nSmall consistent habits create lasting health.`,
    routine:  `**Daily routine for "${input}":**\n\n- 5:30 AM — Wake up, hydrate\n- 6:00 AM — Exercise (30 min)\n- 7:00 AM — Breakfast + planning\n- 8:00 AM — Deep work block 1 (2 hrs)\n- 10:30 AM — Short break\n- 11:00 AM — Work block 2\n- 1:00 PM — Lunch + walk\n- 2:00 PM — Work block 3\n- 5:00 PM — Review + light activity\n- 8:00 PM — Learning / reading\n- 10:00 PM — Sleep`,
    room:     `**Room design ideas for "${input}":**\n\n- Use light colors (white, beige, light grey) to make small spaces feel larger\n- Mirrors create depth and reflect light\n- Multi-functional furniture saves space\n- Warm lighting (2700–3000K) creates a cozy atmosphere\n- Add plants for life and air quality\n- Use vertical space with shelves\n\n**Color palette:** White walls + wood tones + one accent color.`,
    general:  `**Tips for "${input}":**\n\n- Start small and build consistency\n- Track your progress daily\n- Focus on systems, not just goals\n- Rest and recovery are part of the process\n- Surround yourself with supportive people\n\nRemember: Progress over perfection.`
  };
  return fb[cat] || fb.general;
}

// Auto-resize textarea
document.getElementById('chatInput').addEventListener('input', function() {
  this.style.height = 'auto';
  this.style.height = Math.min(this.scrollHeight, 100) + 'px';
});

// Enter to send (Shift+Enter for newline)
document.getElementById('chatInput').addEventListener('keydown', function(e) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
});

// Init
selectCat('cooking');
