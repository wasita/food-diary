<script lang="ts">
  import { onMount } from 'svelte';
  import { initUser, isLoading } from '$lib/stores/user';
  import { loadEntry, formatDate, currentEntry } from '$lib/stores/entries';
  import { loadCustomSymptoms } from '$lib/stores/symptoms';
  import { loadFoodHistory } from '$lib/stores/entries';
  import DayPicker from '$lib/components/DayPicker.svelte';
  import SymptomGrid from '$lib/components/SymptomGrid.svelte';
  import SymptomList from '$lib/components/SymptomList.svelte';
  import FoodInput from '$lib/components/FoodInput.svelte';
  import FoodList from '$lib/components/FoodList.svelte';
  import AddSymptomModal from '$lib/components/AddSymptomModal.svelte';

  let showAddSymptomModal = $state(false);

  onMount(async () => {
    await initUser();
    await Promise.all([
      loadEntry(formatDate(new Date())),
      loadCustomSymptoms(),
      loadFoodHistory(),
    ]);
  });
</script>

<svelte:head>
  <title>Food Diary</title>
  <meta name="description" content="Track your food and symptoms" />
</svelte:head>

<div class="min-h-screen bg-gray-50">
  <!-- Header -->
  <header class="bg-gradient-to-r from-sky-400 via-purple-400 to-pink-400 text-white p-4 shadow-lg">
    <div class="max-w-lg mx-auto flex items-center justify-between">
      <h1 class="text-xl font-bold">Food Diary</h1>
      <a href="/history" class="text-white/70 hover:text-white transition-colors" aria-label="View history">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </a>
    </div>
  </header>

  <!-- Main content -->
  <main class="max-w-lg mx-auto p-4 pb-24 space-y-6">
    {#if $isLoading}
      <div class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    {:else}
      <DayPicker />

      <SymptomGrid onAddCustom={() => showAddSymptomModal = true} />

      <SymptomList />

      <FoodInput />

      <FoodList />

      <!-- Empty state -->
      {#if $currentEntry && $currentEntry.symptoms.length === 0 && $currentEntry.foods.length === 0}
        <div class="text-center py-8 text-gray-400">
          <p class="text-4xl mb-2">📝</p>
          <p>No entries yet today.</p>
          <p class="text-sm">Tap a symptom or add food to get started!</p>
        </div>
      {/if}
    {/if}
  </main>
</div>

<AddSymptomModal
  isOpen={showAddSymptomModal}
  onClose={() => showAddSymptomModal = false}
/>

<!-- Bottom Navigation -->
<nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 safe-area-pb">
  <div class="max-w-lg mx-auto flex justify-around">
    <a href="/" class="flex flex-col items-center py-2 px-4 text-purple-600">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
      <span class="text-xs mt-1">Log</span>
    </a>
    <a href="/history" class="flex flex-col items-center py-2 px-4 text-gray-400 hover:text-purple-600">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <span class="text-xs mt-1">History</span>
    </a>
    <a href="/insights" class="flex flex-col items-center py-2 px-4 text-gray-400 hover:text-purple-600">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
      <span class="text-xs mt-1">Insights</span>
    </a>
  </div>
</nav>

<style>
  .safe-area-pb {
    padding-bottom: max(0.5rem, env(safe-area-inset-bottom));
  }
</style>
