import type { DayEntry, SymptomEntry, FoodEntry } from '$lib/stores/entries';
import { parseDate } from '$lib/stores/entries';

export interface FoodCorrelation {
  food: string;
  timesEaten: number;
  timesBeforeSymptom: number;
  suspicionScore: number; // Higher = more likely trigger
  relatedSymptoms: { symptom: string; count: number }[];
}

export interface SymptomSummary {
  label: string;
  icon: string;
  count: number;
  dates: string[];
}

export interface FoodSummary {
  name: string;
  count: number;
  dates: string[];
}

/**
 * Parse a time string like "10:30 AM" to hours since midnight
 */
function parseTimeToHours(timeStr: string): number {
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return 12; // Default to noon if can't parse

  let hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const isPM = match[3].toUpperCase() === 'PM';

  if (isPM && hours !== 12) hours += 12;
  if (!isPM && hours === 12) hours = 0;

  return hours + minutes / 60;
}

/**
 * Convert a date string and time to a timestamp for comparison
 * Uses local timezone via parseDate
 */
function toTimestamp(dateStr: string, timeStr: string): number {
  const date = parseDate(dateStr);
  const hours = parseTimeToHours(timeStr);
  return date.getTime() + hours * 60 * 60 * 1000;
}

/**
 * Calculate food-symptom correlations
 * @param entries All diary entries
 * @param lagHours How many hours before a symptom to look for foods (default 24)
 */
export function calculateCorrelations(
  entries: DayEntry[],
  lagHours: number = 24
): FoodCorrelation[] {
  // Build a flat list of all foods with timestamps
  const allFoods: { name: string; timestamp: number; date: string }[] = [];
  const allSymptoms: { label: string; icon: string; timestamp: number; date: string }[] = [];

  for (const entry of entries) {
    for (const food of entry.foods) {
      allFoods.push({
        name: food.name.toLowerCase().trim(),
        timestamp: toTimestamp(entry.date, food.timestamp),
        date: entry.date
      });
    }
    for (const symptom of entry.symptoms) {
      allSymptoms.push({
        label: symptom.label,
        icon: symptom.icon,
        timestamp: toTimestamp(entry.date, symptom.timestamp),
        date: entry.date
      });
    }
  }

  // Count unique foods
  const foodCounts = new Map<string, number>();
  for (const food of allFoods) {
    foodCounts.set(food.name, (foodCounts.get(food.name) || 0) + 1);
  }

  // For each unique food, count how often it appears within lagHours before a symptom
  const foodSymptomCounts = new Map<string, Map<string, number>>();
  const foodBeforeSymptomCount = new Map<string, number>();

  const lagMs = lagHours * 60 * 60 * 1000;

  for (const symptom of allSymptoms) {
    // Find all foods eaten within lagHours before this symptom
    const foodsBeforeSymptom = new Set<string>();

    for (const food of allFoods) {
      const timeDiff = symptom.timestamp - food.timestamp;
      // Food must be eaten BEFORE symptom, within the lag window
      if (timeDiff > 0 && timeDiff <= lagMs) {
        foodsBeforeSymptom.add(food.name);

        // Track which symptoms this food is associated with
        if (!foodSymptomCounts.has(food.name)) {
          foodSymptomCounts.set(food.name, new Map());
        }
        const symptomMap = foodSymptomCounts.get(food.name)!;
        symptomMap.set(symptom.label, (symptomMap.get(symptom.label) || 0) + 1);
      }
    }

    // Count each food only once per symptom occurrence
    for (const foodName of foodsBeforeSymptom) {
      foodBeforeSymptomCount.set(
        foodName,
        (foodBeforeSymptomCount.get(foodName) || 0) + 1
      );
    }
  }

  // Calculate suspicion scores
  const correlations: FoodCorrelation[] = [];
  const totalSymptoms = allSymptoms.length;

  for (const [foodName, timesEaten] of foodCounts) {
    const timesBeforeSymptom = foodBeforeSymptomCount.get(foodName) || 0;

    // Suspicion score: ratio of "times before symptom" to "times eaten"
    // Normalized by overall symptom frequency
    // Higher score = more suspicious
    let suspicionScore = 0;
    if (timesEaten > 0 && totalSymptoms > 0) {
      const foodSymptomRate = timesBeforeSymptom / timesEaten;
      suspicionScore = foodSymptomRate * 100; // As percentage
    }

    // Get related symptoms
    const relatedSymptoms: { symptom: string; count: number }[] = [];
    const symptomMap = foodSymptomCounts.get(foodName);
    if (symptomMap) {
      for (const [symptom, count] of symptomMap) {
        relatedSymptoms.push({ symptom, count });
      }
      relatedSymptoms.sort((a, b) => b.count - a.count);
    }

    correlations.push({
      food: foodName,
      timesEaten,
      timesBeforeSymptom,
      suspicionScore,
      relatedSymptoms
    });
  }

  // Sort by suspicion score (highest first), but require minimum data
  return correlations
    .filter(c => c.timesEaten >= 2) // Need at least 2 occurrences
    .sort((a, b) => b.suspicionScore - a.suspicionScore);
}

/**
 * Get summary statistics
 */
export function getSummaryStats(entries: DayEntry[]) {
  const totalDays = entries.length;
  let totalSymptoms = 0;
  let totalFoods = 0;
  const symptomCounts = new Map<string, { icon: string; count: number }>();
  const foodCounts = new Map<string, number>();

  for (const entry of entries) {
    totalSymptoms += entry.symptoms.length;
    totalFoods += entry.foods.length;

    for (const symptom of entry.symptoms) {
      const existing = symptomCounts.get(symptom.label);
      if (existing) {
        existing.count++;
      } else {
        symptomCounts.set(symptom.label, { icon: symptom.icon, count: 1 });
      }
    }

    for (const food of entry.foods) {
      const name = food.name.toLowerCase().trim();
      foodCounts.set(name, (foodCounts.get(name) || 0) + 1);
    }
  }

  // Days with symptoms
  const daysWithSymptoms = entries.filter(e => e.symptoms.length > 0).length;

  // Most common symptoms
  const topSymptoms = Array.from(symptomCounts.entries())
    .map(([label, data]) => ({ label, icon: data.icon, count: data.count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Most eaten foods
  const topFoods = Array.from(foodCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalDays,
    totalSymptoms,
    totalFoods,
    daysWithSymptoms,
    symptomRate: totalDays > 0 ? Math.round((daysWithSymptoms / totalDays) * 100) : 0,
    topSymptoms,
    topFoods
  };
}

/**
 * Identify potentially safe foods (eaten often but rarely before symptoms)
 */
export function getSafeFoods(correlations: FoodCorrelation[]): FoodCorrelation[] {
  return correlations
    .filter(c => c.timesEaten >= 3 && c.suspicionScore < 20)
    .sort((a, b) => a.suspicionScore - b.suspicionScore)
    .slice(0, 5);
}
