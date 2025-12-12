<script lang="ts">
  import { addCustomSymptom } from '$lib/stores/symptoms';

  interface Props {
    isOpen: boolean;
    onClose: () => void;
  }

  let { isOpen, onClose }: Props = $props();

  let selectedEmoji = $state('😐');
  let label = $state('');
  let isSubmitting = $state(false);

  const commonEmojis = [
    '😐', '😣', '😫', '😖', '🤒', '🥴', '😵', '🤮',
    '💢', '🔥', '❄️', '💫', '🌀', '⚠️', '❗', '🚫'
  ];

  async function handleSubmit() {
    if (!label.trim() || isSubmitting) return;

    isSubmitting = true;
    await addCustomSymptom(selectedEmoji, label.trim());

    // Reset and close
    selectedEmoji = '😐';
    label = '';
    isSubmitting = false;
    onClose();
  }

  function handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      onClose();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_interactive_supports_focus -->
  <div
    onclick={handleBackdropClick}
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
    class="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4"
  >
    <div class="bg-white rounded-2xl w-full max-w-md p-6 space-y-4">
      <h2 id="modal-title" class="text-xl font-bold text-gray-800">Add Custom Symptom</h2>

      <!-- Emoji picker -->
      <div class="space-y-2">
        <span class="text-sm font-medium text-gray-600">Choose an icon</span>
        <div class="flex flex-wrap gap-2">
          {#each commonEmojis as emoji}
            <button
              onclick={() => selectedEmoji = emoji}
              class="w-10 h-10 text-xl rounded-lg transition-all
                     {selectedEmoji === emoji
                       ? 'bg-indigo-100 ring-2 ring-indigo-400'
                       : 'bg-gray-100 hover:bg-gray-200'}"
            >
              {emoji}
            </button>
          {/each}
        </div>
      </div>

      <!-- Label input -->
      <div class="space-y-2">
        <label for="symptom-label" class="text-sm font-medium text-gray-600">
          Symptom name
        </label>
        <input
          id="symptom-label"
          bind:value={label}
          type="text"
          placeholder="e.g., Acid Reflux"
          class="w-full px-4 py-3 rounded-xl border border-gray-200
                 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100
                 outline-none transition-all"
        />
      </div>

      <!-- Preview -->
      <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
        <span class="text-2xl">{selectedEmoji}</span>
        <span class="font-medium text-gray-700">
          {label || 'Preview'}
        </span>
      </div>

      <!-- Actions -->
      <div class="flex gap-3">
        <button
          onclick={onClose}
          class="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium
                 hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          onclick={handleSubmit}
          disabled={!label.trim() || isSubmitting}
          class="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl font-medium
                 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed
                 transition-colors"
        >
          Add Symptom
        </button>
      </div>
    </div>
  </div>
{/if}
