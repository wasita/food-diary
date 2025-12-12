<script lang="ts">
  import {
    reminderSettings,
    requestNotificationPermission,
    getNotificationPermission,
    updateReminderSettings,
    addReminderTime,
    removeReminderTime,
  } from '$lib/stores/reminders';

  interface Props {
    isOpen: boolean;
    onClose: () => void;
  }

  let { isOpen, onClose }: Props = $props();

  let permissionStatus = $state(getNotificationPermission());
  let newTime = $state('12:00');

  async function handleEnableToggle() {
    if (!$reminderSettings.enabled) {
      // Enabling - request permission first
      const granted = await requestNotificationPermission();
      permissionStatus = getNotificationPermission();

      if (granted) {
        updateReminderSettings({ enabled: true });
      }
    } else {
      // Disabling
      updateReminderSettings({ enabled: false });
    }
  }

  function handleAddTime() {
    if (newTime && !$reminderSettings.times.includes(newTime)) {
      addReminderTime(newTime);
    }
  }

  function handleRemoveTime(time: string) {
    removeReminderTime(time);
  }

  function formatTime(time: string): string {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
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
    aria-labelledby="reminder-modal-title"
    class="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-50 p-4"
  >
    <div class="bg-[#1a1a1a] rounded-2xl w-full max-w-md p-6 space-y-5">
      <h2 id="reminder-modal-title" class="text-xl font-bold text-gray-100">
        Daily Reminders
      </h2>

      <!-- Permission status -->
      {#if permissionStatus === 'unsupported'}
        <div class="bg-yellow-900/30 text-yellow-300 p-3 rounded-xl text-sm">
          Notifications are not supported in this browser.
        </div>
      {:else if permissionStatus === 'denied'}
        <div class="bg-red-900/30 text-red-300 p-3 rounded-xl text-sm">
          Notifications are blocked. Please enable them in your browser settings.
        </div>
      {/if}

      <!-- Enable toggle -->
      <div class="flex items-center justify-between">
        <div>
          <span class="font-medium text-gray-100">Enable Reminders</span>
          <p class="text-xs text-gray-500">Get notified to log your meals</p>
        </div>
        <button
          onclick={handleEnableToggle}
          disabled={permissionStatus === 'unsupported' || permissionStatus === 'denied'}
          aria-label={$reminderSettings.enabled ? 'Disable reminders' : 'Enable reminders'}
          class="relative w-12 h-6 rounded-full transition-colors disabled:opacity-50
                 {$reminderSettings.enabled ? 'bg-purple-600' : 'bg-[#3a3a3a]'}"
        >
          <span
            class="absolute top-1 w-4 h-4 bg-white rounded-full transition-transform
                   {$reminderSettings.enabled ? 'left-7' : 'left-1'}"
          ></span>
        </button>
      </div>

      {#if $reminderSettings.enabled}
        <!-- Reminder times -->
        <div class="space-y-3">
          <span class="text-sm font-medium text-gray-400">Reminder Times</span>

          <div class="space-y-2">
            {#each $reminderSettings.times as time}
              <div class="flex items-center justify-between bg-[#2a2a2a] rounded-lg px-3 py-2">
                <span class="text-gray-200">{formatTime(time)}</span>
                <button
                  onclick={() => handleRemoveTime(time)}
                  aria-label="Remove {formatTime(time)} reminder"
                  class="text-gray-500 hover:text-red-400 transition-colors"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            {/each}
          </div>

          <!-- Add new time -->
          <div class="flex gap-2">
            <input
              type="time"
              bind:value={newTime}
              class="flex-1 px-3 py-2 bg-[#0f0f0f] border border-[#3a3a3a] rounded-lg
                     text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
            />
            <button
              onclick={handleAddTime}
              class="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium
                     hover:bg-purple-700 transition-colors"
            >
              Add
            </button>
          </div>
        </div>

        <p class="text-xs text-gray-500">
          Reminders work best when the app is open or added to your home screen.
        </p>
      {/if}

      <!-- Close button -->
      <button
        onclick={onClose}
        class="w-full px-4 py-3 bg-[#2a2a2a] text-gray-300 rounded-xl font-medium
               hover:bg-[#3a3a3a] transition-colors"
      >
        Done
      </button>
    </div>
  </div>
{/if}
