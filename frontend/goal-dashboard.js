checkAuth();
let currentRoadmap = null;
let currentTopicContent = null;
let currentGoal = '';

function switchTab(name, el) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  if (el) el.classList.add('active');
  else document.querySelector(`[onclick*="${name}"]`)?.classList.add('active');
  document.getElementById('panel-' + name).classList.add('active');
}

async function init() {
  // Load progress and roadmap in parallel
  const [progressResult, roadmapResult] = await Promise.allSettled([
    apiFetch('/mentor/progress'),
    apiFetch('/roadmap')
  ]);

  if (progressResult.status === 'fulfilled') {
    const data = progressResult.value;
    currentGoal = data.goal || data.ambition || '';
    if (!currentGoal) {
      document.getElementById('goalTitle').textContent = 'No goal set';
      document.getElementById('goalSub').textContent = 'Set your goal first to unlock your dashboard';
      document.getElementById('genRoadmapBtn').style.display = 'none';
    } else {
      document.getElementById('goalTitle').textContent = currentGoal;
      const done = data.allTime?.completed || 0;
      document.getElementById('progressPct').textContent = Math.min(done, 100) + '%';
      document.getElementById('goalSub').textContent = `${done} tasks completed · ${data.streak || 0} day streak · ${data.credits || 0} credits`;
      loadPractice();
    }
  } else {
    document.getElementById('goalTitle').textContent = 'Could not load goal';
    document.getElementById('goalSub').textContent = 'Check your connection and try again';
    document.getElementById('genRoadmapBtn').style.display = 'none';
  }

  if (roadmapResult.status === 'fulfilled' && roadmapResult.value.roadmap) {
    currentRoadmap = roadmapResult.value.roadmap;
    renderAll(currentRoadmap);
    document.getElementById('genRoadmapBtn').textContent = 'Regenerate Roadmap';
  }
}

function renderAll(rm) {
  renderRoadmap(rm);
  renderOverview(rm);
  renderReading(rm);
  renderResources(rm);
}

function renderOverview(rm) {
  document.getElementById('overviewContent').innerHTML = `
    <div style="background:rgba(124,58,237,0.06);border-radius:12px;padding:16px;margin-bottom:14px">
      <p style="color:rgba(255,255,255,0.8);line-height:1.7;font-size:0.9rem">${rm.overview || ''}</p>
    </div>
    <div style="display:flex;gap:12px;flex-wrap:wrap">
      ${statBox(rm.duration || '12 months', 'DURATION')}
      ${statBox((rm.phases || []).length, 'PHASES')}
      ${statBox(rm.salaryRange || 'Varies', 'SALARY RANGE')}
    </div>`;

  document.getElementById('skillsContent').innerHTML =
    (rm.skills || []).map(s => `<span class="skill-tag">${s}</span>`).join('') ||
    '<div class="empty">No skills data</div>';

  document.getElementById('careerPathsContent').innerHTML =
    (rm.careerPaths || []).map((p, i) => `
      <div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--border)">
        <span style="width:24px;height:24px;border-radius:50%;background:linear-gradient(135deg,#7c3aed,#a78bfa);display:flex;align-items:center;justify-content:center;color:white;font-size:0.72rem;font-weight:700;flex-shrink:0">${i+1}</span>
        <span style="font-size:0.88rem">${p}</span>
      </div>`).join('') || '<div class="empty">No career paths data</div>';
}

function statBox(val, label) {
  return `<div style="background:rgba(255,255,255,0.04);border-radius:10px;padding:14px;flex:1;min-width:110px;text-align:center">
    <div style="font-size:1.2rem;font-weight:800;color:#a78bfa">${val}</div>
    <div style="font-size:0.7rem;color:var(--text-dim);margin-top:4px">${label}</div>
  </div>`;
}

function renderRoadmap(rm) {
  const phases = rm.phases || [];
  if (!phases.length) { document.getElementById('roadmapContent').innerHTML = '<div class="empty">No roadmap data</div>'; return; }
  document.getElementById('roadmapContent').innerHTML = phases.map(ph => `
    <div class="phase-card">
      <div class="phase-header">
        <div class="phase-num">${ph.phase}</div>
        <div>
          <div class="phase-title">${ph.title}</div>
          <div class="phase-dur">${ph.duration}${ph.description ? ' · ' + ph.description : ''}</div>
        </div>
      </div>
      ${(ph.topics || []).map(t => topicRow(t)).join('')}
    </div>`).join('');
}

function topicRow(t) {
  const enc = encodeURIComponent(JSON.stringify(t));
  return `<div class="topic-item" onclick="openTopic('${enc}')">
    <div class="topic-icon">${typeIcon(t.type)}</div>
    <div class="topic-info">
      <div class="topic-title">${t.title}</div>
      <div class="topic-desc">${t.description || ''}</div>
      <div class="topic-meta">
        <span class="topic-tag">${t.type || 'reading'}</span>
        ${t.duration ? `<span class="topic-tag">${t.duration}</span>` : ''}
      </div>
    </div>
    <button class="btn-pdf" onclick="event.stopPropagation();openTopicAndPDF('${enc}')">📄 PDF</button>
  </div>`;
}

