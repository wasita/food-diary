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
  <main class="max-w-lg mx-auto p-4 space-y-6">
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
