import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { onAuthChange, signInWithGoogle, signOut } from '$lib/firebase';
import type { User } from 'firebase/auth';

export const user = writable<User | null>(null);
export const userId = writable<string | null>(null);
export const isLoading = writable(true);
export const isAuthenticated = writable(false);

let unsubscribe: (() => void) | null = null;

export function initAuth() {
  if (!browser) return;
  if (unsubscribe) return; // Already initialized

  isLoading.set(true);

  unsubscribe = onAuthChange((firebaseUser) => {
    user.set(firebaseUser);
    userId.set(firebaseUser?.uid ?? null);
    isAuthenticated.set(!!firebaseUser);
    isLoading.set(false);
  });
}

export async function login(): Promise<boolean> {
  const result = await signInWithGoogle();
  return !!result;
}

export async function logout(): Promise<void> {
  await signOut();
}

// Legacy function for compatibility
export async function initUser() {
  initAuth();
}
