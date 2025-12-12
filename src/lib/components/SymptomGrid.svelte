<script lang="ts">
  import SymptomButton from './SymptomButton.svelte';
  import { defaultSymptoms, customSymptoms } from '$lib/stores/symptoms';

  interface Props {
    onAddCustom: () => void;
  }

  let { onAddCustom }: Props = $props();

  let allSymptoms = $derived([...defaultSymptoms, ...$customSymptoms]);
</script>

<div class="space-y-3">
  <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wide">
    Log Symptoms
  </h2>

  <div class="grid grid-cols-4 gap-2">
    {#each allSymptoms as symptom (symptom.id)}
      <SymptomButton {symptom} />
    {/each}

    <!-- Add custom symptom button -->
    <button
      onclick={onAddCustom}
      class="flex flex-col items-center justify-center p-3 bg-gray-100 rounded-xl
             border-2 border-dashed border-gray-300 hover:border-indigo-400
             hover:bg-indigo-50 transition-colors"
    >
      <span class="text-2xl text-gray-400">+</span>
      <span class="text-xs text-gray-500 font-medium">Add</span>
    </button>
  </div>
</div>
