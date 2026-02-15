let bucket = null;
let initialized = false;

function init() {
  if (initialized) return;
  initialized = true;

  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    const admin = require('firebase-admin');
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
      storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`,
    });
    bucket = admin.storage().bucket();
  } else {
    console.warn('Firebase env vars not set — image uploads will not work');
  }
}

async function uploadImage(file, userId) {
  init();
  if (!bucket) throw new Error('Firebase Storage not configured');

  const crypto = require('crypto');
  const ext = file.mimetype === 'image/png' ? 'png' : 'jpg';
  const filename = `vehicles/${userId}/${crypto.randomUUID()}.${ext}`;
  const blob = bucket.file(filename);

  await blob.save(file.buffer, {
    contentType: file.mimetype,
    metadata: { firebaseStorageDownloadTokens: crypto.randomUUID() },
  });

  await blob.makePublic();
  const url = `https://storage.googleapis.com/${bucket.name}/${filename}`;
  return url;
}

module.exports = { uploadImage, init };