function renderReading(rm) {
  const allTopics = (rm.phases || []).flatMap(ph => (ph.topics || []).map(t => ({ ...t, phase: ph.title })));
  if (!allTopics.length) { document.getElementById('readingContent').innerHTML = '<div class="empty">No topics found</div>'; return; }
  document.getElementById('readingContent').innerHTML = allTopics.map(t => topicRow(t)).join('');
}

function renderResources(rm) {
  const allResources = [];
  (rm.phases || []).forEach(ph => {
    (ph.topics || []).forEach(t => {
      (t.resources || []).forEach(r => allResources.push({ name: r, topic: t.title }));
    });
  });
  if (!allResources.length) { document.getElementById('resourcesContent').innerHTML = '<div class="empty">No resources found</div>'; return; }
  document.getElementById('resourcesContent').innerHTML = allResources.map(r => `
    <div class="resource-item">
      <div class="resource-icon">🔗</div>
      <div class="resource-info">
        <div class="resource-title">${r.name}</div>
        <div class="resource-type">For: ${r.topic}</div>
      </div>
    </div>`).join('');
}

async function loadPractice() {
  showLoading('practiceContent', 'Loading tasks...');
  try {
    const tasks = await apiFetch('/mentor/tasks/today');
    if (!tasks || !tasks.length) {
      showEmpty('practiceContent', '📋', 'No tasks yet — generate from AI Mentor');
      return;
    }
    document.getElementById('practiceContent').innerHTML = tasks.map(t => `
      <div style="display:flex;align-items:flex-start;gap:12px;padding:12px 0;border-bottom:1px solid var(--border)">
        <div style="width:20px;height:20px;border-radius:5px;border:2px solid ${t.status==='completed'?'#10b981':'rgba(124,58,237,0.4)'};background:${t.status==='completed'?'#10b981':'transparent'};flex-shrink:0;margin-top:2px;display:flex;align-items:center;justify-content:center;color:white;font-size:0.7rem">${t.status==='completed'?'✓':''}</div>
        <div style="flex:1">
          <div style="font-weight:600;font-size:0.88rem;${t.status==='completed'?'text-decoration:line-through;color:var(--text-dim)':''}">${t.title}</div>
          <div style="color:var(--text-muted);font-size:0.76rem;margin-top:2px">${t.description || ''}</div>
          <div style="display:flex;gap:6px;margin-top:5px">
            <span style="padding:2px 8px;border-radius:20px;font-size:0.7rem;font-weight:600;background:rgba(124,58,237,0.12);color:#c4b5fd">${t.type}</span>
            <span style="padding:2px 8px;border-radius:20px;font-size:0.7rem;font-weight:600;background:rgba(124,58,237,0.12);color:#c4b5fd">+${t.points} pts</span>
          </div>
        </div>
      </div>`).join('');
  } catch(e) {
    showEmpty('practiceContent', '⚠️', 'Could not load tasks');
  }
}

function typeIcon(type) {
  return { reading: '📚', video: '🎬', practice: '💻', project: '🔧' }[type] || '📚';
}

