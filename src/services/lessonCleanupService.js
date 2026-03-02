import { db } from '../config/firebaseConfig';
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  writeBatch
} from 'firebase/firestore';
import lessonReminderService from './lessonReminderService';

/**
 * LessonCleanupService - Automatically deletes expired lessons and related data
 * 
 * Runs daily at midnight (00:00) to remove lessons whose scheduled date+time
 * has passed. Also cancels any leftover reminder notifications for those lessons.
 */
class LessonCleanupService {
  constructor() {
    this.midnightTimeout = null;
    this.dailyInterval = null;
    this.isRunning = false;
    this.getLessons = null;
    this.getSchedules = null;
    this.getMissions = null;
  }

  /**
   * Calculate milliseconds until the next midnight (00:00)
   * @returns {number} Milliseconds until next midnight
   * @private
   */
  getMillisUntilMidnight() {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setDate(midnight.getDate() + 1);
    midnight.setHours(0, 0, 0, 0);
    return midnight.getTime() - now.getTime();
  }

  /**
   * Start automatic cleanup that runs daily at midnight (00:00)
   * Deletes all lessons whose scheduled date+time has passed.
   * @param {Function} getLessons - Function that returns current lessons array
   * @param {Function} getSchedules - Function that returns current schedules array
   * @param {Function} getMissions - Function that returns current missions array
   */
  startAutoCleanup(getLessons, getSchedules, getMissions) {
    if (this.isRunning) {
      console.log('Cleanup service is already running');
      return;
    }

    this.getLessons = getLessons;
    this.getSchedules = getSchedules;
    this.getMissions = getMissions;
    this.isRunning = true;

    // Run cleanup immediately on start to clear any already-expired lessons
    this.runCleanup();

    // Schedule next run at midnight, then every 24 hours after that
    this.scheduleMidnightCleanup();

    console.log('Lesson cleanup service started (runs daily at midnight 00:00)');
  }

  /**
   * Schedule cleanup to fire at the next midnight, then repeat every 24 hours
   * @private
   */
  scheduleMidnightCleanup() {
    const msUntilMidnight = this.getMillisUntilMidnight();
    const minutesUntil = Math.round(msUntilMidnight / 60000);
    console.log(`Next cleanup scheduled in ${minutesUntil} minutes (at midnight 00:00)`);

    this.midnightTimeout = setTimeout(() => {
      // Run at midnight
      this.runCleanup();

      // Then repeat every 24 hours
      const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
      this.dailyInterval = setInterval(() => {
        this.runCleanup();
      }, TWENTY_FOUR_HOURS);
    }, msUntilMidnight);
  }

  /**
   * Stop automatic cleanup
   */
  stopAutoCleanup() {
    if (this.midnightTimeout) {
      clearTimeout(this.midnightTimeout);
      this.midnightTimeout = null;
    }
    if (this.dailyInterval) {
      clearInterval(this.dailyInterval);
      this.dailyInterval = null;
    }
    this.isRunning = false;
    this.getLessons = null;
    this.getSchedules = null;
    this.getMissions = null;
    console.log('Lesson cleanup service stopped');
  }

  /**
   * Run the cleanup process:
   * 1. Delete all lessons whose date+time has passed (expired)
   * 2. Cancel leftover reminder notifications for past lessons
   * @private
   */
  async runCleanup() {
    try {
      console.log('Running lesson cleanup at', new Date().toLocaleString());

      const lessons = this.getLessons();
      const schedules = this.getSchedules();
      const missions = this.getMissions();

      // Step 1: Delete all expired lessons (date+time has passed)
      const deletedCount = await this.cleanupExpiredLessons(lessons, schedules, missions);

      if (deletedCount > 0) {
        console.log(`Cleaned up ${deletedCount} expired lesson records`);
      } else {
        console.log('No expired lessons to clean up');
      }

      // Step 2: Clean up any leftover past reminder notifications
      try {
        await lessonReminderService.cleanupPastReminders();
        console.log('Past reminder notifications cleaned up');
      } catch (reminderError) {
        console.warn('Could not clean up past reminders:', reminderError.message);
      }
    } catch (error) {
      console.error('Error running cleanup:', error);
    }
  }

