// firebase.js - Dream Wave Firebase initialization
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: 'AIzaSyBeHqGtuDBHaaeme4BQ3X7DXFChG4e_cRQ',
  authDomain: 'aa-dream-wave-19b94.firebaseapp.com',
  projectId: 'aa-dream-wave-19b94',
  storageBucket: 'aa-dream-wave-19b94.firebasestorage.app',
  messagingSenderId: '271215653734',
  appId: '1:271215653734:web:cdde2e0174bb66d8510ea7'
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Convert AA ID to Firebase-compatible email
export function aaIdToEmail(aaId) {
  return aaId.trim().toLowerCase().replace(/^@/, '') + '@aaai.app';
}

// Resolve login input: real email or AA ID -> email
export function resolveEmail(input) {
  const clean = input.trim().toLowerCase();
  if (clean.includes('@') && clean.includes('.')) return clean;
  return aaIdToEmail(clean);
}

// Sign up: create Firebase Auth user + save profile to Firestore
export async function firebaseSignup({ name, email, password }) {
  const loginEmail = email.trim().toLowerCase();
  const userCred = await createUserWithEmailAndPassword(auth, loginEmail, password);
  const uid = userCred.user.uid;
  await setDoc(doc(db, 'users', uid), {
    uid,
    name: name || '',
    aaId: '',
    email: loginEmail,
    createdAt: serverTimestamp(),
    credits: 0,
    goal: '',
    goalLocked: false,
    streak: 0,
    points: 0,
    level: 1,
    badges: []
  });
  return userCred.user;
}

// Login: resolve email or AA ID, sign in with Firebase
export async function firebaseLogin(identifier, password) {
  const email = resolveEmail(identifier);
  const userCred = await signInWithEmailAndPassword(auth, email, password);
  return userCred.user;
}

// Sign out
export async function firebaseLogout() {
  await signOut(auth);
}

// Auth state observer
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

// Get user profile from Firestore
export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
}

// Log a search event
export async function logSearch(userId, aaId, searchText) {
  try {
    await addDoc(collection(db, 'searchLogs'), {
      userId, aaId: aaId || '', searchText, createdAt: serverTimestamp()
    });
  } catch (e) { console.warn('Search log failed:', e.message); }
}

// Save a task
export async function saveTask(userId, task) {
  return addDoc(collection(db, 'tasks'), {
    userId,
    title: task.title,
    description: task.description || '',
    status: 'pending',
    points: task.points || 10,
    createdAt: serverTimestamp()
  });
}

// Save a reel
export async function saveReel(userId, reel) {
  return addDoc(collection(db, 'reels'), {
    userId, videoUrl: reel.videoUrl, title: reel.title || '',
    likes: 0, createdAt: serverTimestamp()
  });
}

// Send comrade request
export async function sendComradeRequest(userId, comradeId) {
  return addDoc(collection(db, 'comrades'), {
    userId, comradeId, status: 'pending', createdAt: serverTimestamp()
  });
}

// Send chat message
export async function sendMessage(senderId, receiverId, message) {
  return addDoc(collection(db, 'messages'), {
    senderId, receiverId, message, createdAt: serverTimestamp()
  });
}

// Firebase error code -> friendly message
export function friendlyError(code) {
  const map = {
    'auth/email-already-in-use': 'This email is already registered.',
    'auth/invalid-email': 'Invalid email address.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/user-not-found': 'No account found with this email or AA ID.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/invalid-credential': 'Invalid email/AA ID or password.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Check your connection.'
  };
  return map[code] || 'Something went wrong. Please try again.';
}