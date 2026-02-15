let firebaseApp = null
let firebaseDb = null
let firebaseStorage = null
let firebaseAuth = null
let initPromise = null

export async function initFirebase() {
  // Return cached instance if already initialized
  if (firebaseApp) {
    return { app: firebaseApp, db: firebaseDb, storage: firebaseStorage, auth: firebaseAuth }
  }

  // Prevent multiple simultaneous init calls
  if (initPromise) return initPromise

  initPromise = (async () => {
    try {
      const apiKey = import.meta.env.VITE_FIREBASE_API_KEY
      const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN
      const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID
      const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET
      const messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID
      const appId = import.meta.env.VITE_FIREBASE_APP_ID

      // Graceful degradation if config is missing
      if (!apiKey || !projectId) {
        console.warn('[Firebase] Missing config — chat features will be unavailable')
        return null
      }

      const firebaseConfig = {
        apiKey,
        authDomain,
        projectId,
        storageBucket,
        messagingSenderId,
        appId,
      }

      // Lazy-load Firebase modules
      const { initializeApp } = await import('firebase/app')
      const { getFirestore } = await import('firebase/firestore')
      const { getStorage } = await import('firebase/storage')
      const { getAuth } = await import('firebase/auth')

      firebaseApp = initializeApp(firebaseConfig)
      firebaseDb = getFirestore(firebaseApp)
      firebaseStorage = getStorage(firebaseApp)
      firebaseAuth = getAuth(firebaseApp)

      return { app: firebaseApp, db: firebaseDb, storage: firebaseStorage, auth: firebaseAuth }
    } catch (err) {
      console.warn('[Firebase] Failed to initialize:', err.message)
      initPromise = null
      return null
    }
  })()

  return initPromise
}

export default { initFirebase }
