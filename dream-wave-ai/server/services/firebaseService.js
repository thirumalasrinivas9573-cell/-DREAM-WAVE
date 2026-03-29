const admin = require('firebase-admin');

let db = null;
let initialized = false;

function initFirebase() {
  if (initialized) return;
  initialized = true;

  const projectId   = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey  = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey || projectId === 'your_firebase_project_id') {
    console.warn('⚠️  Firebase not configured — chat will save to MongoDB only');
    return;
  }

  try {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, '\n')
        })
      });
    }
    db = admin.firestore();
    console.log('🔥 Firebase connected');
  } catch (err) {
    console.warn('⚠️  Firebase init failed:', err.message);
  }
}

// Save goal session to Firestore (non-blocking)
async function saveGoalToFirebase(userId, data) {
  if (!db) return null;
  try {
    const ref = await db.collection('goals').add({
      userId:    userId.toString(),
      goal:      data.goal,
      messages:  data.messages,
      summary:   data.summary || null,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    return ref.id;
  } catch (err) {
    console.warn('Firebase save failed:', err.message);
    return null;
  }
}

module.exports = { initFirebase, saveGoalToFirebase };
