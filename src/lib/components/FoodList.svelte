<script lang="ts">
  import { currentEntry, removeFood, updateFood } from '$lib/stores/entries';

  let editingId = $state<string | null>(null);
  let editValue = $state('');

  function startEdit(id: string, name: string) {
    editingId = id;
    editValue = name;
  }

  async function saveEdit(id: string) {
    if (editValue.trim()) {
      await updateFood(id, editValue.trim());
    }
    editingId = null;
    editValue = '';
  }

  function handleKeydown(event: KeyboardEvent, id: string) {
    if (event.key === 'Enter') {
      saveEdit(id);
    } else if (event.key === 'Escape') {
      editingId = null;
      editValue = '';
    }
  }
</script>

{#if $currentEntry && $currentEntry.foods.length > 0}
  <div class="space-y-3">
    <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wide">
      Today's Food ({$currentEntry.foods.length})
    </h2>

    <div class="space-y-2">
      {#each $currentEntry.foods as food (food.id)}
        <div class="flex items-center justify-between bg-white rounded-xl p-3 shadow-sm">
          <div class="flex items-center gap-3 flex-1 min-w-0">
            <span class="text-xl">🍽️</span>
            <div class="flex-1 min-w-0">
              {#if editingId === food.id}
                <input
                  type="text"
                  bind:value={editValue}
                  onkeydown={(e) => handleKeydown(e, food.id)}
                  onblur={() => saveEdit(food.id)}
                  class="w-full px-2 py-1 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  autofocus
                />
              {:else}
                <button
                  onclick={() => startEdit(food.id, food.name)}
                  class="font-medium text-gray-800 hover:text-indigo-600 text-left truncate block max-w-full"
                  title="Click to edit"
                >
                  {food.name}
                </button>
                <span class="text-xs text-gray-400">{food.timestamp}</span>
                {#if food.notes}
                  <p class="text-sm text-gray-500 truncate">{food.notes}</p>
                {/if}
              {/if}
            </div>
          </div>
          <button
            onclick={() => removeFood(food.id)}
            class="p-1 text-gray-400 hover:text-red-500 transition-colors ml-2"
            aria-label="Remove food"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      {/each}
    </div>
  </div>
{/if}
