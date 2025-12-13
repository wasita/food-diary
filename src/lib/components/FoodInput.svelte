<script lang="ts">
  import { onMount } from "svelte";
  import { foodHistory, addFood, type MealType } from "$lib/stores/entries";

  let inputValue = $state("");
  let selectedMeal = $state<MealType | undefined>(undefined);
  let showSuggestions = $state(false);
  let inputRef: HTMLInputElement;

  const mealTypes: { value: MealType; label: string; icon: string }[] = [
    { value: "breakfast", label: "Breakfast", icon: "🌅" },
    { value: "lunch", label: "Lunch", icon: "☀️" },
    { value: "dinner", label: "Dinner", icon: "🌙" },
    { value: "snack", label: "Snack", icon: "🍿" },
  ];

  // Auto-suggest meal type based on time of day
  function getSuggestedMeal(): MealType {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) return "breakfast";
    if (hour >= 11 && hour < 15) return "lunch";
    if (hour >= 17 && hour < 21) return "dinner";
    return "snack";
  }

  onMount(() => {
    selectedMeal = getSuggestedMeal();
  });

  let suggestions = $derived(
    inputValue.length > 0
      ? $foodHistory
          .filter((f) => f.toLowerCase().includes(inputValue.toLowerCase()))
          .slice(0, 5)
      : []
  );

  async function handleSubmit() {
    if (!inputValue.trim()) return;

    await addFood(inputValue.trim(), selectedMeal);
    inputValue = "";
    // Reset to suggested meal for next entry
    selectedMeal = getSuggestedMeal();
    showSuggestions = false;
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Enter") {
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
  <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wide">
    Log Food
  </h2>

  <!-- Meal type selector -->
  <div class="flex gap-2">
    {#each mealTypes as meal}
      <button
        onclick={() =>
          (selectedMeal = selectedMeal === meal.value ? undefined : meal.value)}
        class="flex-1 py-3 px-2 rounded-xl text-xs font-medium transition-all
               {selectedMeal === meal.value
          ? 'bg-violet-500 text-white shadow-sm'
          : 'bg-[#1a1a1a] text-gray-300 hover:bg-[#2a2a2a]'}"
      >
        <span class="block text-xl mb-1">{meal.icon}</span>
        {meal.label}
      </button>
    {/each}
  </div>

  <div class="relative">
    <div class="flex gap-2">
      <input
        bind:this={inputRef}
        bind:value={inputValue}
        onkeydown={handleKeydown}
        onfocus={handleFocus}
        onblur={handleBlur}
        oninput={() => (showSuggestions = true)}
        type="text"
        placeholder="What did you eat?"
        class="flex-1 px-4 py-3 rounded-xl border border-[#2a2a2a] bg-[#1a1a1a]
               focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20
               outline-none transition-all text-gray-100 placeholder-gray-500"
      />
      <button
        onclick={handleSubmit}
        disabled={!inputValue.trim()}
        class="px-4 py-3 bg-violet-500 text-white rounded-xl font-medium
               hover:bg-violet-600 disabled:opacity-50 disabled:cursor-not-allowed
               transition-colors"
      >
        Add
      </button>
    </div>

    <!-- Autocomplete suggestions -->
    {#if showSuggestions && suggestions.length > 0}
      <div
        class="absolute top-full left-0 right-12 mt-1 bg-[#1a1a1a] rounded-xl
                  shadow-lg border border-[#2a2a2a] overflow-hidden z-10"
      >
        {#each suggestions as suggestion}
          <button
            onclick={() => selectSuggestion(suggestion)}
            class="w-full px-4 py-2 text-left hover:bg-[#2a2a2a]
                   transition-colors text-gray-200"
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
          onclick={() => addFood(food, selectedMeal)}
          class="px-3 py-2 text-sm bg-[#1a1a1a] text-gray-300 rounded-full
                 hover:bg-violet-500 hover:text-white transition-colors"
        >
          {food}
        </button>
      {/each}
    </div>
  {/if}
</div>
