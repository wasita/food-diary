<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { user, logout, isAuthenticated, isLoading } from '$lib/stores/user';
  import { loadEntry, formatDate, currentEntry } from '$lib/stores/entries';
  import { loadCustomSymptoms } from '$lib/stores/symptoms';
  import { loadFoodHistory } from '$lib/stores/entries';
  import { startReminderChecker, stopReminderChecker, reminderSettings } from '$lib/stores/reminders';
  import DayPicker from '$lib/components/DayPicker.svelte';
  import SymptomGrid from '$lib/components/SymptomGrid.svelte';
  import SymptomList from '$lib/components/SymptomList.svelte';
  import FoodInput from '$lib/components/FoodInput.svelte';
  import FoodList from '$lib/components/FoodList.svelte';
  import AddSymptomModal from '$lib/components/AddSymptomModal.svelte';
  import ReminderSettings from '$lib/components/ReminderSettings.svelte';

  let showAddSymptomModal = $state(false);
  let showReminderSettings = $state(false);
  let showUserMenu = $state(false);

  onMount(async () => {
    if ($isAuthenticated) {
      await Promise.all([
        loadEntry(formatDate(new Date())),
        loadCustomSymptoms(),
        loadFoodHistory(),
      ]);

      // Start reminder checker if enabled
      if ($reminderSettings.enabled) {
        startReminderChecker();
      }
    }
  });

  onDestroy(() => {
    stopReminderChecker();
  });

  async function handleLogout() {
    await logout();
    showUserMenu = false;
  }

  function handleClickOutside(event: MouseEvent) {
    if (showUserMenu) {
      showUserMenu = false;
    }
  }
</script>

<svelte:window onclick={handleClickOutside} />

<svelte:head>
  <title>Food Diary</title>
  <meta name="description" content="Track your food and symptoms" />
</svelte:head>

<div class="min-h-screen bg-[#0f0f0f]">
  <!-- Header -->
  <header class="bg-gradient-to-r from-blue-300 via-violet-400 to-violet-500 text-white p-4 shadow-lg">
    <div class="max-w-lg mx-auto flex items-center justify-between">
      <h1 class="text-xl font-bold">Food Diary</h1>
      <div class="flex items-center gap-2">
        <button
          onclick={() => showReminderSettings = true}
          class="p-1 text-white/70 hover:text-white transition-colors"
          aria-label="Reminder settings"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>

        <!-- User menu -->
        <div class="relative">
          <button
            onclick={() => showUserMenu = !showUserMenu}
            class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center overflow-hidden hover:bg-white/30 transition-colors"
            aria-label="User menu"
          >
            {#if $user?.photoURL}
              <img src={$user.photoURL} alt="" class="w-full h-full object-cover" />
            {:else}
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            {/if}
          </button>

          {#if showUserMenu}
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <div
              class="absolute right-0 top-10 bg-[#1a1a1a] rounded-xl shadow-lg border border-[#2a2a2a] py-2 min-w-[180px] z-50"
              onclick={(e) => e.stopPropagation()}
            >
              <div class="px-4 py-2 border-b border-[#2a2a2a]">
                <p class="text-sm font-medium text-gray-100 truncate">{$user?.displayName || 'User'}</p>
                <p class="text-xs text-gray-500 truncate">{$user?.email}</p>
              </div>
              <button
                onclick={handleLogout}
                class="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-[#2a2a2a] transition-colors"
              >
                Sign out
              </button>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </header>

  <!-- Main content -->
  <main class="max-w-lg mx-auto p-4 pb-24 space-y-6">
    {#if $isLoading}
      <div class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-400"></div>
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

<ReminderSettings
  isOpen={showReminderSettings}
  onClose={() => showReminderSettings = false}
/>

<!-- Bottom Navigation -->
<nav class="fixed bottom-0 left-0 right-0 bg-[#1a1a1a] border-t border-[#2a2a2a] px-4 py-2 safe-area-pb">
  <div class="max-w-lg mx-auto flex justify-around">
    <a href="/" class="flex flex-col items-center py-2 px-4 text-violet-500">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
      <span class="text-xs mt-1">Log</span>
    </a>
    <a href="/history" class="flex flex-col items-center py-2 px-4 text-gray-400 hover:text-violet-500">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <span class="text-xs mt-1">History</span>
    </a>
    <a href="/insights" class="flex flex-col items-center py-2 px-4 text-gray-400 hover:text-violet-500">
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
