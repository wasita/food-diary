<script lang="ts">
  import { foodHistory, addFood } from '$lib/stores/entries';

  let inputValue = $state('');
  let showSuggestions = $state(false);
  let inputRef: HTMLInputElement;

  let suggestions = $derived(inputValue.length > 0
    ? $foodHistory.filter(f =>
        f.toLowerCase().includes(inputValue.toLowerCase())
      ).slice(0, 5)
    : []);

  async function handleSubmit() {
    if (!inputValue.trim()) return;

    await addFood(inputValue.trim());
    inputValue = '';
    showSuggestions = false;
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSubmit();
    }
  }

  function selectSuggestion(suggestion: string) {
    inputValue = suggestion;
    showSuggestions = false;
    inputRef?.focus();
  }

  function handleFocus() {
    if (inputValue.length > 0) {
      showSuggestions = true;
    }
  }

  function handleBlur() {
    // Delay to allow click on suggestion
    setTimeout(() => {
      showSuggestions = false;
    }, 150);
  }
</script>

<div class="space-y-3">
  <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wide">
    Log Food
  </h2>

  <div class="relative">
    <div class="flex gap-2">
      <input
        bind:this={inputRef}
        bind:value={inputValue}
        onkeydown={handleKeydown}
        onfocus={handleFocus}
        onblur={handleBlur}
        oninput={() => showSuggestions = true}
        type="text"
        placeholder="What did you eat?"
        class="flex-1 px-4 py-3 rounded-xl border border-gray-200
               focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100
               outline-none transition-all"
      />
      <button
        onclick={handleSubmit}
        disabled={!inputValue.trim()}
        class="px-4 py-3 bg-indigo-600 text-white rounded-xl font-medium
               hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed
               transition-colors"
      >
        Add
      </button>
    </div>

    <!-- Autocomplete suggestions -->
    {#if showSuggestions && suggestions.length > 0}
      <div class="absolute top-full left-0 right-12 mt-1 bg-white rounded-xl
                  shadow-lg border border-gray-100 overflow-hidden z-10">
        {#each suggestions as suggestion}
          <button
            onclick={() => selectSuggestion(suggestion)}
            class="w-full px-4 py-2 text-left hover:bg-indigo-50
                   transition-colors text-gray-700"
          >
            {suggestion}
          </button>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Quick add from recent foods -->
  {#if $foodHistory.length > 0}
    <div class="flex flex-wrap gap-2">
      {#each $foodHistory.slice(0, 6) as food}
        <button
          onclick={() => addFood(food)}
          class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full
                 hover:bg-indigo-100 hover:text-indigo-700 transition-colors"
        >
          {food}
        </button>
      {/each}
    </div>
  {/if}
</div>
