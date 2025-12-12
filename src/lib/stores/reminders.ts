import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export interface ReminderSettings {
  enabled: boolean;
  times: string[]; // HH:MM format
  lastNotified: string | null; // ISO date string
}

const DEFAULT_SETTINGS: ReminderSettings = {
  enabled: false,
  times: ['09:00', '13:00', '19:00'], // breakfast, lunch, dinner
  lastNotified: null,
};

function loadSettings(): ReminderSettings {
  if (!browser) return DEFAULT_SETTINGS;
  const stored = localStorage.getItem('reminderSettings');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return DEFAULT_SETTINGS;
    }
  }
  return DEFAULT_SETTINGS;
}

function saveSettings(settings: ReminderSettings) {
  if (browser) {
    localStorage.setItem('reminderSettings', JSON.stringify(settings));
  }
}

export const reminderSettings = writable<ReminderSettings>(loadSettings());

reminderSettings.subscribe((settings) => {
  saveSettings(settings);
});

export async function requestNotificationPermission(): Promise<boolean> {
  if (!browser || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!browser || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

export function sendNotification(title: string, body: string) {
  if (!browser || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  new Notification(title, {
    body,
    icon: '/favicon.png',
    badge: '/favicon.png',
    tag: 'food-diary-reminder',
    renotify: true,
  });
}

let reminderInterval: ReturnType<typeof setInterval> | null = null;

export function startReminderChecker() {
  if (!browser) return;
  if (reminderInterval) return; // Already running

  // Check every minute
  reminderInterval = setInterval(() => {
    checkAndSendReminder();
  }, 60000);

  // Also check immediately
  checkAndSendReminder();
}

export function stopReminderChecker() {
  if (reminderInterval) {
    clearInterval(reminderInterval);
    reminderInterval = null;
  }
}

function checkAndSendReminder() {
  const settings = loadSettings();
  if (!settings.enabled) return;

  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  const today = now.toISOString().split('T')[0];

  // Check if any reminder time matches current time (within the same minute)
  for (const time of settings.times) {
    if (currentTime === time) {
      // Check if we already notified for this time today
      const lastNotifiedKey = `lastNotified_${time}`;
      const lastNotified = localStorage.getItem(lastNotifiedKey);

      if (lastNotified !== today) {
        sendNotification(
          'Food Diary Reminder',
          "Don't forget to log what you ate!"
        );
        localStorage.setItem(lastNotifiedKey, today);
      }
      break;
    }
  }
}

export function updateReminderSettings(updates: Partial<ReminderSettings>) {
  reminderSettings.update((current) => {
    const newSettings = { ...current, ...updates };
    if (newSettings.enabled) {
      startReminderChecker();
    } else {
      stopReminderChecker();
    }
    return newSettings;
  });
}

export function addReminderTime(time: string) {
  reminderSettings.update((current) => {
    if (!current.times.includes(time)) {
      return { ...current, times: [...current.times, time].sort() };
    }
    return current;
  });
}

export function removeReminderTime(time: string) {
  reminderSettings.update((current) => ({
    ...current,
    times: current.times.filter((t) => t !== time),
  }));
}
