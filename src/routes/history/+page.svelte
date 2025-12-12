<script lang="ts">
  import { onMount } from 'svelte';
  import { collection, query, orderBy, getDocs } from 'firebase/firestore';
  import { getDb } from '$lib/firebase';
  import { userId, initUser, isLoading } from '$lib/stores/user';
  import { loadEntry, formatDate, parseDate, type DayEntry } from '$lib/stores/entries';
  import { goto } from '$app/navigation';
  import { get } from 'svelte/store';

  let entries = $state<DayEntry[]>([]);
  let loadingEntries = $state(true);

  onMount(async () => {
    await initUser();
    await loadAllEntries();
  });

  async function loadAllEntries() {
    const uid = get(userId);
    if (!uid) {
      loadingEntries = false;
      return;
    }

    try {
      const entriesRef = collection(getDb(), 'users', uid, 'entries');
      const q = query(entriesRef, orderBy('date', 'desc'));
      const snapshot = await getDocs(q);

      entries = snapshot.docs.map(doc => doc.data() as DayEntry);
    } catch (error) {
      console.error('Error loading entries:', error);
    }

    loadingEntries = false;
  }

  function goToDay(date: string) {
    loadEntry(date);
    goto('/');
  }

  function formatDisplayDate(dateStr: string): string {
    return parseDate(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  }

  function isToday(dateStr: string): boolean {
    return dateStr === formatDate(new Date());
  }
</script>

<svelte:head>
  <title>History - Food Diary</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
  <!-- Header -->
  <header class="bg-gradient-to-r from-sky-400 via-purple-400 to-pink-400 text-white p-4 shadow-lg">
    <div class="max-w-lg mx-auto flex items-center gap-4">
      <a href="/" class="p-1 hover:bg-white/20 rounded-lg transition-colors" aria-label="Go back">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </a>
      <h1 class="text-xl font-bold">History</h1>
    </div>
  </header>

  <!-- Main content -->
  <main class="max-w-lg mx-auto p-4">
    {#if $isLoading || loadingEntries}
      <div class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    {:else if entries.length === 0}
      <div class="text-center py-12 text-gray-400">
        <p class="text-4xl mb-2">📅</p>
        <p>No entries yet.</p>
        <p class="text-sm">Start logging to see your history!</p>
        <a href="/" class="inline-block mt-4 text-indigo-600 font-medium hover:underline">
          Go to Today
        </a>
      </div>
    {:else}
      <div class="space-y-3">
        {#each entries as entry (entry.date)}
          <button
            onclick={() => goToDay(entry.date)}
            class="w-full bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow text-left"
          >
            <div class="flex items-center justify-between mb-2">
              <span class="font-semibold text-gray-800">
                {formatDisplayDate(entry.date)}
                {#if isToday(entry.date)}
                  <span class="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full ml-2">
                    Today
                  </span>
                {/if}
              </span>
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>

            <!-- Summary -->
            <div class="flex flex-wrap gap-2 text-sm">
              {#if entry.symptoms.length > 0}
                <div class="flex items-center gap-1 text-gray-600">
                  <span>Symptoms:</span>
                  {#each entry.symptoms.slice(0, 4) as symptom}
                    <span>{symptom.icon}</span>
                  {/each}
                  {#if entry.symptoms.length > 4}
                    <span class="text-gray-400">+{entry.symptoms.length - 4}</span>
                  {/if}
                </div>
              {/if}

              {#if entry.foods.length > 0}
                <div class="text-gray-500">
                  🍽️ {entry.foods.length} food{entry.foods.length > 1 ? 's' : ''}
                </div>
              {/if}

              {#if entry.symptoms.length === 0 && entry.foods.length === 0}
                <span class="text-gray-400 italic">No entries</span>
              {/if}
            </div>
          </button>
        {/each}
      </div>
    {/if}
  </main>
</div>
