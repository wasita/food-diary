import { initializeApp, type FirebaseApp } from 'firebase/app';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, type Firestore } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged, type Auth } from 'firebase/auth';
import { browser } from '$app/environment';
import {
  PUBLIC_FIREBASE_API_KEY,
  PUBLIC_FIREBASE_AUTH_DOMAIN,
  PUBLIC_FIREBASE_PROJECT_ID,
  PUBLIC_FIREBASE_STORAGE_BUCKET,
  PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  PUBLIC_FIREBASE_APP_ID
} from '$env/static/public';

const firebaseConfig = {
  apiKey: PUBLIC_FIREBASE_API_KEY,
  authDomain: PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: PUBLIC_FIREBASE_APP_ID
};

// Lazy initialization - only on client
let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;

function initFirebase() {
  if (!browser) return;
  if (app) return; // Already initialized

  app = initializeApp(firebaseConfig);
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  });
  auth = getAuth(app);
}

export function getDb(): Firestore {
  initFirebase();
  if (!db) throw new Error('Firestore not initialized');
  return db;
}

export function getFirebaseAuth(): Auth {
  initFirebase();
  if (!auth) throw new Error('Auth not initialized');
  return auth;
}

// Get or create anonymous user
export async function getAnonymousUser(): Promise<string | null> {
  if (!browser) return null;

  const firebaseAuth = getFirebaseAuth();

  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
      unsubscribe();
      if (user) {
        resolve(user.uid);
      } else {
        try {
          const result = await signInAnonymously(firebaseAuth);
          resolve(result.user.uid);
        } catch (error) {
          console.error('Anonymous auth failed:', error);
          resolve(null);
        }
      }
    });
  });
}
