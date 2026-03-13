import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { db } from '../config/firebaseConfig';
import { translate as t } from '../i18n/LanguageContext';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

/**
 * LessonReminderService - Handles automatic lesson reminder notifications
 * Schedules reminders at 24 hours, 2 hours, and 30 minutes before lessons
 */
class LessonReminderService {
  constructor() {
    this.reminderIntervals = [
      { hours: 24, label: '24h', name: () => t('notifications.before24Hours') },
      { hours: 2, label: '2h', name: () => t('notifications.before2Hours') },
    ];
  }

  /**
   * Setup notification channel for lesson reminders (Android)
   */
  async setupNotificationChannel() {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('lesson_reminders', {
        name: t('notifications.channelLessonReminders'),
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#10B981',
        sound: 'default',
        enableVibrate: true,
      });
    }
  }

  /**
   * Setup notification categories for iOS
   */
  async setupNotificationCategories() {
    if (Platform.OS === 'ios') {
      await Notifications.setNotificationCategoryAsync('lesson_reminder', [
        {
          identifier: 'view',
          buttonTitle: t('notifications.view'),
          options: {
            opensAppToForeground: true,
          },
        },
        {
          identifier: 'dismiss',
          buttonTitle: t('notifications.dismiss'),
          options: {
            opensAppToForeground: false,
          },
        },
      ]);
    }
  }

  /**
   * Schedule all reminder notifications for a lesson
   * @param {object} lesson - The lesson object with date, time, clientId, etc.
   * @param {object} client - The client object with name, email, etc.
   */
  async scheduleLessonReminders(lesson, client) {
    try {
      const lessonDateTime = this.parseLessonDateTime(lesson.date, lesson.time);

      if (!lessonDateTime || lessonDateTime <= new Date()) {
        console.log('Lesson is in the past, skipping reminders');
        return;
      }

      const scheduledReminders = [];

      // Schedule each reminder interval
      for (const interval of this.reminderIntervals) {
        const reminderTime = this.calculateReminderTime(lessonDateTime, interval);

        // Only schedule if reminder time is in the future
        if (reminderTime > new Date()) {
          const notificationId = await this.scheduleReminder(
            lesson,
            client,
            reminderTime,
            interval
          );

          if (notificationId) {
            scheduledReminders.push({
              type: interval.label,
              notificationId,
              scheduledFor: reminderTime.toISOString(),
            });
          }
        }
      }

      // Store reminder IDs in the lesson document
      if (scheduledReminders.length > 0) {
        await updateDoc(doc(db, 'lessons', lesson.id), {
          scheduledReminders,
          remindersSent: false,
        });
      }

      return scheduledReminders;
    } catch (error) {
      console.error('Error scheduling lesson reminders:', error);
      return [];
    }
  }

  /**
   * Reschedule reminders for a lesson (called when lesson time changes)
   * @param {string} lessonId - The lesson ID
   * @param {object} lesson - The updated lesson object
   * @param {object} client - The client object
   */
  async rescheduleLessonReminders(lessonId, lesson, client) {
    try {
      // Cancel existing reminders
      await this.cancelLessonReminders(lessonId);

      // Schedule new reminders
      await this.scheduleLessonReminders(lesson, client);
    } catch (error) {
      console.error('Error rescheduling lesson reminders:', error);
    }
  }

  /**
   * Cancel all reminders for a specific lesson
   * @param {string} lessonId - The lesson ID
   */
  async cancelLessonReminders(lessonId) {
    try {
      const lessonDoc = await getDoc(doc(db, 'lessons', lessonId));

      if (lessonDoc.exists()) {
        const lessonData = lessonDoc.data();
        const reminders = lessonData.scheduledReminders || [];

        // Cancel each scheduled notification
        for (const reminder of reminders) {
          if (reminder.notificationId) {
            await Notifications.cancelScheduledNotificationAsync(reminder.notificationId);
          }
        }

        // Clear reminders from lesson document
        await updateDoc(doc(db, 'lessons', lessonId), {
          scheduledReminders: [],
        });
      }
    } catch (error) {
      console.error('Error canceling lesson reminders:', error);
    }
  }

  /**
   * Schedule a single reminder notification
   * @private
   */
  async scheduleReminder(lesson, client, reminderTime, interval) {
    try {
      const intervalName = typeof interval.name === 'function' ? interval.name() : interval.name;
      const title = t('notifications.lessonReminderTitle', { interval: intervalName });
      const body = t('notifications.lessonReminderBody', { time: lesson.time, client: client.name });

      // Ensure reminderTime is a valid Date and in the future
      if (!(reminderTime instanceof Date) || isNaN(reminderTime.getTime())) {
        console.error('Invalid reminder time:', reminderTime);
        return null;
      }

      if (reminderTime <= new Date()) {
        console.warn('Skipping reminder scheduled in the past:', reminderTime.toISOString());
        return null;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: {
            type: 'lesson_reminder',
            lessonId: lesson.id,
            reminderType: interval.label,
            lessonDate: lesson.date,
            lessonTime: lesson.time,
            clientId: lesson.clientId,
          },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          categoryIdentifier: 'lesson_reminder',
          ...(Platform.OS === 'android' && { channelId: 'lesson_reminders' }),
        },
        trigger: {
          type: 'date',
          date: reminderTime,
          ...(Platform.OS === 'android' && { channelId: 'lesson_reminders' }),
        },
      });

      console.log(`Scheduled ${interval.label} reminder for lesson ${lesson.id} at ${reminderTime.toISOString()}`);
      return notificationId;
    } catch (error) {
      console.error(`Error scheduling ${interval.label} reminder:`, error);
      return null;
    }
  }

  /**
   * Parse lesson date and time into a Date object
   * @private
   */
  parseLessonDateTime(dateStr, timeStr) {
    try {
      // Date format: YYYY-MM-DD, Time format: HH:MM
      const [year, month, day] = dateStr.split('-').map(Number);
      const [hours, minutes] = timeStr.split(':').map(Number);

      const lessonDate = new Date(year, month - 1, day, hours, minutes);

      if (isNaN(lessonDate.getTime())) {
        console.error('Invalid lesson date/time:', dateStr, timeStr);
        return null;
      }

      return lessonDate;
    } catch (error) {
      console.error('Error parsing lesson date/time:', error);
      return null;
    }
  }

  /**
   * Calculate when to send a reminder based on the interval
   * @private
   */
  calculateReminderTime(lessonDateTime, interval) {
    const reminderTime = new Date(lessonDateTime);

    if (interval.hours) {
      reminderTime.setHours(reminderTime.getHours() - interval.hours);
    } else if (interval.minutes) {
      reminderTime.setMinutes(reminderTime.getMinutes() - interval.minutes);
    }

    return reminderTime;
  }

  /**
   * Mark a reminder as seen (called when user interacts with notification)
   * @param {string} lessonId - The lesson ID
   * @param {string} reminderType - The type of reminder (24h, 2h, 30m)
   */
  async markReminderAsSeen(lessonId, reminderType) {
    try {
      const lessonDoc = await getDoc(doc(db, 'lessons', lessonId));

      if (lessonDoc.exists()) {
        const lessonData = lessonDoc.data();
        const seenReminders = lessonData.seenReminders || [];

        if (!seenReminders.includes(reminderType)) {
          seenReminders.push(reminderType);

          await updateDoc(doc(db, 'lessons', lessonId), {
            seenReminders,
            lastReminderSeenAt: new Date().toISOString(),
          });
        }
      }
    } catch (error) {
      console.error('Error marking reminder as seen:', error);
    }
  }

  /**
   * Get upcoming reminders for a client
   * @param {string} clientId - The client ID
   * @returns {Array} - Array of upcoming reminders
   */
  async getUpcomingReminders(clientId) {
    try {
      const allScheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();

      // Filter notifications for this client
      const clientReminders = allScheduledNotifications.filter(
        notification => notification.content.data?.clientId === clientId
      );

      return clientReminders.map(notification => ({
        id: notification.identifier,
        title: notification.content.title,
        body: notification.content.body,
        trigger: notification.trigger,
        data: notification.content.data,
      }));
    } catch (error) {
      console.error('Error getting upcoming reminders:', error);
      return [];
    }
  }

  /**
   * Clean up past lesson reminders (called periodically)
   */
  async cleanupPastReminders() {
    try {
      const allScheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      const now = new Date();

      for (const notification of allScheduledNotifications) {
        if (notification.content.data?.type === 'lesson_reminder') {
          const lessonDate = this.parseLessonDateTime(
            notification.content.data.lessonDate,
            notification.content.data.lessonTime
          );

          // Cancel reminders for lessons that have already passed
          if (lessonDate && lessonDate < now) {
            await Notifications.cancelScheduledNotificationAsync(notification.identifier);
          }
        }
      }
    } catch (error) {
      console.error('Error cleaning up past reminders:', error);
    }
  }
}

// Export singleton instance
const lessonReminderService = new LessonReminderService();
export default lessonReminderService;

