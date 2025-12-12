<script lang="ts">
  import type { SymptomType } from '$lib/stores/symptoms';
  import { addSymptom } from '$lib/stores/entries';

  interface Props {
    symptom: SymptomType;
  }

  let { symptom }: Props = $props();
  let isLogging = $state(false);

  async function handleClick() {
    if (isLogging) return;

    isLogging = true;
    await addSymptom(symptom.id, symptom.icon, symptom.label);

    // Brief visual feedback
    setTimeout(() => {
      isLogging = false;
    }, 300);
  }
</script>

<button
  onclick={handleClick}
  disabled={isLogging}
  class="flex flex-col items-center justify-center p-4 bg-[#1a1a1a] rounded-xl
         hover:bg-[#2a2a2a] hover:scale-105 active:scale-95 transition-all duration-150
         disabled:opacity-50 disabled:scale-100 min-h-[80px]"
>
  <span class="text-4xl mb-1" class:animate-bounce={isLogging}>{symptom.icon}</span>
  <span class="text-xs text-gray-300 font-medium text-center leading-tight">
    {symptom.label}
  </span>
</button>