  /**
   * Delete all lessons whose scheduled date+time has already passed.
   * Also deletes related schedules, missions, and cancels reminder notifications.
   * Handles Firestore batch limit of 500 operations by splitting into multiple batches.
   * @param {Array} lessons - All lessons
   * @param {Array} schedules - All schedules
   * @param {Array} missions - All missions
   * @returns {number} - Number of items deleted
   */
  async cleanupExpiredLessons(lessons, schedules, missions) {
    try {
      const now = new Date();

      // Find all lessons whose date+time has passed
      const expiredLessons = lessons.filter(lesson => {
        const lessonDate = this.parseLessonDate(lesson.date, lesson.time);
        return lessonDate && lessonDate < now;
      });

      if (expiredLessons.length === 0) {
        return 0;
      }

      console.log(`Found ${expiredLessons.length} expired lessons to delete`);

      let totalDeleted = 0;
      const BATCH_LIMIT = 450; // Stay under Firestore's 500-op batch limit
      let batch = writeBatch(db);
      let batchCount = 0;

      for (const lesson of expiredLessons) {
        // Cancel any scheduled reminder notifications for this lesson
        try {
          await lessonReminderService.cancelLessonReminders(lesson.id);
        } catch (e) {
          console.warn(`Could not cancel reminders for lesson ${lesson.id}:`, e.message);
        }

        // Delete the lesson document
        batch.delete(doc(db, 'lessons', lesson.id));
        batchCount++;
        totalDeleted++;

        // Delete related schedules
        const relatedSchedules = schedules.filter(s => s.lessonId === lesson.id);
        for (const schedule of relatedSchedules) {
          batch.delete(doc(db, 'schedules', schedule.id));
          batchCount++;
          totalDeleted++;
        }

        // Delete related missions
        const relatedMissions = missions.filter(m => m.lessonId === lesson.id);
        for (const mission of relatedMissions) {
          batch.delete(doc(db, 'missions', mission.id));
          batchCount++;
          totalDeleted++;
        }

        // Commit and start new batch if approaching limit
        if (batchCount >= BATCH_LIMIT) {
          await batch.commit();
          batch = writeBatch(db);
          batchCount = 0;
        }
      }

      // Commit remaining operations
      if (batchCount > 0) {
        await batch.commit();
      }

      return totalDeleted;
    } catch (error) {
      console.error('Error cleaning up expired lessons:', error);
      return 0;
    }
  }

  /**
   * Manually trigger cleanup for a specific lesson and its related data
   * @param {string} lessonId - The lesson ID to clean up
   */
  async cleanupLesson(lessonId) {
    try {
      const batch = writeBatch(db);

      // Cancel reminder notifications
      try {
        await lessonReminderService.cancelLessonReminders(lessonId);
      } catch (e) {
        console.warn(`Could not cancel reminders for lesson ${lessonId}:`, e.message);
      }

      // Delete the lesson
      batch.delete(doc(db, 'lessons', lessonId));

      // Find and delete related schedules
      const schedulesQuery = query(
        collection(db, 'schedules'),
        where('lessonId', '==', lessonId)
      );
      const schedulesSnapshot = await getDocs(schedulesQuery);
      schedulesSnapshot.forEach(docSnap => {
        batch.delete(docSnap.ref);
      });

      // Find and delete related missions
      const missionsQuery = query(
        collection(db, 'missions'),
        where('lessonId', '==', lessonId)
      );
      const missionsSnapshot = await getDocs(missionsQuery);
      missionsSnapshot.forEach(docSnap => {
        batch.delete(docSnap.ref);
      });

      await batch.commit();

      console.log(`Cleaned up lesson ${lessonId} and related data`);
      return { success: true };
    } catch (error) {
      console.error('Error cleaning up lesson:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Perform cleanup operation (used by manual cleanup trigger in DataContext)
   * @param {Array} lessons - All lessons
   * @param {Array} schedules - All schedules
   * @param {Array} missions - All missions
   * @param {boolean} dryRun - If true, only reports what would be deleted
   * @returns {object} - Cleanup result
   */
  async performCleanup(lessons, schedules, missions, dryRun = false) {
    try {
      if (dryRun) {
        const stats = this.getCleanupStats(lessons);
        return {
          success: true,
          dryRun: true,
          ...stats,
        };
      }

      const deletedCount = await this.cleanupExpiredLessons(lessons, schedules, missions);

      return {
        success: true,
        deleted: deletedCount,
        message: `Cleaned up ${deletedCount} expired lesson records`,
      };
    } catch (error) {
      console.error('Error performing cleanup:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Parse lesson date and time into a Date object
   * @param {string} dateStr - Date in YYYY-MM-DD format
   * @param {string} timeStr - Time in HH:MM format
   * @returns {Date|null}
   * @private
   */
  parseLessonDate(dateStr, timeStr) {
    try {
      if (!dateStr) return null;

      const [year, month, day] = dateStr.split('-').map(Number);

      let hours = 0, minutes = 0;
      if (timeStr) {
        [hours, minutes] = timeStr.split(':').map(Number);
      }

      const lessonDate = new Date(year, month - 1, day, hours, minutes);

      if (isNaN(lessonDate.getTime())) {
        console.error('Invalid lesson date/time:', dateStr, timeStr);
        return null;
      }

      return lessonDate;
    } catch (error) {
      console.error('Error parsing lesson date:', error);
      return null;
    }
  }

  /**
   * Get statistics about what would be cleaned up
   * @param {Array} lessons - All lessons
   * @returns {object} - Statistics
   */
  getCleanupStats(lessons) {
    const now = new Date();

    const expiredLessons = lessons.filter(lesson => {
      const lessonDate = this.parseLessonDate(lesson.date, lesson.time);
      return lessonDate && lessonDate < now;
    });

    const cancelledLessons = lessons.filter(l => l.status === 'cancelled');
    const upcomingLessons = lessons.filter(lesson => {
      const lessonDate = this.parseLessonDate(lesson.date, lesson.time);
      return lessonDate && lessonDate >= now;
    });

    return {
      totalLessons: lessons.length,
      expiredLessons: expiredLessons.length,
      upcomingLessons: upcomingLessons.length,
      cancelledLessons: cancelledLessons.length,
    };
  }
}

// Export singleton instance
const lessonCleanupService = new LessonCleanupService();
export default lessonCleanupService;

