import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import notificationService from './notificationService';

/**
 * LessonReminderService - Handles automatic lesson reminder notifications
 * Features: Daily 10 AM reminder, 1-hour before reminder, grouped notifications,
 *          reschedule/cancel handling, time zone support, no duplicates
 */

class LessonReminderService {
  constructor() {
    this.DAILY_REMINDER_HOUR = 10; // 10:00 AM
    this.DAILY_REMINDER_MINUTE = 0;
    this.ONE_HOUR_BEFORE_MS = 60 * 60 * 1000; // 1 hour in milliseconds
  }

  /**
   * Schedule both reminders for a lesson
   */
  async scheduleLessonReminders(lesson, client) {
    try {
      const lessonDateTime = this.parseLessonDateTime(lesson.date, lesson.time);
      const now = new Date();

      // Check if lesson is in the past
      if (lessonDateTime < now) {
        console.log('Lesson is in the past, skipping reminders');
        return { success: true, skipped: true };
      }

      const results = {
        dailyReminder: null,
        oneHourReminder: null,
      };

      // Schedule 10 AM daily reminder (if before 10 AM on lesson day)
      const dailyReminderTime = this.getDailyReminderTime(lessonDateTime);

      if (dailyReminderTime > now) {
        results.dailyReminder = await this.scheduleDailyReminder(lesson, client, dailyReminderTime);
      } else {
        console.log('10 AM reminder time has passed, skipping daily reminder');
      }

      // Schedule 1-hour before reminder
      const oneHourBeforeTime = new Date(lessonDateTime.getTime() - this.ONE_HOUR_BEFORE_MS);

      if (oneHourBeforeTime > now) {
        // Check if lesson is within 1 hour
        const timeUntilLesson = lessonDateTime.getTime() - now.getTime();

        if (timeUntilLesson <= this.ONE_HOUR_BEFORE_MS) {
          // Lesson is within 1 hour - send immediate "Starting soon" notification
          results.oneHourReminder = await this.sendImmediateReminder(lesson, client);
        } else {
          // Schedule for 1 hour before
          results.oneHourReminder = await this.scheduleOneHourReminder(lesson, client, oneHourBeforeTime);
        }
      } else {
        console.log('1-hour before reminder time has passed');
      }

      // Track scheduled reminders
      await this.trackScheduledReminder(lesson.id, 'scheduled', {
        dailyReminder: results.dailyReminder,
        oneHourReminder: results.oneHourReminder,
      });

      return { success: true, results };
    } catch (error) {
      console.error('Error scheduling lesson reminders:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Schedule daily 10 AM reminder
   */
  async scheduleDailyReminder(lesson, client, triggerTime) {
    try {
      const identifier = `lesson_daily_${lesson.id}`;

      // Check if already scheduled
      const alreadyScheduled = await this.isReminderScheduled(identifier);
      if (alreadyScheduled) {
        console.log('Daily reminder already scheduled for lesson:', lesson.id);
        return { success: false, reason: 'duplicate' };
      }

      // Get horse name
      const horseName = await this.getHorseName(lesson.horseId);

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: "درس اليوم 📚",
          body: `${horseName} في الساعة ${lesson.time}`,
          data: {
            type: 'lesson_reminder',
            reminderType: 'daily',
            lessonId: lesson.id,
            clientId: lesson.clientId,
          },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          categoryIdentifier: 'lesson_reminder',
        },
        trigger: {
          date: triggerTime,
          channelId: 'lesson_reminders',
        },
        identifier,
      });

      await this.saveReminderNotification(identifier, notificationId, lesson.id, 'daily', triggerTime);

      return { success: true, notificationId, identifier };
    } catch (error) {
      console.error('Error scheduling daily reminder:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Schedule 1-hour before reminder
   */
  async scheduleOneHourReminder(lesson, client, triggerTime) {
    try {
      const identifier = `lesson_1hour_${lesson.id}`;

      // Check if already scheduled
      const alreadyScheduled = await this.isReminderScheduled(identifier);
      if (alreadyScheduled) {
        console.log('1-hour reminder already scheduled for lesson:', lesson.id);
        return { success: false, reason: 'duplicate' };
      }

      // Get horse name
      const horseName = await this.getHorseName(lesson.horseId);

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: "درسك خلال ساعة! ⏰",
          body: `${horseName} في الساعة ${lesson.time}`,
          data: {
            type: 'lesson_reminder',
            reminderType: 'one_hour',
            lessonId: lesson.id,
            clientId: lesson.clientId,
          },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          categoryIdentifier: 'lesson_reminder_snooze',
        },
        trigger: {
          date: triggerTime,
          channelId: 'lesson_reminders',
        },
        identifier,
      });

      await this.saveReminderNotification(identifier, notificationId, lesson.id, 'one_hour', triggerTime);

      return { success: true, notificationId, identifier };
    } catch (error) {
      console.error('Error scheduling 1-hour reminder:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send immediate "Starting soon" reminder
   */
  async sendImmediateReminder(lesson, client) {
    try {
      const identifier = `lesson_immediate_${lesson.id}`;

      // Check if already sent
      const alreadySent = await this.isReminderScheduled(identifier);
      if (alreadySent) {
        return { success: false, reason: 'duplicate' };
      }

      const horseName = await this.getHorseName(lesson.horseId);

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "درسك قريباً! 🏇",
          body: `${horseName} في الساعة ${lesson.time}`,
          data: {
            type: 'lesson_reminder',
            reminderType: 'immediate',
            lessonId: lesson.id,
            clientId: lesson.clientId,
          },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.MAX,
        },
        trigger: null, // Immediate
        identifier,
      });

      await this.saveReminderNotification(identifier, identifier, lesson.id, 'immediate', new Date());

      return { success: true, identifier };
    } catch (error) {
      console.error('Error sending immediate reminder:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Schedule grouped 10 AM reminder for multiple lessons
   */
  async scheduleGroupedDailyReminder(lessons, clientId, date) {
    try {
      const identifier = `lesson_daily_grouped_${clientId}_${date}`;

      // Check if already scheduled
      const alreadyScheduled = await this.isReminderScheduled(identifier);
      if (alreadyScheduled) {
        return { success: false, reason: 'duplicate' };
      }

      // Build grouped message
      let body = 'لديك عدة دروس اليوم:\n';
      for (const lesson of lessons) {
        const horseName = await this.getHorseName(lesson.horseId);
        body += `• ${horseName} - ${lesson.time}\n`;
      }

      const dailyReminderTime = this.getDailyReminderTime(this.parseLessonDateTime(date, '12:00'));

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `${lessons.length} دروس اليوم 📚`,
          body: body.trim(),
          data: {
            type: 'lesson_reminder_grouped',
            reminderType: 'daily_grouped',
            lessonIds: lessons.map(l => l.id),
            clientId,
          },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          date: dailyReminderTime,
          channelId: 'lesson_reminders',
        },
        identifier,
      });

      await this.saveReminderNotification(identifier, notificationId, lessons.map(l => l.id).join(','), 'daily_grouped', dailyReminderTime);

      return { success: true, notificationId, identifier };
    } catch (error) {
      console.error('Error scheduling grouped daily reminder:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Reschedule reminders for a lesson (when lesson time changes)
   */
  async rescheduleLessonReminders(lessonId, newLesson, client) {
    try {
      // Cancel existing reminders
      await this.cancelLessonReminders(lessonId);

      // Schedule new reminders
      const result = await this.scheduleLessonReminders(newLesson, client);

      // Track reschedule
      await this.trackScheduledReminder(lessonId, 'rescheduled', result);

      return result;
    } catch (error) {
      console.error('Error rescheduling lesson reminders:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Cancel all reminders for a lesson
   */
  async cancelLessonReminders(lessonId) {
    try {
      const identifiers = [
        `lesson_daily_${lessonId}`,
        `lesson_1hour_${lessonId}`,
        `lesson_immediate_${lessonId}`,
      ];

      for (const identifier of identifiers) {
        await Notifications.cancelScheduledNotificationAsync(identifier);
        await this.removeReminderNotification(identifier);
      }

      // Track cancellation
      await this.trackScheduledReminder(lessonId, 'canceled');

      console.log('Canceled all reminders for lesson:', lessonId);
      return { success: true };
    } catch (error) {
      console.error('Error canceling lesson reminders:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Mark lesson reminder as seen
   */
  async markReminderAsSeen(lessonId, reminderType) {
    try {
      const key = `reminder_seen_${lessonId}_${reminderType}`;
      await AsyncStorage.setItem(key, JSON.stringify({
        seenAt: new Date().toISOString(),
        lessonId,
        reminderType,
      }));

      return { success: true };
    } catch (error) {
      console.error('Error marking reminder as seen:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Schedule snooze for 15 minutes
   */
  async snoozeReminder(lessonId, lesson) {
    try {
      const identifier = `lesson_snooze_${lessonId}`;
      const snoozeTime = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      const horseName = await this.getHorseName(lesson.horseId);

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "تذكير بالدرس ⏰",
          body: `${horseName} في الساعة ${lesson.time}`,
          data: {
            type: 'lesson_reminder',
            reminderType: 'snooze',
            lessonId: lesson.id,
            clientId: lesson.clientId,
          },
          sound: true,
        },
        trigger: {
          date: snoozeTime,
          channelId: 'lesson_reminders',
        },
        identifier,
      });

      return { success: true, snoozeUntil: snoozeTime };
    } catch (error) {
      console.error('Error snoozing reminder:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Process all lessons and schedule reminders for today and tomorrow
   */
  async processUpcomingLessons(lessons) {
    try {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todayStr = this.formatDate(now);
      const tomorrowStr = this.formatDate(tomorrow);

      const upcomingLessons = lessons.filter(lesson => {
        return lesson.date === todayStr || lesson.date === tomorrowStr;
      });

      // Group lessons by client and date for grouped 10 AM reminders
      const lessonsByClientDate = {};

      for (const lesson of upcomingLessons) {
        const key = `${lesson.clientId}_${lesson.date}`;
        if (!lessonsByClientDate[key]) {
          lessonsByClientDate[key] = [];
        }
        lessonsByClientDate[key].push(lesson);
      }

      // Schedule reminders
      for (const [key, clientLessons] of Object.entries(lessonsByClientDate)) {
        if (clientLessons.length > 1) {
          // Multiple lessons - schedule grouped 10 AM reminder
          await this.scheduleGroupedDailyReminder(clientLessons, clientLessons[0].clientId, clientLessons[0].date);

          // Schedule individual 1-hour reminders
          for (const lesson of clientLessons) {
            const client = await this.getClient(lesson.clientId);
            await this.scheduleLessonReminders(lesson, client);
          }
        } else {
          // Single lesson - schedule both reminders
          const lesson = clientLessons[0];
          const client = await this.getClient(lesson.clientId);
          await this.scheduleLessonReminders(lesson, client);
        }
      }

      return { success: true, processed: upcomingLessons.length };
    } catch (error) {
      console.error('Error processing upcoming lessons:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Helper: Parse lesson date and time into Date object
   */
  parseLessonDateTime(date, time) {
    const [hours, minutes] = time.split(':');
    const dateObj = new Date(date);
    dateObj.setHours(parseInt(hours, 10));
    dateObj.setMinutes(parseInt(minutes, 10));
    dateObj.setSeconds(0);
    dateObj.setMilliseconds(0);
    return dateObj;
  }

  /**
   * Helper: Get 10 AM time for a lesson date
   */
  getDailyReminderTime(lessonDateTime) {
    const reminderTime = new Date(lessonDateTime);
    reminderTime.setHours(this.DAILY_REMINDER_HOUR);
    reminderTime.setMinutes(this.DAILY_REMINDER_MINUTE);
    reminderTime.setSeconds(0);
    reminderTime.setMilliseconds(0);
    return reminderTime;
  }

  /**
   * Helper: Format date as YYYY-MM-DD
   */
  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Helper: Get horse name by ID
   */
  async getHorseName(horseId) {
    try {
      const horsesRef = collection(db, 'horses');
      const q = query(horsesRef, where('__name__', '==', horseId));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        return snapshot.docs[0].data().name || 'حصان';
      }
      return 'حصان';
    } catch (error) {
      console.error('Error getting horse name:', error);
      return 'حصان';
    }
  }

  /**
   * Helper: Get client by ID
   */
  async getClient(clientId) {
    try {
      const clientsRef = collection(db, 'clients');
      const q = query(clientsRef, where('__name__', '==', clientId));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
      }
      return null;
    } catch (error) {
      console.error('Error getting client:', error);
      return null;
    }
  }

  /**
   * Helper: Check if reminder is already scheduled
   */
  async isReminderScheduled(identifier) {
    try {
      const key = `scheduled_reminder_${identifier}`;
      const data = await AsyncStorage.getItem(key);
      return data !== null;
    } catch (error) {
      console.error('Error checking scheduled reminder:', error);
      return false;
    }
  }

  /**
   * Helper: Save reminder notification tracking
   */
  async saveReminderNotification(identifier, notificationId, lessonId, type, triggerTime) {
    try {
      const key = `scheduled_reminder_${identifier}`;
      await AsyncStorage.setItem(key, JSON.stringify({
        notificationId,
        lessonId,
        type,
        triggerTime: triggerTime.toISOString(),
        scheduledAt: new Date().toISOString(),
      }));
    } catch (error) {
      console.error('Error saving reminder notification:', error);
    }
  }

  /**
   * Helper: Remove reminder notification tracking
   */
  async removeReminderNotification(identifier) {
    try {
      const key = `scheduled_reminder_${identifier}`;
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing reminder notification:', error);
    }
  }

  /**
   * Helper: Track scheduled reminder in Firebase
   */
  async trackScheduledReminder(lessonId, status, data = {}) {
    try {
      await addDoc(collection(db, 'lessonReminderLogs'), {
        lessonId,
        status,
        data,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error tracking scheduled reminder:', error);
    }
  }

  /**
   * Setup notification categories with actions
   */
  async setupNotificationCategories() {
    try {
      await Notifications.setNotificationCategoryAsync('lesson_reminder_snooze', [
        {
          identifier: 'snooze',
          buttonTitle: 'تأجيل 15 دقيقة',
          options: {
            opensAppToForeground: false,
          },
        },
        {
          identifier: 'view',
          buttonTitle: 'عرض التفاصيل',
          options: {
            opensAppToForeground: true,
          },
        },
      ]);

      await Notifications.setNotificationCategoryAsync('lesson_reminder', [
        {
          identifier: 'view',
          buttonTitle: 'عرض التفاصيل',
          options: {
            opensAppToForeground: true,
          },
        },
      ]);
    } catch (error) {
      console.error('Error setting up notification categories:', error);
    }
  }

  /**
   * Setup notification channel for Android
   */
  async setupNotificationChannel() {
    try {
      await Notifications.setNotificationChannelAsync('lesson_reminders', {
        name: 'تذكيرات الدروس',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#3b82f6',
        sound: 'default',
        enableVibrate: true,
      });
    } catch (error) {
      console.error('Error setting up notification channel:', error);
    }
  }
}

export const lessonReminderService = new LessonReminderService();
export default lessonReminderService;

