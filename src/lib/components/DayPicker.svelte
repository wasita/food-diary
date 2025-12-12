<script lang="ts">
  import { currentDate, formatDate, parseDate, loadEntry } from '$lib/stores/entries';

  function navigateDay(offset: number) {
    const current = parseDate($currentDate);
    current.setDate(current.getDate() + offset);
    loadEntry(formatDate(current));
  }

  function goToToday() {
    loadEntry(formatDate(new Date()));
  }

  function handleDateChange(event: Event) {
    const input = event.target as HTMLInputElement;
    loadEntry(input.value);
  }

  let isToday = $derived($currentDate === formatDate(new Date()));
  let displayDate = $derived(parseDate($currentDate).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  }));
</script>

<div class="flex items-center justify-between bg-white rounded-xl p-3 shadow-sm">
  <button
    onclick={() => navigateDay(-1)}
    class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
    aria-label="Previous day"
  >
    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
    </svg>
  </button>

  <div class="flex flex-col items-center gap-1">
    <input
      type="date"
      value={$currentDate}
      onchange={handleDateChange}
      class="text-lg font-semibold text-center bg-transparent cursor-pointer"
    />
    <span class="text-sm text-gray-500">{displayDate}</span>
    {#if !isToday}
      <button
        onclick={goToToday}
        class="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
      >
        Go to Today
      </button>
    {/if}
  </div>

  <button
    onclick={() => navigateDay(1)}
    class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
    aria-label="Next day"
  >
    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
    </svg>
  </button>
</div>
