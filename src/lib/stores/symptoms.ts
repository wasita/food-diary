import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';
import { getDb } from '$lib/firebase';
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { userId } from './user';

export interface SymptomType {
  id: string;
  icon: string;
  label: string;
  isCustom?: boolean;
}

// Default symptom types with emoji icons
export const defaultSymptoms: SymptomType[] = [
  { id: 'bloating', icon: '🎈', label: 'Bloating' },
  { id: 'gas', icon: '💨', label: 'Gas' },
  { id: 'cramping', icon: '⚡', label: 'Cramping' },
  { id: 'nausea', icon: '🤢', label: 'Nausea' },
  { id: 'diarrhea', icon: '💧', label: 'Diarrhea' },
  { id: 'constipation', icon: '🧱', label: 'Constipation' },
  { id: 'fatigue', icon: '🔋', label: 'Fatigue' },
  { id: 'headache', icon: '🤕', label: 'Headache' },
  { id: 'pain', icon: '😣', label: 'Pain' },
];

export const customSymptoms = writable<SymptomType[]>([]);

// Get all symptoms (default + custom)
export function getAllSymptoms(): SymptomType[] {
  return [...defaultSymptoms, ...get(customSymptoms)];
}

// Load custom symptoms from Firestore
export async function loadCustomSymptoms() {
  if (!browser) return;

  const uid = get(userId);
  if (!uid) return;

  try {
    const docRef = doc(getDb(), 'users', uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists() && docSnap.data().customSymptoms) {
      customSymptoms.set(docSnap.data().customSymptoms);
    }
  } catch (error) {
    console.error('Error loading custom symptoms:', error);
  }
}

// Add a new custom symptom
export async function addCustomSymptom(icon: string, label: string) {
  if (!browser) return;

  const uid = get(userId);
  if (!uid) return;

  const newSymptom: SymptomType = {
    id: `custom_${Date.now()}`,
    icon,
    label,
    isCustom: true
  };

  try {
    const docRef = doc(getDb(), 'users', uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      await updateDoc(docRef, {
        customSymptoms: arrayUnion(newSymptom)
      });
    } else {
      await setDoc(docRef, {
        customSymptoms: [newSymptom]
      });
    }

    customSymptoms.update(symptoms => [...symptoms, newSymptom]);
    return newSymptom;
  } catch (error) {
    console.error('Error adding custom symptom:', error);
    return null;
  }
}
