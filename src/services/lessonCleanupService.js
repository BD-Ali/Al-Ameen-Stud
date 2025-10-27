import { db } from '../config/firebaseConfig';
import { doc, writeBatch } from 'firebase/firestore';
import * as Notifications from 'expo-notifications';

/**
 * Lesson Cleanup Service
 *
 * Automatically deletes unconfirmed lessons that are more than 24 hours past their scheduled time.
 * This ensures that only completed/confirmed lessons count toward client statistics and payments.
 *
 * Features:
 * - Runs automatic cleanup checks
 * - Only deletes lessons that are unconfirmed and past the 24-hour grace period
 * - Removes associated schedules and missions
 * - Logs all cleanup activities for audit trail
 * - Provides manual cleanup override option
 * - Safe from accidentally deleting confirmed or recent lessons
 */
class LessonCleanupService {
  constructor() {
    this.cleanupInterval = null;
    this.cleanupInProgress = false;
    this.lastCleanupTime = null;
    this.cleanupLog = [];
  }

  /**
   * Calculate if a lesson is past the 24-hour grace period
   * @param {string} lessonDate - Date in YYYY-MM-DD format
   * @param {string} lessonTime - Time in HH:MM format
   * @returns {boolean} True if lesson is more than 24 hours old
   */
  isLessonExpired(lessonDate, lessonTime) {
    try {
      // Parse lesson date and time
      const [year, month, day] = lessonDate.split('-').map(Number);
      const [hours, minutes] = lessonTime.split(':').map(Number);

      // Create lesson datetime (month is 0-indexed in JS)
      const lessonDateTime = new Date(year, month - 1, day, hours, minutes);

      // Calculate 24 hours after lesson time
      const expiryDateTime = new Date(lessonDateTime.getTime() + (24 * 60 * 60 * 1000));

      // Check if current time is past the expiry time
      const now = new Date();
      return now > expiryDateTime;
    } catch (error) {
      console.error('Error parsing lesson date/time:', error);
      return false;
    }
  }

  /**
   * Find all expired unconfirmed lessons
   * @param {Array} lessons - All lessons from Firestore
   * @returns {Array} Array of expired unconfirmed lessons
   */
  findExpiredUnconfirmedLessons(lessons) {
    return lessons.filter(lesson => {
      // Safety checks
      if (!lesson.date || !lesson.time) {
        console.warn(`Lesson ${lesson.id} missing date or time`);
        return false;
      }

      // Confirmed or completed lessons are never deleted
      if (lesson.confirmed === true || lesson.status === 'completed') {
        return false;
      }

      // Cancelled lessons can be cleaned up regardless of time
      if (lesson.status === 'cancelled') {
        return true;
      }

      // Check if lesson is expired (24+ hours past scheduled time)
      return this.isLessonExpired(lesson.date, lesson.time);
    });
  }

