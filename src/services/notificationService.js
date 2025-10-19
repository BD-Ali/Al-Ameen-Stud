import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, addDoc, updateDoc, doc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import Constants from 'expo-constants';

/**
 * NotificationService - Handles all announcement notifications
 * Features: Targeting, scheduling, deep-linking, read tracking, no duplicates
 */

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  constructor() {
    this.notificationListener = null;
    this.responseListener = null;
  }

  /**
   * Request notification permissions
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
        return { granted: false, message: 'الرجاء تفعيل الإشعارات من الإعدادات' };
      }

      // Get push token for device (only for physical devices)
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('announcements', {
          name: 'الإعلانات',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#3b82f6',
        });
      }

      // Try to get push token, but don't fail if it doesn't work (e.g., on simulator)
      let token = null;
      try {
        const projectId = Constants.expoConfig?.extra?.eas?.projectId;
        if (projectId) {
          const tokenData = await Notifications.getExpoPushTokenAsync({
            projectId: projectId,
          });
          token = tokenData.data;
        }
      } catch (tokenError) {
        console.log('Could not get push token (this is normal on simulators):', tokenError.message);
        // Continue anyway - local notifications will still work
      }

      return { granted: true, token };
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return { granted: false, message: 'حدث خطأ أثناء طلب الإذن' };
    }
  }

  /**
   * Check if user has notification preferences disabled
   */
  async getUserNotificationPreferences(userId) {
    try {
      const prefs = await AsyncStorage.getItem(`notif_prefs_${userId}`);
      if (prefs) {
        return JSON.parse(prefs);
      }
      // Default preferences
      return {
        enabled: true,
        announcements: true,
        quietHoursEnabled: false,
        quietHoursStart: '22:00',
        quietHoursEnd: '08:00',
      };
    } catch (error) {
      console.error('Error getting notification preferences:', error);
      return { enabled: true, announcements: true };
    }
  }

  /**
   * Check if current time is within quiet hours
   */
  isQuietHours(preferences) {
    if (!preferences.quietHoursEnabled) return false;

    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const start = preferences.quietHoursStart;
    const end = preferences.quietHoursEnd;

    // Handle overnight quiet hours (e.g., 22:00 to 08:00)
    if (start > end) {
      return currentTime >= start || currentTime < end;
    }

    return currentTime >= start && currentTime < end;
  }

  /**
   * Get users by role for targeting
   */
  async getUsersByRole(targetAudience) {
    try {
      const usersRef = collection(db, 'users');
      let users = [];

      switch (targetAudience) {
        case 'clients':
          const clientsQuery = query(usersRef, where('role', '==', 'client'));
          const clientsSnapshot = await getDocs(clientsQuery);
          users = clientsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          break;
        case 'workers':
          const workersQuery = query(usersRef, where('role', '==', 'worker'));
          const workersSnapshot = await getDocs(workersQuery);
          users = workersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          break;
        case 'visitors':
          // Visitors don't have user accounts, skip for now
          return [];
        case 'all':
        default:
          // Fetch both clients and workers explicitly
          const clientsQ = query(usersRef, where('role', '==', 'client'));
          const workersQ = query(usersRef, where('role', '==', 'worker'));

          const [clientsSnap, workersSnap] = await Promise.all([
            getDocs(clientsQ),
            getDocs(workersQ)
          ]);

          const clients = clientsSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));

          const workers = workersSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));

          // Combine both arrays
          users = [...clients, ...workers];
          break;
      }

      return users;
    } catch (error) {
      console.error('Error getting users by role:', error);
      return [];
    }
  }

  /**
   * Check if notification was already sent for this announcement
   */
  async wasNotificationSent(announcementId, userId) {
    try {
      const key = `notif_sent_${announcementId}_${userId}`;
      const sent = await AsyncStorage.getItem(key);
      return sent === 'true';
    } catch (error) {
      console.error('Error checking notification sent status:', error);
      return false;
    }
  }

  /**
   * Mark notification as sent
   */
  async markNotificationSent(announcementId, userId) {
    try {
      const key = `notif_sent_${announcementId}_${userId}`;
      await AsyncStorage.setItem(key, 'true');
    } catch (error) {
      console.error('Error marking notification as sent:', error);
    }
  }

  /**
   * Send notification to specific user
   */
  async sendToUser(userId, announcement, userPreferences = null) {
    try {
      // Check if already sent
      const alreadySent = await this.wasNotificationSent(announcement.id, userId);
      if (alreadySent) {
        console.log(`Notification already sent to user ${userId} for announcement ${announcement.id}`);
        return { success: false, reason: 'duplicate' };
      }

      // Get user preferences if not provided
      if (!userPreferences) {
        userPreferences = await this.getUserNotificationPreferences(userId);
      }

      // Check if notifications are disabled
      if (!userPreferences.enabled || !userPreferences.announcements) {
        return { success: false, reason: 'disabled' };
      }

      // Check quiet hours
      if (this.isQuietHours(userPreferences)) {
        console.log(`User ${userId} is in quiet hours, skipping notification`);
        return { success: false, reason: 'quiet_hours' };
      }

      // Truncate title and content
      const title = announcement.title.length > 50
        ? announcement.title.substring(0, 47) + '...'
        : announcement.title;

      const body = announcement.content.length > 100
        ? announcement.content.substring(0, 97) + '...'
        : announcement.content;

      // Schedule local notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: {
            type: 'announcement',
            announcementId: announcement.id,
            tag: announcement.tag,
          },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          channelId: 'announcements',
        },
        trigger: null, // Immediate
      });

      // Mark as sent
      await this.markNotificationSent(announcement.id, userId);

      // Track in unread
      await this.markAsUnread(userId, announcement.id);

      return { success: true };
    } catch (error) {
      console.error('Error sending notification to user:', error);
      return { success: false, reason: 'error', error };
    }
  }

  /**
   * Send notification to targeted audience
   */
  async sendAnnouncementNotification(announcement, sendNotification = true) {
    try {
      if (!sendNotification) {
        console.log('Notification sending disabled for this announcement');
        return { success: true, sent: 0, skipped: 0 };
      }

      // Get targeted users
      const users = await this.getUsersByRole(announcement.targetAudience);

      let sent = 0;
      let skipped = 0;
      const results = [];

      // Send to each user
      for (const user of users) {
        const preferences = await this.getUserNotificationPreferences(user.id);
        const result = await this.sendToUser(user.id, announcement, preferences);

        if (result.success) {
          sent++;
        } else {
          skipped++;
        }

        results.push({ userId: user.id, ...result });
      }

      // Log notification send to Firebase
      await addDoc(collection(db, 'notificationLogs'), {
        announcementId: announcement.id,
        targetAudience: announcement.targetAudience,
        sentCount: sent,
        skippedCount: skipped,
        sentAt: serverTimestamp(),
        results,
      });

      return { success: true, sent, skipped, results };
    } catch (error) {
      console.error('Error sending announcement notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Schedule notification for future announcement
   */
  async scheduleAnnouncementNotification(announcement, scheduledDate) {
    try {
      const trigger = new Date(scheduledDate);

      // Store in AsyncStorage for processing when time arrives
      const scheduledNotifs = await this.getScheduledNotifications();
      scheduledNotifs.push({
        announcementId: announcement.id,
        scheduledDate: trigger.toISOString(),
        targetAudience: announcement.targetAudience,
        title: announcement.title,
        content: announcement.content,
        tag: announcement.tag,
      });

      await AsyncStorage.setItem('scheduled_notifs', JSON.stringify(scheduledNotifs));

      return { success: true, scheduledFor: trigger };
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get scheduled notifications
   */
  async getScheduledNotifications() {
    try {
      const data = await AsyncStorage.getItem('scheduled_notifs');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  /**
   * Process scheduled notifications (called periodically)
   */
  async processScheduledNotifications() {
    try {
      const scheduled = await this.getScheduledNotifications();
      const now = new Date();
      const remaining = [];

      for (const notif of scheduled) {
        const triggerTime = new Date(notif.scheduledDate);

        if (triggerTime <= now) {
          // Time to send
          await this.sendAnnouncementNotification(notif, true);
        } else {
          // Still in future
          remaining.push(notif);
        }
      }

      // Update scheduled list
      await AsyncStorage.setItem('scheduled_notifs', JSON.stringify(remaining));
    } catch (error) {
      console.error('Error processing scheduled notifications:', error);
    }
  }

  /**
   * Mark announcement as unread for user
   */
  async markAsUnread(userId, announcementId) {
    try {
      const unreadKey = `unread_${userId}`;
      const data = await AsyncStorage.getItem(unreadKey);
      const unread = data ? JSON.parse(data) : [];

      if (!unread.includes(announcementId)) {
        unread.push(announcementId);
        await AsyncStorage.setItem(unreadKey, JSON.stringify(unread));
      }
    } catch (error) {
      console.error('Error marking as unread:', error);
    }
  }

  /**
   * Mark announcement as read for user
   */
  async markAsRead(userId, announcementId) {
    try {
      const unreadKey = `unread_${userId}`;
      const data = await AsyncStorage.getItem(unreadKey);
      const unread = data ? JSON.parse(data) : [];

      const filtered = unread.filter(id => id !== announcementId);
      await AsyncStorage.setItem(unreadKey, JSON.stringify(filtered));

      return { success: true, unreadCount: filtered.length };
    } catch (error) {
      console.error('Error marking as read:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Mark all announcements as read for user
   */
  async markAllAsRead(userId) {
    try {
      const unreadKey = `unread_${userId}`;
      await AsyncStorage.setItem(unreadKey, JSON.stringify([]));
      return { success: true };
    } catch (error) {
      console.error('Error marking all as read:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get unread count for user
   */
  async getUnreadCount(userId) {
    try {
      const unreadKey = `unread_${userId}`;
      const data = await AsyncStorage.getItem(unreadKey);
      const unread = data ? JSON.parse(data) : [];
      return unread.length;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  /**
   * Get unread announcement IDs for user
   */
  async getUnreadIds(userId) {
    try {
      const unreadKey = `unread_${userId}`;
      const data = await AsyncStorage.getItem(unreadKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting unread IDs:', error);
      return [];
    }
  }

  /**
   * Setup notification listeners
   */
  setupListeners(onNotificationReceived, onNotificationTapped) {
    // Listener for notifications received while app is foregrounded
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      if (onNotificationReceived) {
        onNotificationReceived(notification);
      }
    });

    // Listener for user tapping notification
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      if (onNotificationTapped && data.type === 'announcement') {
        onNotificationTapped(data.announcementId);
      }
    });
  }

  /**
   * Remove listeners
   */
  removeListeners() {
    if (this.notificationListener) {
      this.notificationListener.remove();
    }
    if (this.responseListener) {
      this.responseListener.remove();
    }
  }

  /**
   * Show in-app notification banner
   */
  async showInAppBanner(announcement) {
    // This will be handled by a React component
    return announcement;
  }

  /**
   * Cancel all scheduled notifications for an announcement
   */
  async cancelScheduledNotification(announcementId) {
    try {
      const scheduled = await this.getScheduledNotifications();
      const filtered = scheduled.filter(n => n.announcementId !== announcementId);
      await AsyncStorage.setItem('scheduled_notifs', JSON.stringify(filtered));
      return { success: true };
    } catch (error) {
      console.error('Error canceling scheduled notification:', error);
      return { success: false, error: error.message };
    }
  }
}

export const notificationService = new NotificationService();
export default notificationService;
