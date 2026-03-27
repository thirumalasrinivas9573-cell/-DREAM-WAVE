// Guided Krishna AI Mentor Journey
window.showMentorStep = function(step) {
  const modal = document.getElementById('mentorModalContent');
  if (!modal) return;
  let state = JSON.parse(localStorage.getItem('mentorJourney')||'{}');
  if (!state.step || step === 0) state = { step: 0 };
  state.step = step;
  localStorage.setItem('mentorJourney', JSON.stringify(state));
  if (step === 0) {
    modal.innerHTML = `
      <h2>Welcome to Krishna AI Mentor</h2>
      <div class="mentor-step">Let Krishna guide you to your dream goal.<br><br><b>What is your main goal?</b></div>
      <input id="mentorGoalInput" type="text" maxlength="80" placeholder="e.g. Crack JEE, Become a Coder, etc." autofocus>
      <button class="mentor-btn" onclick="saveMentorGoal()">Continue</button>
    `;
    setTimeout(()=>{document.getElementById('mentorGoalInput').focus();}, 200);
  }
  // More steps will be added here (AI Q&A, roadmap, streak, etc.)
};

window.saveMentorGoal = function() {
  const goal = document.getElementById('mentorGoalInput').value.trim();
  if (!goal) {
    document.getElementById('mentorGoalInput').style.borderColor = '#e879a0';
    return;
  }
  let state = JSON.parse(localStorage.getItem('mentorJourney')||'{}');
  state.goal = goal;
  state.step = 1;
  localStorage.setItem('mentorJourney', JSON.stringify(state));
  showMentorStep(1);
};
const API_URL = "https://dream-wave.onrender.com";
document.addEventListener('DOMContentLoaded', () => {
  const flute = document.getElementById("fluteMusic");
  const musicBtn = document.getElementById("musicBtn");
  const musicStatus = document.getElementById("musicStatus");
  const slokaBtn = document.getElementById("slokaBtn");
  const slokaStatus = document.getElementById("slokaStatus");

  const slokas = [
    "/audio/sloka.mp3"
  ];
  let played = [];
  let currentSlokaAudio = null;

  window.onload = () => {
    flute.volume = 0.3;
    // Autoplay fix for browser
    setTimeout(() => {
      flute.play().catch(()=>{});
    }, 200);
    document.body.addEventListener('click', () => {
      flute.play().catch(() => {});
    }, { once: true });
    musicStatus.textContent = "🎵 Flute Playing...";
  };

  function toggleMusic() {
    if (flute.paused) {
      flute.play();
      musicStatus.textContent = "🎵 Flute Playing...";
    } else {
      flute.pause();
      musicStatus.textContent = "⏸️ Flute Paused";
    }
  }

  function startKrishnaMode() {
    flute.volume = 0.3;
    flute.loop = true;
    flute.play().catch(()=>{});
    musicStatus.textContent = "🎵 Flute Playing...";
  }

  function playRandomSloka() {
    if (currentSlokaAudio) {
      currentSlokaAudio.pause();
      currentSlokaAudio.currentTime = 0;
    }
    currentSlokaAudio = new Audio("/audio/sloka.mp3");
    currentSlokaAudio.volume = 1.0;
    currentSlokaAudio.currentTime = 0;
    currentSlokaAudio.play().catch(err => console.log(err));
    slokaStatus.textContent = "🔊 Playing Sloka...";
    slokaBtn.classList.add('glow');
    setTimeout(() => slokaBtn.classList.remove('glow'), 600);
    currentSlokaAudio.onended = () => {
      slokaStatus.textContent = "";
    };
  }

  // expose controls to global for inline onclick
  window.toggleMusic = toggleMusic;
  window.playRandomSloka = playRandomSloka;
  window.startKrishnaMode = startKrishnaMode;

  // Krishna chat
  const form = document.getElementById('krishnaForm');
  const input = document.getElementById('krishnaInput');
  const messages = document.getElementById('krishnaMessages');
  let loading = false;

  function addMsg(text, sender, isVoice) {
    const row = document.createElement('div');
    row.className = 'msg-row ' + (sender === 'user' ? 'msg-user' : 'msg-ai');
    const bubble = document.createElement('div');
    bubble.className = 'msg-bubble';
    bubble.innerHTML = text;
    const time = document.createElement('div');
    time.className = 'msg-time';
    time.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    bubble.appendChild(time);
    row.appendChild(bubble);
    messages.appendChild(row);
    messages.scrollTop = messages.scrollHeight;
    if (isVoice) speakTelugu(text);
  }

  function showTyping() {
    const row = document.createElement('div');
    row.className = 'msg-row msg-ai';
    row.id = 'typingRow';
    row.innerHTML = '<div class="msg-bubble"><span class="typing-anim"><span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span></span> <span style="margin-left:8px;">AI is thinking...</span></div>';
    messages.appendChild(row);
    messages.scrollTop = messages.scrollHeight;
  }
  function removeTyping() {
    const t = document.getElementById('typingRow');
    if (t) t.remove();
  }

  form.onsubmit = async e => {
    e.preventDefault();
    if (loading) return;
    const text = input.value.trim();
    if (!text) return;
    addMsg(text, 'user');
    input.value = '';
    loading = true;
    showTyping();
    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      removeTyping();
      addMsg(data.reply, 'ai', true);
    } catch (e) {
      removeTyping();
      addMsg('<span style="color:#f44">AI error. Please try again.</span>', 'ai');
    } finally {
      loading = false;
    }
  };

  function speakTelugu(text) {
    if (!window.speechSynthesis) return;
    const speech = new SpeechSynthesisUtterance(text.replace(/<[^>]+>/g, ''));
    speech.lang = 'te-IN';
    speech.rate = 0.9;
    speech.pitch = 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(speech);
  }
});