async function generateRoadmap() {
  if (!currentGoal) return;
  const btn = document.getElementById('genRoadmapBtn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner" style="width:14px;height:14px;border-width:2px;display:inline-block;vertical-align:middle;margin-right:6px"></span> Generating...';
  try {
    const data = await apiFetch('/roadmap/generate', { method: 'POST', body: { goal: currentGoal } });
    if (data.roadmap) {
      currentRoadmap = data.roadmap;
      renderAll(data.roadmap);
      btn.textContent = 'Regenerate Roadmap';
    }
  } catch(e) {
    btn.textContent = 'Generate Roadmap';
    alert('Failed to generate roadmap. Please try again.');
  } finally { btn.disabled = false; }
}

async function openTopic(encodedTopic) {
  const topic = JSON.parse(decodeURIComponent(encodedTopic));
  document.getElementById('modalTitle').textContent = topic.title;
  document.getElementById('modalContent').innerHTML = '<div class="loading-state"><div class="spinner"></div><p>Loading content...</p></div>';
  document.getElementById('topicModal').classList.add('open');

  try {
    const data = await apiFetch('/roadmap/topic-content', {
      method: 'POST',
      body: { topic: topic.title, goal: currentGoal }
    });
    currentTopicContent = data.content;
    renderTopicContent(data.content);
  } catch(e) {
    document.getElementById('modalContent').innerHTML = `
      <div class="content-section"><h4>About This Topic</h4><p>${topic.description || topic.title}</p></div>
      ${(topic.resources || []).length ? `<div class="content-section"><h4>Resources</h4><ul>${topic.resources.map(r => `<li>${r}</li>`).join('')}</ul></div>` : ''}`;
  }
}

function openTopicAndPDF(encodedTopic) {
  openTopic(encodedTopic);
}

function renderTopicContent(c) {
  const section = (title, content) => content ? `<div class="content-section"><h4>${title}</h4>${content}</div>` : '';
  document.getElementById('modalContent').innerHTML = [
    section('Introduction', `<p>${(c.introduction || '').replace(/\n/g, '<br>')}</p>`),
    section('Key Points', `<ul>${(c.keyPoints || []).map(p => `<li>${p}</li>`).join('')}</ul>`),
    section('Explanation', `<p>${(c.explanation || '').replace(/\n/g, '<br>')}</p>`),
    (c.examples || []).length ? section('Examples', c.examples.map(ex =>
      `<div style="background:rgba(124,58,237,0.06);border-radius:10px;padding:12px;margin-bottom:8px"><div style="font-weight:700;font-size:0.85rem;margin-bottom:4px">${ex.title}</div><p>${ex.content}</p></div>`
    ).join('')) : '',
    section('Practice Questions', `<ul>${(c.practiceQuestions || []).map(q => `<li>${q}</li>`).join('')}</ul>`),
    c.notes ? section('Notes', `<p>${c.notes}</p>`) : '',
    (c.resources || []).length ? section('Resources', `<ul>${c.resources.map(r => `<li>${r}</li>`).join('')}</ul>`) : ''
  ].join('');
}

function closeModal() {
  document.getElementById('topicModal').classList.remove('open');
  currentTopicContent = null;
}

// ── PDF Generation — proper formatted PDF via print ──
function downloadTopicPDF() {
  if (!currentTopicContent) return;
  const c = currentTopicContent;
  const title = document.getElementById('modalTitle').textContent;
  const date = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>${title} — Dream Wave</title>
<style>
  body { font-family: Georgia, serif; max-width: 800px; margin: 40px auto; padding: 0 40px; color: #1a1a1a; line-height: 1.7; }
  .header { border-bottom: 3px solid #7c3aed; padding-bottom: 20px; margin-bottom: 30px; }
  .brand { color: #7c3aed; font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
  h1 { font-size: 1.8rem; margin: 0 0 6px; color: #1a1a1a; }
  .meta { color: #666; font-size: 0.85rem; }
  h2 { font-size: 1.1rem; font-weight: 700; color: #7c3aed; border-left: 3px solid #7c3aed; padding-left: 10px; margin: 28px 0 12px; text-transform: uppercase; letter-spacing: 0.5px; }
  p { margin: 0 0 12px; color: #333; }
  ul { padding-left: 20px; margin: 0 0 12px; }
  li { margin-bottom: 6px; color: #333; }
  .example-box { background: #f8f5ff; border-left: 3px solid #a78bfa; padding: 12px 16px; margin: 10px 0; border-radius: 4px; }
  .example-title { font-weight: 700; color: #7c3aed; margin-bottom: 4px; font-size: 0.9rem; }
  .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #ddd; color: #999; font-size: 0.78rem; text-align: center; }
  @media print { body { margin: 20px; } }
</style>
</head>
<body>
  <div class="header">
    <div class="brand">🌊 Dream Wave — Learning Content</div>
    <h1>${title}</h1>
    <div class="meta">Goal: ${currentGoal} &nbsp;|&nbsp; Generated: ${date}</div>
  </div>

  ${c.introduction ? `<h2>Introduction</h2><p>${c.introduction.replace(/\n/g, '<br>')}</p>` : ''}

  ${(c.keyPoints || []).length ? `<h2>Key Points</h2><ul>${c.keyPoints.map(p => `<li>${p}</li>`).join('')}</ul>` : ''}

  ${c.explanation ? `<h2>Explanation</h2><p>${c.explanation.replace(/\n/g, '<br>')}</p>` : ''}

  ${(c.examples || []).length ? `<h2>Examples</h2>${c.examples.map(ex => `<div class="example-box"><div class="example-title">${ex.title}</div><p>${ex.content}</p></div>`).join('')}` : ''}

  ${(c.practiceQuestions || []).length ? `<h2>Practice Questions</h2><ul>${c.practiceQuestions.map((q, i) => `<li>${q}</li>`).join('')}</ul>` : ''}

  ${c.notes ? `<h2>Notes</h2><p>${c.notes}</p>` : ''}

  ${(c.resources || []).length ? `<h2>Resources</h2><ul>${c.resources.map(r => `<li>${r}</li>`).join('')}</ul>` : ''}

  <div class="footer">Dream Wave · dreamwave.app · Generated on ${date}</div>
</body>
</html>`;

  const win = window.open('', '_blank');
  win.document.write(html);
  win.document.close();
  win.onload = () => { win.print(); };
}

// Close modal on overlay click
document.getElementById('topicModal').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});

init();
