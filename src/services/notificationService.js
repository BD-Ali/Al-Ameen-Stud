import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/**
 * NotificationService - Handles all notification functionality
 * Manages permissions, channels, and notification listeners
 */
class NotificationService {
  constructor() {
    this.notificationListener = null;
    this.responseListener = null;

    // Set default notification handler
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  }

  /**
   * Request notification permissions from the user
   */
  async requestPermissions() {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Notification permissions not granted');
        return false;
      }

      // Setup notification channel for Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'افتراضي',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
          sound: 'default',
        });

        // Create announcement channel
        await Notifications.setNotificationChannelAsync('announcements', {
          name: 'الإعلانات',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#3B82F6',
          sound: 'default',
        });

        // Create lesson reminder channel
        await Notifications.setNotificationChannelAsync('lesson_reminders', {
          name: 'تذكيرات الدروس',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#10B981',
          sound: 'default',
        });
      }

      return true;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  /**
   * Setup notification listeners
   * @param {Function} onNotificationReceived - Called when notification is received while app is open
   * @param {Function} onNotificationTapped - Called when user taps on a notification
   */
  setupListeners(onNotificationReceived, onNotificationTapped) {
    // Listener for when a notification is received while the app is foregrounded
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      if (onNotificationReceived) {
        onNotificationReceived(notification);
      }
    });

    // Listener for when a user taps on or interacts with a notification
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;

      if (onNotificationTapped) {
        onNotificationTapped(data);
      }
    });
  }

  /**
   * Remove notification listeners
   */
  removeListeners() {
    if (this.notificationListener) {
      this.notificationListener.remove();
      this.notificationListener = null;
    }

    if (this.responseListener) {
      this.responseListener.remove();
      this.responseListener = null;
    }
  }

  /**
   * Send an immediate notification
   * @param {string} title - Notification title
   * @param {string} body - Notification body
   * @param {object} data - Additional data to attach
   * @param {string} channelId - Channel ID for Android
   */
  async sendNotification(title, body, data = {}, channelId = 'default') {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
          ...(Platform.OS === 'android' && { channelId }),
        },
        trigger: null, // Send immediately
      });
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  /**
   * Schedule a notification for a specific time
   * @param {string} title - Notification title
   * @param {string} body - Notification body
   * @param {Date} triggerDate - When to trigger the notification
   * @param {object} data - Additional data to attach
   * @param {string} identifier - Unique identifier for the notification
   * @returns {string} - Notification identifier
   */
  async scheduleNotification(title, body, triggerDate, data = {}, identifier = null) {
    try {
      // Ensure triggerDate is a valid Date object
      const scheduledDate = triggerDate instanceof Date ? triggerDate : new Date(triggerDate);

      if (isNaN(scheduledDate.getTime())) {
        console.error('Invalid trigger date for notification:', triggerDate);
        return null;
      }

      // Don't schedule notifications in the past
      if (scheduledDate <= new Date()) {
        console.warn('Skipping notification scheduled in the past:', scheduledDate.toISOString());
        return null;
      }

      const channelId = data.channelId || 'default';

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          ...(Platform.OS === 'android' && { channelId }),
        },
        trigger: {
          type: 'date',
          date: scheduledDate,
          ...(Platform.OS === 'android' && { channelId }),
        },
        ...(identifier && { identifier }),
      });

      console.log(`Notification scheduled for ${scheduledDate.toISOString()} (id: ${notificationId})`);
      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  }

  /**
   * Cancel a scheduled notification
   * @param {string} notificationId - The identifier of the notification to cancel
   */
  async cancelNotification(notificationId) {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  }

  /**
   * Cancel all scheduled notifications
   */
  async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error canceling all notifications:', error);
    }
  }

  /**
   * Get all scheduled notifications
   * @returns {Array} - Array of scheduled notifications
   */
  async getAllScheduledNotifications() {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  /**
   * Clear notification badge
   */
  async clearBadge() {
    try {
      await Notifications.setBadgeCountAsync(0);
    } catch (error) {
      console.error('Error clearing badge:', error);
    }
  }

  /**
   * Send an announcement notification to all users
   * @param {object} announcement - The announcement object with title, content, id
   * @param {boolean} immediate - Whether to send immediately or use the announcement's schedule
   * @returns {object} - Result with sent and skipped counts
   */
  async sendAnnouncementNotification(announcement, immediate = true) {
    try {
      const title = announcement.title || 'إعلان جديد';
      const message = announcement.content || announcement.message || '';

      await this.sendNotification(
        title,
        message,
        {
          type: 'announcement',
          announcementId: announcement.id,
          channelId: 'announcements',
        },
        'announcements'
      );

      return { success: true, sent: 1, skipped: 0 };
    } catch (error) {
      console.error('Error sending announcement notification:', error);
      return { success: false, sent: 0, skipped: 1, error: error.message };
    }
  }

  /**
   * Schedule an announcement notification for a future date
   * @param {object} announcement - The announcement object
   * @param {string|Date} scheduledDate - When to send the notification
   * @returns {string} - Notification identifier
   */
  async scheduleAnnouncementNotification(announcement, scheduledDate) {
    try {
      const title = announcement.title || 'إعلان جديد';
      const message = announcement.content || announcement.message || '';
      const triggerDate = typeof scheduledDate === 'string' ? new Date(scheduledDate) : scheduledDate;

      const notificationId = await this.scheduleNotification(
        title,
        message,
        triggerDate,
        {
          type: 'announcement',
          announcementId: announcement.id,
          channelId: 'announcements',
        },
        `announcement_${announcement.id}`
      );

      console.log(`Scheduled announcement notification for ${triggerDate.toISOString()}`);
      return notificationId;
    } catch (error) {
      console.error('Error scheduling announcement notification:', error);
      return null;
    }
  }

  /**
   * Cancel a scheduled announcement notification
   * @param {string} announcementId - The announcement ID
   */
  async cancelAnnouncementNotification(announcementId) {
    try {
      const identifier = `announcement_${announcementId}`;
      await this.cancelNotification(identifier);
      console.log(`Cancelled announcement notification for ${announcementId}`);
    } catch (error) {
      console.error('Error cancelling announcement notification:', error);
    }
  }

  /**
   * Cancel a scheduled notification by identifier
   * Alias for cancelNotification for consistency
   * @param {string} identifier - The notification identifier
   */
  async cancelScheduledNotification(identifier) {
    try {
      await this.cancelNotification(`announcement_${identifier}`);
    } catch (error) {
      console.error('Error cancelling scheduled notification:', error);
    }
  }

  /**
   * Send notification when a new lesson is created
   * @param {object} lesson - The lesson object
   * @param {object} client - The client object
   * @param {object} instructor - The instructor object
   * @param {object} horse - The horse object
   */
  async sendLessonCreatedNotification(lesson, client, instructor, horse) {
    try {
      const title = '✅ تم جدولة درس جديد';
      const body = `درس مع ${client.name} في ${lesson.time} - ${lesson.date}`;

      await this.sendNotification(
        title,
        body,
        {
          type: 'lesson_created',
          lessonId: lesson.id,
          clientId: client.id,
          instructorId: instructor.id,
          horseId: horse.id,
          channelId: 'lesson_reminders',
        },
        'lesson_reminders'
      );

      console.log('Lesson created notification sent');
      return { success: true };
    } catch (error) {
      console.error('Error sending lesson created notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send notification when a lesson is updated/rescheduled
   * @param {object} lesson - The updated lesson object
   * @param {object} client - The client object
   * @param {string} changeDescription - Description of what changed
   */
  async sendLessonUpdatedNotification(lesson, client, changeDescription) {
    try {
      const title = '🔄 تم تحديث موعد الدرس';
      const body = `درس ${client.name} - ${changeDescription}`;

      await this.sendNotification(
        title,
        body,
        {
          type: 'lesson_updated',
          lessonId: lesson.id,
          clientId: client.id,
          channelId: 'lesson_reminders',
        },
        'lesson_reminders'
      );

      console.log('Lesson updated notification sent');
      return { success: true };
    } catch (error) {
      console.error('Error sending lesson updated notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send notification when a lesson is cancelled
   * @param {object} lesson - The cancelled lesson object
   * @param {object} client - The client object
   * @param {string} reason - Cancellation reason
   */
  async sendLessonCancelledNotification(lesson, client, reason = '') {
    try {
      const title = '❌ تم إلغاء الدرس';
      const body = reason
        ? `تم إلغاء درس ${client.name} في ${lesson.time} - ${reason}`
        : `تم إلغاء درس ${client.name} في ${lesson.time}`;

      await this.sendNotification(
        title,
        body,
        {
          type: 'lesson_cancelled',
          lessonId: lesson.id,
          clientId: client.id,
          reason,
          channelId: 'lesson_reminders',
        },
        'lesson_reminders'
      );

      console.log('Lesson cancelled notification sent');
      return { success: true };
    } catch (error) {
      console.error('Error sending lesson cancelled notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send notification when a lesson is confirmed/completed
   * @param {object} lesson - The confirmed lesson object
   * @param {object} client - The client object
   */
  async sendLessonConfirmedNotification(lesson, client) {
    try {
      const title = '✅ تم تأكيد إكمال الدرس';
      const body = `تم تأكيد درس ${client.name} بنجاح`;

      await this.sendNotification(
        title,
        body,
        {
          type: 'lesson_confirmed',
          lessonId: lesson.id,
          clientId: client.id,
          channelId: 'lesson_reminders',
        },
        'lesson_reminders'
      );

      console.log('Lesson confirmed notification sent');
      return { success: true };
    } catch (error) {
      console.error('Error sending lesson confirmed notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send notification when a mission is assigned to a worker
   * @param {object} mission - The mission object
   * @param {object} worker - The worker object
   */
  async sendMissionAssignedNotification(mission, worker) {
    try {
      const title = '📋 مهمة جديدة';
      const body = `${mission.title} - ${mission.description || 'مهمة عمل جديدة'}`;

      await this.sendNotification(
        title,
        body,
        {
          type: 'mission_assigned',
          missionId: mission.id,
          workerId: worker.id,
          channelId: 'default',
        },
        'default'
      );

      console.log('Mission assigned notification sent');
      return { success: true };
    } catch (error) {
      console.error('Error sending mission assigned notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send notification when a mission is completed
   * @param {object} mission - The mission object
   * @param {object} worker - The worker object
   */
  async sendMissionCompletedNotification(mission, worker) {
    try {
      const title = '✅ تم إكمال المهمة';
      const body = `أكمل ${worker.name} المهمة: ${mission.title}`;

      await this.sendNotification(
        title,
        body,
        {
          type: 'mission_completed',
          missionId: mission.id,
          workerId: worker.id,
          channelId: 'default',
        },
        'default'
      );

      console.log('Mission completed notification sent');
      return { success: true };
    } catch (error) {
      console.error('Error sending mission completed notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send notification for a reminder/task
   * @param {object} reminder - The reminder object
   */
  async sendReminderNotification(reminder) {
    try {
      const title = '🔔 تذكير';
      const body = reminder.description || 'لديك تذكير';

      await this.sendNotification(
        title,
        body,
        {
          type: 'reminder',
          reminderId: reminder.id,
          horseId: reminder.horseId,
          channelId: 'default',
        },
        'default'
      );

      console.log('Reminder notification sent');
      return { success: true };
    } catch (error) {
      console.error('Error sending reminder notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send notification when a new client is registered
   * @param {object} client - The client object
   */
  async sendClientRegisteredNotification(client) {
    try {
      const title = '👤 عميل جديد';
      const body = `تم تسجيل عميل جديد: ${client.name}`;

      await this.sendNotification(
        title,
        body,
        {
          type: 'client_registered',
          clientId: client.id,
          channelId: 'default',
        },
        'default'
      );

      console.log('Client registered notification sent');
      return { success: true };
    } catch (error) {
      console.error('Error sending client registered notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send notification when subscription is about to expire
   * @param {object} client - The client object
   * @param {number} remainingLessons - Number of lessons remaining
   */
  async sendSubscriptionExpiringNotification(client, remainingLessons) {
    try {
      const title = '⚠️ تنبيه: الاشتراك على وشك الانتهاء';
      const body = `لدى ${client.name} ${remainingLessons} دروس متبقية فقط`;

      await this.sendNotification(
        title,
        body,
        {
          type: 'subscription_expiring',
          clientId: client.id,
          remainingLessons,
          channelId: 'default',
        },
        'default'
      );

      console.log('Subscription expiring notification sent');
      return { success: true };
    } catch (error) {
      console.error('Error sending subscription expiring notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send notification when payment is received
   * @param {object} client - The client object
   * @param {number} amount - Payment amount
   */
  async sendPaymentReceivedNotification(client, amount) {
    try {
      const title = '💰 تم استلام دفعة';
      const body = `تم استلام ${amount} من ${client.name}`;

      await this.sendNotification(
        title,
        body,
        {
          type: 'payment_received',
          clientId: client.id,
          amount,
          channelId: 'default',
        },
        'default'
      );

      console.log('Payment received notification sent');
      return { success: true };
    } catch (error) {
      console.error('Error sending payment received notification:', error);
      return { success: false, error: error.message };
    }
  }
}

// Export singleton instance
const notificationService = new NotificationService();
export default notificationService;

