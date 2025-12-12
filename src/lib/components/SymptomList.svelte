<script lang="ts">
  import { currentEntry, removeSymptom } from '$lib/stores/entries';
</script>

{#if $currentEntry && $currentEntry.symptoms.length > 0}
  <div class="space-y-3">
    <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wide">
      Today's Symptoms ({$currentEntry.symptoms.length})
    </h2>

    <div class="flex flex-wrap gap-2">
      {#each $currentEntry.symptoms as symptom (symptom.id)}
        <div class="flex items-center gap-2 bg-[#1a1a1a] rounded-full pl-3 pr-2 py-1">
          <span class="text-lg">{symptom.icon}</span>
          <span class="text-sm font-medium text-gray-200">{symptom.label}</span>
          <span class="text-xs text-gray-500">{symptom.timestamp}</span>
          <button
            onclick={() => removeSymptom(symptom.id)}
            class="p-1 text-gray-400 hover:text-red-500 transition-colors"
            aria-label="Remove symptom"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      {/each}
    </div>
  </div>
{/if}
