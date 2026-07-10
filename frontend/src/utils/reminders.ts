import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

const getRemindersKey = (userId: string) => `event_reminders_${userId}`;

export interface EventReminder {
  eventId: string;
  eventTitle: string;
  eventDate: Date;
  notificationId: string;
}

/**
 * Get all stored event reminders for a specific user
 */
export async function getStoredReminders(userId: string): Promise<EventReminder[]> {
  try {
    const stored = await AsyncStorage.getItem(getRemindersKey(userId));
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
 * Save an event reminder for a specific user
 */
export async function saveReminder(userId: string, reminder: EventReminder): Promise<void> {
  try {
    const reminders = await getStoredReminders(userId);
    const filtered = reminders.filter(r => r.eventId !== reminder.eventId);
    filtered.push(reminder);
    await AsyncStorage.setItem(getRemindersKey(userId), JSON.stringify(filtered));
  } catch (e) {
    console.error('Error saving reminder:', e);
  }
}

/**
 * Remove an event reminder for a specific user (and cancel notification if scheduled)
 */
export async function removeReminder(userId: string, eventId: string): Promise<void> {
  try {
    const reminders = await getStoredReminders(userId);
    const reminderToRemove = reminders.find(r => r.eventId === eventId);
    if (reminderToRemove) {
      await Notifications.cancelScheduledNotificationAsync(
        reminderToRemove.notificationId
      );
      await AsyncStorage.setItem(
        getRemindersKey(userId),
        JSON.stringify(reminders.filter(r => r.eventId !== eventId))
      );
    }
  } catch (e) {
    console.error('Error removing reminder:', e);
  }
}

/**
 * Schedule a local notification reminder for an event for a specific user
 * Default reminder is 1 day before event
 */
export async function scheduleEventReminder(
  userId: string,
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
    await saveReminder(userId, reminder);
    return reminder;
  } catch (e) {
    console.error('Error scheduling reminder:', e);
    return null;
  }
}

/**
 * Check if a reminder is already set for an event for a specific user
 */
export async function hasReminder(userId: string, eventId: string): Promise<boolean> {
  try {
    const reminders = await getStoredReminders(userId);
    return reminders.some(r => r.eventId === eventId);
  } catch (e) {
    console.error('Error checking reminder:', e);
    return false;
  }
}

/**
 * Load all scheduled notifications and clean up old reminders for a specific user
 */
export async function cleanUpOldReminders(userId: string): Promise<void> {
  try {
    const stored = await getStoredReminders(userId);
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const scheduledIds = new Set(scheduled.map(n => n.identifier));

    const validReminders = stored.filter(r => scheduledIds.has(r.notificationId) && new Date(r.eventDate) > new Date());
    await AsyncStorage.setItem(getRemindersKey(userId), JSON.stringify(validReminders));
  } catch (e) {
    console.error('Error cleaning up reminders:', e);
  }
}
