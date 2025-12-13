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
  <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wide">
    Log Symptoms
  </h2>

  <div class="grid grid-cols-3 gap-3">
    {#each allSymptoms as symptom (symptom.id)}
      <SymptomButton {symptom} />
    {/each}

    <!-- Add custom symptom button -->
    <button
      onclick={onAddCustom}
      class="flex flex-col items-center justify-center p-4 bg-[#1a1a1a] rounded-xl
             border-2 border-dashed border-[#3a3a3a] hover:border-violet-400
             hover:bg-[#2a2a2a] transition-colors min-h-[80px]"
    >
      <span class="text-3xl text-gray-500">+</span>
      <span class="text-xs text-gray-400 font-medium">Add</span>
    </button>
  </div>
</div>
