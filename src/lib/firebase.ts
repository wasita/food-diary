import { initializeApp, type FirebaseApp } from 'firebase/app';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, type Firestore } from 'firebase/firestore';
import { getAuth, signInWithRedirect, getRedirectResult, signOut as firebaseSignOut, onAuthStateChanged, GoogleAuthProvider, type Auth, type User } from 'firebase/auth';
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

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

// Sign in with Google (using redirect for better compatibility)
export async function signInWithGoogle(): Promise<void> {
  if (!browser) return;

  try {
    const firebaseAuth = getFirebaseAuth();
    await signInWithRedirect(firebaseAuth, googleProvider);
  } catch (error) {
    console.error('Google sign-in failed:', error);
  }
}

// Handle redirect result (call on app init)
export async function handleAuthRedirect(): Promise<User | null> {
  if (!browser) return null;

  try {
    const firebaseAuth = getFirebaseAuth();
    const result = await getRedirectResult(firebaseAuth);
    return result?.user ?? null;
  } catch (error) {
    console.error('Auth redirect error:', error);
    return null;
  }
}

// Sign out
export async function signOut(): Promise<void> {
  if (!browser) return;

  try {
    const firebaseAuth = getFirebaseAuth();
    await firebaseSignOut(firebaseAuth);
  } catch (error) {
    console.error('Sign out failed:', error);
  }
}

// Listen to auth state changes
export function onAuthChange(callback: (user: User | null) => void): () => void {
  if (!browser) return () => {};

  const firebaseAuth = getFirebaseAuth();
  return onAuthStateChanged(firebaseAuth, callback);
}
