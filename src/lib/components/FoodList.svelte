<script lang="ts">
  import { currentEntry, removeFood, updateFood, type MealType } from '$lib/stores/entries';

  let editingId = $state<string | null>(null);
  let editValue = $state('');
  let editMeal = $state<MealType | undefined>(undefined);

  const mealIcons: Record<MealType, string> = {
    breakfast: '🌅',
    lunch: '☀️',
    dinner: '🌙',
    snack: '🍿',
  };

  const mealTypes: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

  function startEdit(id: string, name: string, mealType?: MealType) {
    editingId = id;
    editValue = name;
    editMeal = mealType;
  }

  async function saveEdit(id: string) {
    if (editValue.trim()) {
      await updateFood(id, editValue.trim(), editMeal);
    }
    editingId = null;
    editValue = '';
    editMeal = undefined;
  }

  function handleKeydown(event: KeyboardEvent, id: string) {
    if (event.key === 'Enter') {
      saveEdit(id);
    } else if (event.key === 'Escape') {
      editingId = null;
      editValue = '';
      editMeal = undefined;
    }
  }
</script>

{#if $currentEntry && $currentEntry.foods.length > 0}
  <div class="space-y-3">
    <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wide">
      Today's Food ({$currentEntry.foods.length})
    </h2>

    <div class="space-y-2">
      {#each $currentEntry.foods as food (food.id)}
        <div class="flex items-center justify-between bg-[#1a1a1a] rounded-xl p-3">
          <div class="flex items-center gap-3 flex-1 min-w-0">
            <span class="text-xl">{food.mealType ? mealIcons[food.mealType] : '🍽️'}</span>
            <div class="flex-1 min-w-0">
              {#if editingId === food.id}
                <input
                  type="text"
                  bind:value={editValue}
                  onkeydown={(e) => handleKeydown(e, food.id)}
                  class="w-full px-2 py-1 border border-[#3a3a3a] bg-[#0f0f0f] rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400/30 mb-2 text-gray-100"
                  autofocus
                />
                <div class="flex gap-1 mb-2">
                  {#each mealTypes as meal}
                    <button
                      onclick={() => editMeal = editMeal === meal ? undefined : meal}
                      class="px-2 py-1 text-xs rounded transition-colors
                             {editMeal === meal ? 'bg-violet-500 text-white' : 'bg-[#2a2a2a] text-gray-300'}"
                    >
                      {mealIcons[meal]}
                    </button>
                  {/each}
                </div>
                <button
                  onclick={() => saveEdit(food.id)}
                  class="text-xs text-violet-500 font-medium"
                >
                  Save
                </button>
              {:else}
                <button
                  onclick={() => startEdit(food.id, food.name, food.mealType)}
                  class="font-medium text-gray-100 hover:text-violet-400 text-left truncate block max-w-full"
                  title="Click to edit"
                >
                  {food.name}
                </button>
                <div class="flex items-center gap-2">
                  {#if food.mealType}
                    <span class="text-xs text-violet-400 capitalize">{food.mealType}</span>
                    <span class="text-xs text-gray-600">·</span>
                  {/if}
                  <span class="text-xs text-gray-500">{food.timestamp}</span>
                </div>
                {#if food.notes}
                  <p class="text-sm text-gray-400 truncate">{food.notes}</p>
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
