import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

const REMINDERS_KEY = 'event_reminders';

export interface EventReminder {
  eventId: string;
  eventTitle: string;
  eventDate: Date;
  notificationId: string;
}

/**
 * Get all stored event reminders
 */
export async function getStoredReminders(): Promise<EventReminder[]> {
  try {
    const stored = await AsyncStorage.getItem(REMINDERS_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    // Convert string dates back to Date objects
    return parsed.map((r: any) => ({
      ...r,
      eventDate: new Date(r.eventDate),
    }));
  } catch (e) {
    console.error('Error getting stored reminders:', e);
    return [];
  }
}

/**
 * Save an event reminder
 */
export async function saveReminder(reminder: EventReminder): Promise<void> {
  try {
    const reminders = await getStoredReminders();
    const filtered = reminders.filter(r => r.eventId !== reminder.eventId);
    filtered.push(reminder);
    await AsyncStorage.setItem(REMINDERS_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error('Error saving reminder:', e);
  }
}

/**
 * Remove an event reminder (and cancel notification if scheduled)
 */
export async function removeReminder(eventId: string): Promise<void> {
  try {
    const reminders = await getStoredReminders();
    const reminderToRemove = reminders.find(r => r.eventId === eventId);
    if (reminderToRemove) {
      await Notifications.cancelScheduledNotificationAsync(
        reminderToRemove.notificationId
      );
      await AsyncStorage.setItem(
        REMINDERS_KEY,
        JSON.stringify(reminders.filter(r => r.eventId !== eventId))
      );
    }
  } catch (e) {
    console.error('Error removing reminder:', e);
  }
}

/**
 * Schedule a local notification reminder for an event
 * Default reminder is 1 day before event
 */
export async function scheduleEventReminder(
  eventId: string,
  eventTitle: string,
  eventDate: Date,
  minutesBefore = 1440 // 24 * 60 minutes = 1 day
): Promise<EventReminder | null> {
  try {
    // Calculate reminder time
    let reminderDate = new Date(eventDate.getTime() - minutesBefore * 60000);

    // If reminder date is in the past, use 5 minutes from now instead
    if (reminderDate < new Date()) {
      console.log('Reminder date is in the past; using 5 minutes from now instead');
      reminderDate = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
    }

    // Schedule notification
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: `Reminder: ${eventTitle}`,
        body: `This event starts tomorrow! Don't forget to attend!`,
        sound: true,
      },
      trigger: {
        type: 'date',
        date: reminderDate,
      },
    });

    const reminder: EventReminder = {
      eventId,
      eventTitle,
      eventDate,
      notificationId,
    };
    await saveReminder(reminder);
    return reminder;
  } catch (e) {
    console.error('Error scheduling reminder:', e);
    return null;
  }
}

/**
 * Check if a reminder is already set for an event
 */
export async function hasReminder(eventId: string): Promise<boolean> {
  try {
    const reminders = await getStoredReminders();
    return reminders.some(r => r.eventId === eventId);
  } catch (e) {
    console.error('Error checking reminder:', e);
    return false;
  }
}

/**
 * Load all scheduled notifications and clean up old reminders
 */
export async function cleanUpOldReminders(): Promise<void> {
  try {
    const stored = await getStoredReminders();
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const scheduledIds = new Set(scheduled.map(n => n.identifier));

    const validReminders = stored.filter(r => scheduledIds.has(r.notificationId) && new Date(r.eventDate) > new Date());
    await AsyncStorage.setItem(REMINDERS_KEY, JSON.stringify(validReminders));
  } catch (e) {
    console.error('Error cleaning up reminders:', e);
  }
}
