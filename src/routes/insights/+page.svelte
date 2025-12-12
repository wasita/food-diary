<script lang="ts">
  import { onMount } from 'svelte';
  import { collection, query, orderBy, getDocs } from 'firebase/firestore';
  import { getDb } from '$lib/firebase';
  import { userId, initUser, isLoading } from '$lib/stores/user';
  import { type DayEntry } from '$lib/stores/entries';
  import { calculateCorrelations, getSummaryStats, getSafeFoods } from '$lib/utils/analytics';
  import SuspectFoods from '$lib/components/SuspectFoods.svelte';
  import { get } from 'svelte/store';

  let entries = $state<DayEntry[]>([]);
  let loadingEntries = $state(true);
  let lagHours = $state(24);

  let correlations = $derived(calculateCorrelations(entries, lagHours));
  let safeFoods = $derived(getSafeFoods(correlations));
  let stats = $derived(getSummaryStats(entries));

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

  const lagOptions = [
    { value: 6, label: '6 hours' },
    { value: 12, label: '12 hours' },
    { value: 24, label: '24 hours' },
    { value: 48, label: '48 hours' },
  ];
</script>

<svelte:head>
  <title>Insights - Food Diary</title>
</svelte:head>

<div class="min-h-screen bg-[#0f0f0f] pb-20">
  <!-- Header -->
  <header class="bg-gradient-to-r from-sky-400 via-purple-400 to-pink-400 text-white p-4 shadow-lg">
    <div class="max-w-lg mx-auto flex items-center gap-4">
      <a href="/" class="p-1 hover:bg-white/20 rounded-lg transition-colors" aria-label="Go back">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </a>
      <h1 class="text-xl font-bold">Insights</h1>
    </div>
  </header>

  <!-- Main content -->
  <main class="max-w-lg mx-auto p-4 space-y-6">
    {#if $isLoading || loadingEntries}
      <div class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    {:else if entries.length === 0}
      <div class="text-center py-12 text-gray-500">
        <p class="text-4xl mb-2">📊</p>
        <p>No data yet.</p>
        <p class="text-sm">Start logging food and symptoms to see insights!</p>
        <a href="/" class="inline-block mt-4 text-purple-400 font-medium hover:underline">
          Go to Log
        </a>
      </div>
    {:else}
      <!-- Summary Stats -->
      <div class="grid grid-cols-2 gap-3">
        <div class="bg-[#1a1a1a] rounded-xl p-4 text-center">
          <div class="text-2xl font-bold text-purple-400">{stats.totalDays}</div>
          <div class="text-xs text-gray-500">Days Logged</div>
        </div>
        <div class="bg-[#1a1a1a] rounded-xl p-4 text-center">
          <div class="text-2xl font-bold text-pink-400">{stats.symptomRate}%</div>
          <div class="text-xs text-gray-500">Days with Symptoms</div>
        </div>
        <div class="bg-[#1a1a1a] rounded-xl p-4 text-center">
          <div class="text-2xl font-bold text-sky-400">{stats.totalFoods}</div>
          <div class="text-xs text-gray-500">Foods Logged</div>
        </div>
        <div class="bg-[#1a1a1a] rounded-xl p-4 text-center">
          <div class="text-2xl font-bold text-orange-400">{stats.totalSymptoms}</div>
          <div class="text-xs text-gray-500">Symptoms Logged</div>
        </div>
      </div>

      <!-- Lag Window Selector -->
      <div class="bg-[#1a1a1a] rounded-xl p-4">
        <label class="text-sm font-medium text-gray-400 block mb-2">
          Time window for correlations
        </label>
        <div class="flex gap-2">
          {#each lagOptions as option}
            <button
              onclick={() => lagHours = option.value}
              class="flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors
                     {lagHours === option.value
                       ? 'bg-purple-600 text-white'
                       : 'bg-[#2a2a2a] text-gray-400 hover:bg-[#3a3a3a]'}"
            >
              {option.label}
            </button>
          {/each}
        </div>
        <p class="text-xs text-gray-500 mt-2">
          Look for foods eaten within this time before symptoms appeared
        </p>
      </div>

      <!-- Suspect Foods -->
      <SuspectFoods {correlations} {lagHours} />

      <!-- Safe Foods -->
      {#if safeFoods.length > 0}
        <div class="bg-green-900/30 rounded-xl p-4 border border-green-800/50">
          <h2 class="text-lg font-semibold text-green-400 mb-3">Likely Safe Foods</h2>
          <div class="flex flex-wrap gap-2">
            {#each safeFoods as item}
              <span class="bg-green-900/50 text-green-300 px-3 py-1 rounded-full text-sm capitalize">
                {item.food}
              </span>
            {/each}
          </div>
          <p class="text-xs text-green-500 mt-2">
            Eaten often but rarely appear before symptoms
          </p>
        </div>
      {/if}

      <!-- Top Symptoms -->
      {#if stats.topSymptoms.length > 0}
        <div class="bg-[#1a1a1a] rounded-xl p-4">
          <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Most Common Symptoms
          </h2>
          <div class="space-y-2">
            {#each stats.topSymptoms as symptom}
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="text-xl">{symptom.icon}</span>
                  <span class="text-gray-200">{symptom.label}</span>
                </div>
                <span class="text-gray-500 text-sm">{symptom.count}x</span>
              </div>
            {/each}
          </div>
        </div>
      {/if}
    {/if}
  </main>

  <!-- Bottom Navigation -->
  <nav class="fixed bottom-0 left-0 right-0 bg-[#1a1a1a] border-t border-[#2a2a2a] px-4 py-2 safe-area-pb">
    <div class="max-w-lg mx-auto flex justify-around">
      <a href="/" class="flex flex-col items-center py-2 px-4 text-gray-400 hover:text-purple-400">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        <span class="text-xs mt-1">Log</span>
      </a>
      <a href="/history" class="flex flex-col items-center py-2 px-4 text-gray-400 hover:text-purple-400">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span class="text-xs mt-1">History</span>
      </a>
      <a href="/insights" class="flex flex-col items-center py-2 px-4 text-purple-400">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <span class="text-xs mt-1">Insights</span>
      </a>
    </div>
  </nav>
</div>

<style>
  .safe-area-pb {
    padding-bottom: max(0.5rem, env(safe-area-inset-bottom));
  }
</style>
