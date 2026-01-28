// Phase 2: local-only engagement reminders for notifications.
// Keeps logic isolated from UI to avoid coupling.

const LAST_ACTIVE_KEY = 'last_active_at_v1';
const MISSED_YOU_SCHEDULE_KEY = 'missed_you_scheduled_at_v1';
const MISSED_YOU_NOTIFICATION_ID = 777777;
const RESCHEDULE_COOLDOWN_MS = 30 * 60 * 1000;

const hasCordovaNotifications = () => {
  return typeof window !== 'undefined'
    && typeof window.cordova !== 'undefined'
    && !!window.cordova?.plugins?.notification?.local;
};

const isCordovaReady = () => {
  return typeof window !== 'undefined'
    && typeof (window as any).cordova !== 'undefined'
    && (typeof (window as any).cordova?.fireDocumentEvent === 'function'
      || typeof (window as any).cordova?.channel?.triggerEvent === 'function');
};

const safeStorageSet = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    // Ignore storage errors to keep app usable.
  }
};

const safeStorageGet = (key: string) => {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    return null;
  }
};

export const recordActivityAndScheduleMissedYou = () => {
  const now = new Date();
  const lastActiveRaw = safeStorageGet(LAST_ACTIVE_KEY);
  const lastActive = lastActiveRaw ? new Date(lastActiveRaw) : null;
  if (!lastActive || now.getTime() - lastActive.getTime() > RESCHEDULE_COOLDOWN_MS) {
    safeStorageSet(LAST_ACTIVE_KEY, now.toISOString());
  }

  // Phase 2: schedule a "Missed you" reminder 4 days after last activity.
  if (!hasCordovaNotifications()) {
    return;
  }

  const reminderAt = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000);
  const lastScheduledRaw = safeStorageGet(MISSED_YOU_SCHEDULE_KEY);
  const lastScheduled = lastScheduledRaw ? new Date(lastScheduledRaw) : null;
  if (!lastScheduled || Math.abs(reminderAt.getTime() - lastScheduled.getTime()) > RESCHEDULE_COOLDOWN_MS) {
    safeStorageSet(MISSED_YOU_SCHEDULE_KEY, reminderAt.toISOString());
  } else {
    // Skip rescheduling if the existing reminder is recent.
    return;
  }
  const scheduleReminder = () => {
    try {
      window.cordova!.plugins.notification.local.cancel(MISSED_YOU_NOTIFICATION_ID, () => {});
      window.cordova!.plugins.notification.local.schedule({
        id: MISSED_YOU_NOTIFICATION_ID,
        title: "Sentimos sua falta",
        text: "Volte para receber seu vers?culo e manter seu h?bito di?rio.",
        trigger: { at: reminderAt },
        repeats: false,
        foreground: true,
        data: { deeplink: 'conexaodeus://home' }
      });
    } catch (error) {
      // Swallow scheduling errors to avoid breaking navigation flow.
    }
  };

  if (isCordovaReady()) {
    scheduleReminder();
    return;
  }

  if (typeof document !== 'undefined') {
    document.addEventListener('deviceready', scheduleReminder, { once: true } as AddEventListenerOptions);
  }
};
