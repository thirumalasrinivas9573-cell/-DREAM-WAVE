// app.js — shared utilities loaded on every page

// Check if user is logged in, redirect to login if not
function checkAuth() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'login.html';
  }
}

// Log out and clear session
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'login.html';
}

// Toggle dark/light theme
function toggleTheme() {
  const isDark = document.body.classList.toggle('dark-mode');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  const btn = document.getElementById('themeToggle');
  if (btn) btn.textContent = isDark ? '☀️' : '🌙';
}

// Apply saved theme on page load
(function applyTheme() {
  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
    const btn = document.getElementById('themeToggle');
    if (btn) btn.textContent = '☀️';
  }
})();
