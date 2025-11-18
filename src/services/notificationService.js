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
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          date: triggerDate,
          channelId: data.channelId || 'default',
        },
        identifier: identifier,
      });

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
}

// Export singleton instance
const notificationService = new NotificationService();
export default notificationService;

