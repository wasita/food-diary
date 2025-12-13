import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';
import { getDb } from '$lib/firebase';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { userId } from './user';

export interface SymptomEntry {
  id: string;
  symptomId: string;
  icon: string;
  label: string;
  severity?: number; // 1-10 scale
  timestamp: string;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface FoodEntry {
  id: string;
  name: string;
  timestamp: string;
  mealType?: MealType;
  notes?: string;
}

export interface DayEntry {
  date: string;
  symptoms: SymptomEntry[];
  foods: FoodEntry[];
  notes?: string;
}

export const currentDate = writable<string>(formatDate(new Date()));
export const currentEntry = writable<DayEntry | null>(null);
export const foodHistory = writable<string[]>([]);

// Format date as YYYY-MM-DD in local timezone
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Parse date string to Date object in local timezone
export function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

// Get current time as HH:MM
export function getCurrentTime(): string {
  return new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

// Load entry for a specific date
export async function loadEntry(date: string) {
  if (!browser) return;

  const uid = get(userId);
  if (!uid) return;

  currentDate.set(date);

  try {
    const docRef = doc(getDb(), 'users', uid, 'entries', date);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      currentEntry.set(docSnap.data() as DayEntry);
    } else {
      currentEntry.set({
        date,
        symptoms: [],
        foods: [],
      });
    }
  } catch (error) {
    console.error('Error loading entry:', error);
    currentEntry.set({
      date,
      symptoms: [],
      foods: [],
    });
  }
}

// Save entry to Firestore
async function saveEntry(entry: DayEntry) {
  if (!browser) return;

  const uid = get(userId);
  if (!uid) return;

  try {
    const docRef = doc(getDb(), 'users', uid, 'entries', entry.date);
    await setDoc(docRef, entry);
  } catch (error) {
    console.error('Error saving entry:', error);
  }
}

// Add a symptom to current entry
export async function addSymptom(symptomId: string, icon: string, label: string, severity?: number) {
  const entry = get(currentEntry);
  if (!entry) return;

  const newSymptom: SymptomEntry = {
    id: `${symptomId}_${Date.now()}`,
    symptomId,
    icon,
    label,
    timestamp: getCurrentTime(),
  };
  if (severity !== undefined) newSymptom.severity = severity;

  const updatedEntry = {
    ...entry,
    symptoms: [...entry.symptoms, newSymptom],
  };

  currentEntry.set(updatedEntry);
  await saveEntry(updatedEntry);
}

// Remove a symptom from current entry
export async function removeSymptom(symptomEntryId: string) {
  const entry = get(currentEntry);
  if (!entry) return;

  const updatedEntry = {
    ...entry,
    symptoms: entry.symptoms.filter(s => s.id !== symptomEntryId),
  };

  currentEntry.set(updatedEntry);
  await saveEntry(updatedEntry);
}

// Add a food item to current entry
export async function addFood(name: string, mealType?: MealType, notes?: string) {
  const entry = get(currentEntry);
  if (!entry) return;

  const newFood: FoodEntry = {
    id: `food_${Date.now()}`,
    name,
    timestamp: getCurrentTime(),
  };
  if (mealType) newFood.mealType = mealType;
  if (notes) newFood.notes = notes;

  const updatedEntry = {
    ...entry,
    foods: [...entry.foods, newFood],
  };

  currentEntry.set(updatedEntry);
  await saveEntry(updatedEntry);

  // Update food history for autocomplete
  await updateFoodHistory(name);
}

// Update a food item
export async function updateFood(foodId: string, name: string, mealType?: MealType, notes?: string) {
  const entry = get(currentEntry);
  if (!entry) return;

  const updatedEntry = {
    ...entry,
    foods: entry.foods.map(f => {
      if (f.id === foodId) {
        const updated: FoodEntry = { ...f, name };
        if (mealType) updated.mealType = mealType;
        else delete updated.mealType;
        if (notes) updated.notes = notes;
        else delete updated.notes;
        return updated;
      }
      return f;
    }),
  };

  currentEntry.set(updatedEntry);
  await saveEntry(updatedEntry);
  await updateFoodHistory(name);
}

// Remove a food from current entry
export async function removeFood(foodId: string) {
  const entry = get(currentEntry);
  if (!entry) return;

  const updatedEntry = {
    ...entry,
    foods: entry.foods.filter(f => f.id !== foodId),
  };

  currentEntry.set(updatedEntry);
  await saveEntry(updatedEntry);
}

// Load food history for autocomplete
export async function loadFoodHistory() {
  if (!browser) return;

  const uid = get(userId);
  if (!uid) return;

  try {
    const docRef = doc(getDb(), 'users', uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists() && docSnap.data().foodHistory) {
      foodHistory.set(docSnap.data().foodHistory);
    }
  } catch (error) {
    console.error('Error loading food history:', error);
  }
}

// Update food history
async function updateFoodHistory(foodName: string) {
  if (!browser) return;

  const uid = get(userId);
  if (!uid) return;

  const history = get(foodHistory);
  const normalizedName = foodName.toLowerCase().trim();

  // Only add if not already in history
  if (history.some(f => f.toLowerCase() === normalizedName)) return;

  try {
    const docRef = doc(getDb(), 'users', uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      await updateDoc(docRef, {
        foodHistory: arrayUnion(foodName.trim())
      });
    } else {
      await setDoc(docRef, {
        foodHistory: [foodName.trim()]
      });
    }

    foodHistory.update(h => [...h, foodName.trim()]);
  } catch (error) {
    console.error('Error updating food history:', error);
  }
}
