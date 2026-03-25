// app.js — shared utilities for Dream Wave

const API_URL = window.API_URL || (window.location.hostname === 'localhost'
  ? 'http://localhost:5000/api'
  : 'https://aa-dream-wave-backend.onrender.com/api');

// ── Auth ──
function checkAuth() {
  const token = localStorage.getItem('token');
  if (!token) { window.location.href = 'login.html'; return; }
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = 'login.html';
    }
  } catch(e) {}
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'login.html';
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
