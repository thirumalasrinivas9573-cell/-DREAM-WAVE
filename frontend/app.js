// app.js — shared utilities for Dream Wave

const API_URL = "https://YOUR-RENDER-URL.onrender.com";

// ── Auth ──
function checkAuth() {
  const token = localStorage.getItem('token');
  if (!token) { window.location.href = '/login'; return; }
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  } catch(e) {}
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
}

function getUser() {
  try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; }
}

function getToken() {
  return localStorage.getItem('token');
}

// ── API helper — centralised fetch with auth + error handling ──
async function apiFetch(endpoint, options = {}) {
  const token = getToken();
  const headers = { 'Authorization': `Bearer ${token}`, ...options.headers };
  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }
  const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Request failed (${res.status})`);
  }
  return res.json();
}

// ── UI helpers ──
function showError(elId, msg) {
  const el = document.getElementById(elId);
  if (!el) return;
  el.textContent = msg;
  el.style.display = 'block';
}

function hideError(elId) {
  const el = document.getElementById(elId);
  if (el) el.style.display = 'none';
}

function showLoading(elId, msg = 'Loading...') {
  const el = document.getElementById(elId);
  if (el) el.innerHTML = `<div class="loading-state"><div class="spinner"></div><p>${msg}</p></div>`;
}

function showEmpty(elId, icon, msg) {
  const el = document.getElementById(elId);
  if (el) el.innerHTML = `<div class="empty-state"><div class="ei">${icon}</div><p>${msg}</p></div>`;
}

// ── Theme ──
function toggleTheme() {
  const isDark = document.body.classList.toggle('light-mode');
  localStorage.setItem('theme', isDark ? 'light' : 'dark');
  const btn = document.getElementById('themeToggle');
  if (btn) btn.textContent = isDark ? '🌙' : '☀️';
}

// ── Mobile nav ──
function toggleMobileNav() {
  const nav = document.getElementById('mobileNav');
  const btn = document.getElementById('hamburger');
  if (nav) nav.classList.toggle('open');
  if (btn) btn.classList.toggle('open');
}

// Close mobile nav when a link is clicked
document.addEventListener('click', function(e) {
  const nav = document.getElementById('mobileNav');
  if (!nav) return;
  if (e.target.tagName === 'A' && nav.classList.contains('open')) {
    nav.classList.remove('open');
    document.getElementById('hamburger')?.classList.remove('open');
  }
});

// Apply saved theme on load
(function() {
  if (localStorage.getItem('theme') === 'light') {
    document.body.classList.add('light-mode');
  }
})();

// ── Krishna — Universal AI helper ──────────────────────────────────────────
// ✅ GLOBAL LOADING STATE to prevent duplicate requests
let askKrishnaInProgress = false;

function speakKrishna(text) {
  if (!('speechSynthesis' in window) || !text) return;
  const content = String(text).replace(/\s+/g, ' ').trim().slice(0, 500);
  if (!content) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(content);
  const voices = window.speechSynthesis.getVoices();
  const teluguVoice = voices.find(v => /te-IN/i.test(v.lang));
  const englishVoice = voices.find(v => /en-IN|en-US|en-GB/i.test(v.lang));
  if (teluguVoice) utter.voice = teluguVoice;
  else if (englishVoice) utter.voice = englishVoice;
  utter.rate = 1;
  utter.pitch = 1;
  window.speechSynthesis.speak(utter);
}

async function askKrishna(message, type = 'chat') {
  // ✅ PREVENT DUPLICATE CALLS
  if (askKrishnaInProgress) {
    console.warn('⚠️ API call already in progress, ignoring duplicate request');
    return null;
  }

  if (!message || !message.trim()) {
    console.warn('⚠️ Empty message, skipping API call');
    return null;
  }

  askKrishnaInProgress = true;
  console.log(`🚀 SINGLE API CALL STARTING | message="${message.substring(0, 40)}..." | type=${type}`);

  try {
    // ✅ CLEAN FETCH with proper timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    const res = await fetch('/api/ai/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, type }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      console.error(`❌ API ERROR: ${res.status} ${res.statusText}`);
      return null;
    }

    const data = await res.json();
    const reply = data.reply || data.response || null;
    
    if (!reply) {
      console.warn('⚠️ Empty response from API');
      return null;
    }

    console.log(`✅ SINGLE RESPONSE RECEIVED (${reply.length} chars)`);

    // ✅ ONLY speak for chat type
    if (type === 'chat') speakKrishna(reply);

    return reply;

  } catch (err) {
    console.error('❌ API REQUEST FAILED:', err.message);
    return null;
  } finally {
    // ✅ ALWAYS reset loading flag
    askKrishnaInProgress = false;
  }
}

// Global alias — use askAI() everywhere
const askAI = askKrishna;

// ── Reusable Krishna response renderer ─────────────────────────────────────
function renderKrishnaResponse(text) {
  if (!text) return '<div class="krishna-bubble"><p>No response received.</p></div>';

  // Parse emoji sections
  const sections = [];
  const defs = [
    { em: '\u{1F49B}', label: 'Empathy' },
    { em: '\u{1F50D}', label: 'Clarity' },
    { em: '\u{1F31F}', label: 'Guidance' },
    { em: '\u26A1',    label: 'Action Steps' },
    { em: '\u{1F3DB}', label: 'Morals' },
    { em: '\u2728',    label: 'Wisdom' },
    { em: '\u{1F525}', label: 'Empowerment' }
  ];
  for (let i = 0; i < defs.length; i++) {
    const p = defs[i];
    const nextEmojis = defs.slice(i + 1).map(d => d.em);
    try {
      const lookahead = nextEmojis.length
        ? '(?=' + nextEmojis.map(e => e.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + '|$)'
        : '(?=$)';
      const re = new RegExp(p.em.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[^\\n]*\\n([\\s\\S]*?)' + lookahead);
      const m = text.match(re);
      if (m && m[1].trim()) sections.push({ label: p.em + ' ' + p.label, body: m[1].trim(), key: p.label.toLowerCase() });
    } catch(e) {}
  }

  if (!sections.length) {
    return '<div class="krishna-bubble"><p style="white-space:pre-wrap;line-height:1.7;">' + text.replace(/</g,'&lt;') + '</p></div>';
  }

  const html = sections.map(s => {
    const isWisdom = s.key === 'wisdom';
    const isEmpowerment = s.key === 'empowerment';
    return '<div class="kr-section' + (isWisdom ? ' kr-wisdom' : '') + (isEmpowerment ? ' kr-empower' : '') + '">' +
      '<div class="kr-label">' + s.label + '</div>' +
      '<div class="kr-body">' + s.body.replace(/</g,'&lt;') + '</div>' +
      '</div>';
  }).join('');

  return '<div class="krishna-bubble">' + html + '</div>';
}

// ── Krishna bubble CSS (injected once) ─────────────────────────────────────
(function injectKrishnaCss() {
  if (document.getElementById('krishna-css')) return;
  const style = document.createElement('style');
  style.id = 'krishna-css';
  style.textContent = `
    .krishna-bubble{background:linear-gradient(135deg,#12102a,#1a1540);border:1px solid #3a2a6e;border-radius:14px;padding:16px 18px;box-shadow:0 0 16px rgba(245,200,66,0.07);color:#e8e0d0;font-size:0.9rem;line-height:1.65;}
    .kr-section{margin-bottom:12px;}
    .kr-label{font-size:0.7rem;font-weight:700;color:#f5c842;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:3px;}
    .kr-body{color:#d0c8e8;white-space:pre-wrap;line-height:1.65;}
    .kr-wisdom .kr-body{color:#f5c842;font-style:italic;border-left:2px solid rgba(245,200,66,0.4);padding-left:9px;}
    .kr-empower .kr-body{color:#c8e0ff;font-weight:600;}
  `;
  document.head.appendChild(style);
})();

// ── Daily Gita Story Popup ──────────────────────────────────────────────────
const GITA_STORIES = [
  {
    title: "Arjuna's Doubt",
    story: "Arjuna stood at the battlefield of Kurukshetra, bow trembling in his hands. Seeing his own kinsmen arrayed against him, he collapsed in grief. Krishna spoke: 'Yield not to unmanliness. It does not become you. Shake off your faint-heartedness and arise.'",
    moral: "Duty does not wait for perfect conditions. Rise and act."
  },
  {
    title: "The Eternal Soul",
    story: "Krishna revealed the secret of the soul: 'Weapons cannot cut it, fire cannot burn it, water cannot wet it, wind cannot dry it. The soul is never born nor dies.' Arjuna's fear of death dissolved in that moment.",
    moral: "You are not the body. You are the eternal witness within."
  },
  {
    title: "Karma Without Attachment",
    story: "Arjuna asked why he should act if results are uncertain. Krishna answered: 'You have a right to perform your duties, but never to the fruits of your actions. Act fully — then release.' This is the secret of inner freedom.",
    moral: "Work without attachment is the highest form of worship."
  },
  {
    title: "The Steady Mind",
    story: "Krishna described the person of steady wisdom: 'One who is not disturbed by misery, not elated by happiness, and who is free from attachment, fear, and anger — such a person is called a sage of steady mind.'",
    moral: "Equanimity in all conditions is the mark of true wisdom."
  },
  {
    title: "Surrender to the Divine",
    story: "At the end of all teachings, Krishna gave the highest instruction: 'Abandon all varieties of religion and just surrender unto Me. I shall deliver you from all sinful reactions. Do not fear.' Arjuna's confusion vanished completely.",
    moral: "Total surrender to the Divine is the ultimate path to peace."
  },
  {
    title: "Focus on Your Duty",
    story: "When Arjuna wanted to run from the battlefield, Krishna said: 'Better is one's own dharma, though imperfectly performed, than the dharma of another well performed.' Each person has a unique role — fulfil yours.",
    moral: "Walk your own path with sincerity. No one else's journey will fulfill your soul."
  },
  {
    title: "The Mind as Friend or Enemy",
    story: "Krishna taught: 'A person can rise through the efforts of their own mind, or draw themselves down. The mind is both friend and enemy.' Arjuna understood — the greatest battle is within.",
    moral: "Train your mind and it becomes your greatest strength."
  },
  {
    title: "Knowledge Burns All Karma",
    story: "Krishna declared: 'As a blazing fire turns firewood to ashes, so does the fire of knowledge burn to ashes all reactions to material activities.' Arjuna realised that wisdom is the ultimate purifier.",
    moral: "Seek knowledge not for power, but for liberation."
  }
];

function showDailyStoryPopup() {
  const today = new Date().toDateString();
  const seen  = localStorage.getItem('krishna_story_seen');
  if (seen === today) return; // already shown today

  const story = GITA_STORIES[new Date().getDate() % GITA_STORIES.length];

  const overlay = document.createElement('div');
  overlay.id = 'gita-popup';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.75);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(4px);animation:fadeIn 0.3s ease;';

  overlay.innerHTML = `
    <div style="background:linear-gradient(135deg,#12102a,#1e1040);border:1px solid rgba(245,200,66,0.4);border-radius:20px;padding:28px 24px;max-width:480px;width:100%;box-shadow:0 0 40px rgba(245,200,66,0.15);position:relative;">
      <div style="text-align:center;margin-bottom:16px;">
        <div style="font-size:2rem;margin-bottom:6px;">🕉️</div>
        <div style="font-size:0.68rem;color:#f5c842;text-transform:uppercase;letter-spacing:1.5px;font-weight:700;">Today's Gita Story</div>
      </div>
      <h3 style="color:#f5c842;font-size:1rem;font-weight:800;margin-bottom:10px;text-align:center;">${story.title}</h3>
      <p style="color:#d0c8e8;font-size:0.88rem;line-height:1.7;font-style:italic;margin-bottom:14px;">"${story.story}"</p>
      <div style="background:rgba(245,200,66,0.08);border:1px solid rgba(245,200,66,0.2);border-radius:10px;padding:10px 14px;margin-bottom:18px;">
        <span style="font-size:0.7rem;color:#f5c842;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">📖 Moral</span>
        <p style="color:#c8b870;font-size:0.84rem;margin-top:4px;font-weight:600;">${story.moral}</p>
      </div>
      <div style="display:flex;gap:10px;">
        <button onclick="document.getElementById('gita-popup').remove();localStorage.setItem('krishna_story_seen','${today}');" style="flex:1;background:linear-gradient(135deg,#c8a030,#f5c842);color:#0d0d1a;border:none;padding:10px;border-radius:10px;font-weight:700;cursor:pointer;font-size:0.88rem;">Begin My Day 🙏</button>
        <a href="krishna.html" onclick="document.getElementById('gita-popup').remove();localStorage.setItem('krishna_story_seen','${today}');" style="flex:1;background:rgba(245,200,66,0.1);border:1px solid rgba(245,200,66,0.3);color:#f5c842;padding:10px;border-radius:10px;font-weight:700;cursor:pointer;font-size:0.88rem;text-decoration:none;display:flex;align-items:center;justify-content:center;">Ask Krishna 🪷</a>
      </div>
    </div>`;

  document.body.appendChild(overlay);
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) {
      overlay.remove();
      localStorage.setItem('krishna_story_seen', today);
    }
  });
}

// Auto-show popup on every page (after 1.5s delay so page loads first)
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(showDailyStoryPopup, 1500);
});
