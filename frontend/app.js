// app.js — shared utilities loaded on every page
// Uses Firebase Auth for session management

import { auth, firebaseLogout } from './firebase.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';

// Check if user is logged in; redirect to login if not
// Pass requireAuth=true on protected pages
export function checkAuth(redirectIfLoggedIn = false) {
  onAuthStateChanged(auth, (user) => {
    if (!user && !redirectIfLoggedIn) {
      window.location.href = 'login.html';
    }
    if (user && redirectIfLoggedIn) {
      window.location.href = 'dashboard.html';
    }
    if (user) {
      localStorage.setItem('uid', user.uid);
      localStorage.setItem('email', user.email);
    }
  });
}

// Log out and redirect
export async function logout() {
  try {
    await firebaseLogout();
  } catch (e) {
    console.warn('Logout error:', e.message);
  }
  localStorage.removeItem('uid');
  localStorage.removeItem('email');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'login.html';
}

// Get current Firebase user (sync snapshot)
export function getCurrentUser() {
  return auth.currentUser;
}

// Toggle dark/light theme
export function toggleTheme() {
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
