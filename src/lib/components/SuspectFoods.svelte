<script lang="ts">
  import type { FoodCorrelation } from '$lib/utils/analytics';

  interface Props {
    correlations: FoodCorrelation[];
    lagHours: number;
  }

  let { correlations, lagHours }: Props = $props();

  function getSuspicionLevel(score: number): { label: string; color: string } {
    if (score >= 70) return { label: 'High', color: 'text-red-600 bg-red-100' };
    if (score >= 40) return { label: 'Medium', color: 'text-orange-600 bg-orange-100' };
    if (score >= 20) return { label: 'Low', color: 'text-yellow-600 bg-yellow-100' };
    return { label: 'Unlikely', color: 'text-green-600 bg-green-100' };
  }
</script>

<div class="space-y-4">
  <div class="flex items-center justify-between">
    <h2 class="text-lg font-semibold text-gray-800">Suspect Foods</h2>
    <span class="text-xs text-gray-500">within {lagHours}hr before symptoms</span>
  </div>

  {#if correlations.length === 0}
    <div class="text-center py-8 text-gray-400">
      <p class="text-3xl mb-2">🔍</p>
      <p>Not enough data yet.</p>
      <p class="text-sm">Keep logging to discover patterns!</p>
    </div>
  {:else}
    <div class="space-y-3">
      {#each correlations.slice(0, 10) as item, index}
        {@const level = getSuspicionLevel(item.suspicionScore)}
        <div class="bg-white rounded-xl p-4 shadow-sm">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <span class="font-medium text-gray-800 capitalize">{item.food}</span>
                <span class="text-xs px-2 py-0.5 rounded-full {level.color}">
                  {level.label}
                </span>
              </div>
              <div class="text-sm text-gray-500 mt-1">
                Eaten {item.timesEaten}x · Before symptoms {item.timesBeforeSymptom}x
              </div>
              {#if item.relatedSymptoms.length > 0}
                <div class="flex flex-wrap gap-1 mt-2">
                  {#each item.relatedSymptoms.slice(0, 3) as symptom}
                    <span class="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                      {symptom.symptom} ({symptom.count}x)
                    </span>
                  {/each}
                </div>
              {/if}
            </div>
            <div class="text-right">
              <div class="text-2xl font-bold {item.suspicionScore >= 50 ? 'text-red-500' : 'text-gray-400'}">
                {Math.round(item.suspicionScore)}%
              </div>
              <div class="text-xs text-gray-400">suspicion</div>
            </div>
          </div>
        </div>
      {/each}
    </div>

    <p class="text-xs text-gray-400 text-center mt-4">
      Suspicion % = how often this food appeared within {lagHours}hrs before symptoms
    </p>
  {/if}
</div>
