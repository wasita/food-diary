import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { getAnonymousUser } from '$lib/firebase';

export const userId = writable<string | null>(null);
export const isLoading = writable(true);

export async function initUser() {
  if (!browser) return;

  isLoading.set(true);
  const uid = await getAnonymousUser();
  userId.set(uid);
  isLoading.set(false);
}