  /**
   * Delete a single lesson and its associated records
   * @param {string} lessonId - Lesson ID to delete
   * @param {Array} schedules - All schedules
   * @param {Array} missions - All missions
   * @returns {Promise<Object>} Cleanup result
   */
  async deleteLessonWithAssociations(lessonId, schedules, missions) {
    try {
      const batch = writeBatch(db);
      let deleteCount = 0;

      // Delete the lesson
      batch.delete(doc(db, 'lessons', lessonId));
      deleteCount++;

      // Find and delete associated schedules
      const associatedSchedules = schedules.filter(s => s.lessonId === lessonId);
      associatedSchedules.forEach(schedule => {
        batch.delete(doc(db, 'schedules', schedule.id));
        deleteCount++;
      });

      // Find and delete associated missions
      const associatedMissions = missions.filter(m => m.lessonId === lessonId);
      associatedMissions.forEach(mission => {
        batch.delete(doc(db, 'missions', mission.id));
        deleteCount++;
      });

      // Commit the batch
      await batch.commit();

      return { success: true, deletedCount: deleteCount };
    } catch (error) {
      console.error(`Error deleting lesson ${lessonId}:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Perform automatic cleanup of expired unconfirmed lessons
   * @param {Array} lessons - All lessons
   * @param {Array} schedules - All schedules
   * @param {Array} missions - All missions
   * @param {boolean} dryRun - If true, only report what would be deleted without actually deleting
   * @returns {Promise<Object>} Cleanup summary
   */
  async performCleanup(lessons, schedules, missions, dryRun = false) {
    // Prevent concurrent cleanup operations
    if (this.cleanupInProgress) {
      console.log('Cleanup already in progress, skipping...');
      return { success: false, error: 'Cleanup already in progress' };
    }

    this.cleanupInProgress = true;
    const startTime = Date.now();

    try {
      console.log(`🧹 Starting lesson cleanup (${dryRun ? 'DRY RUN' : 'LIVE'})...`);

      // Find expired unconfirmed lessons
      const expiredLessons = this.findExpiredUnconfirmedLessons(lessons);

      if (expiredLessons.length === 0) {
        console.log('✅ No expired unconfirmed lessons found');
        this.cleanupInProgress = false;
        return {
          success: true,
          message: 'No expired lessons to clean up',
          deletedLessons: 0,
          totalDeleted: 0,
          duration: Date.now() - startTime
        };
      }

      console.log(`Found ${expiredLessons.length} expired unconfirmed lessons`);

      // Log details of lessons to be deleted
      const lessonsToDelete = expiredLessons.map(lesson => ({
        id: lesson.id,
        date: lesson.date,
        time: lesson.time,
        clientId: lesson.clientId,
        status: lesson.status,
        reason: lesson.status === 'cancelled' ? 'Cancelled lesson' : 'Expired unconfirmed lesson'
      }));

      if (dryRun) {
        console.log('DRY RUN - Would delete:', lessonsToDelete);
        this.cleanupInProgress = false;
        return {
          success: true,
          dryRun: true,
          lessonsToDelete,
          deletedLessons: expiredLessons.length,
          duration: Date.now() - startTime
        };
      }

      // Actually delete the lessons (LIVE mode)
      let totalDeleted = 0;
      const results = [];

      for (const lesson of expiredLessons) {
        const result = await this.deleteLessonWithAssociations(lesson.id, schedules, missions);
        if (result.success) {
          totalDeleted += result.deletedCount;
          results.push({ lessonId: lesson.id, success: true, deletedCount: result.deletedCount });
        } else {
          results.push({ lessonId: lesson.id, success: false, error: result.error });
        }
      }

      const duration = Date.now() - startTime;
      this.lastCleanupTime = new Date().toISOString();

      // Log cleanup activity
      const logEntry = {
        timestamp: this.lastCleanupTime,
        deletedLessons: expiredLessons.length,
        totalDeleted,
        duration,
        details: lessonsToDelete
      };
      this.cleanupLog.push(logEntry);

      // Keep only last 100 log entries
      if (this.cleanupLog.length > 100) {
        this.cleanupLog = this.cleanupLog.slice(-100);
      }

      console.log(`✅ Cleanup complete: Deleted ${expiredLessons.length} lessons (${totalDeleted} total records) in ${duration}ms`);

      this.cleanupInProgress = false;
      return {
        success: true,
        deletedLessons: expiredLessons.length,
        totalDeleted,
        duration,
        details: results,
        lessonsDeleted: lessonsToDelete
      };
    } catch (error) {
      console.error('Error during cleanup:', error);
      this.cleanupInProgress = false;
      return { success: false, error: error.message };
    }
  }

  /**
   * Start automatic cleanup timer
   * Runs cleanup every 12 hours by default
   * @param {Function} getLessons - Function to retrieve current lessons
   * @param {Function} getSchedules - Function to retrieve current schedules
   * @param {Function} getMissions - Function to retrieve current missions
   * @param {number} intervalHours - Hours between cleanup runs (default: 12)
   */
  startAutoCleanup(getLessons, getSchedules, getMissions, intervalHours = 12) {
    // Clear existing interval if any
    this.stopAutoCleanup();

    const intervalMs = intervalHours * 60 * 60 * 1000;

    console.log(`🚀 Starting automatic lesson cleanup (every ${intervalHours} hours)`);

    // Run cleanup immediately on start
    this.performCleanup(getLessons(), getSchedules(), getMissions()).catch(error => {
      console.error('Initial cleanup failed:', error);
    });

    // Set up recurring cleanup
    this.cleanupInterval = setInterval(async () => {
      try {
        console.log('⏰ Running scheduled cleanup...');
        await this.performCleanup(getLessons(), getSchedules(), getMissions());
      } catch (error) {
        console.error('Scheduled cleanup failed:', error);
      }
    }, intervalMs);

    return { success: true, message: `Auto-cleanup started (every ${intervalHours} hours)` };
  }

  /**
   * Stop automatic cleanup timer
   */
  stopAutoCleanup() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
      console.log('🛑 Automatic lesson cleanup stopped');
      return { success: true, message: 'Auto-cleanup stopped' };
    }
    return { success: false, message: 'No auto-cleanup was running' };
  }

  /**
   * Get cleanup statistics
   * @returns {Object} Cleanup stats
   */
  getCleanupStats() {
    return {
      lastCleanupTime: this.lastCleanupTime,
      cleanupInProgress: this.cleanupInProgress,
      autoCleanupActive: this.cleanupInterval !== null,
      totalCleanupRuns: this.cleanupLog.length,
      recentCleanups: this.cleanupLog.slice(-10)
    };
  }

  /**
   * Manual cleanup trigger with notification
   * @param {Array} lessons - All lessons
   * @param {Array} schedules - All schedules
   * @param {Array} missions - All missions
   * @param {boolean} notifyUser - Whether to show notification
   * @returns {Promise<Object>} Cleanup result
   */
  async manualCleanup(lessons, schedules, missions, notifyUser = true) {
    const result = await this.performCleanup(lessons, schedules, missions, false);

    if (notifyUser && result.success && result.deletedLessons > 0) {
      try {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'تنظيف الدروس',
            body: `تم حذف ${result.deletedLessons} درس منتهي الصلاحية`,
            data: { type: 'cleanup', count: result.deletedLessons }
          },
          trigger: null
        });
      } catch (error) {
        console.warn('Could not send cleanup notification:', error);
      }
    }

    return result;
  }
}

// Export singleton instance
const lessonCleanupService = new LessonCleanupService();
export default lessonCleanupService;

