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

/**
 * LessonCleanupService - Automatically deletes old lessons and related data
 * Runs periodically to clean up completed lessons older than a specified time
 */
class LessonCleanupService {
  constructor() {
    this.cleanupInterval = null;
    this.isRunning = false;
    this.defaultRetentionDays = 90; // Keep lessons for 90 days by default
  }

  /**
   * Start automatic cleanup that runs at regular intervals
   * @param {Function} getLessons - Function that returns current lessons array
   * @param {Function} getSchedules - Function that returns current schedules array
   * @param {Function} getMissions - Function that returns current missions array
   * @param {number} intervalHours - How often to run cleanup (in hours)
   * @param {number} retentionDays - How many days to keep old lessons (default: 90)
   */
  startAutoCleanup(getLessons, getSchedules, getMissions, intervalHours = 12, retentionDays = 90) {
    if (this.isRunning) {
      console.log('Cleanup service is already running');
      return;
    }

    this.defaultRetentionDays = retentionDays;
    this.isRunning = true;

    console.log(`Starting lesson cleanup service (every ${intervalHours} hours, keeping ${retentionDays} days)`);

    // Run cleanup immediately on start
    this.runCleanup(getLessons, getSchedules, getMissions);

    // Schedule periodic cleanup
    const intervalMs = intervalHours * 60 * 60 * 1000;
    this.cleanupInterval = setInterval(() => {
      this.runCleanup(getLessons, getSchedules, getMissions);
    }, intervalMs);
  }

  /**
   * Stop automatic cleanup
   */
  stopAutoCleanup() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
      this.isRunning = false;
      console.log('Lesson cleanup service stopped');
    }
  }

  /**
   * Run the cleanup process
   * @private
   */
  async runCleanup(getLessons, getSchedules, getMissions) {
    try {
      console.log('Running lesson cleanup...');

      const lessons = getLessons();
      const schedules = getSchedules();
      const missions = getMissions();

      const cutoffDate = this.calculateCutoffDate(this.defaultRetentionDays);

      const deletedCount = await this.cleanupOldLessons(lessons, schedules, missions, cutoffDate);

      if (deletedCount > 0) {
        console.log(`Cleaned up ${deletedCount} old lessons and related data`);
      } else {
        console.log('No old lessons to clean up');
      }
    } catch (error) {
      console.error('Error running cleanup:', error);
    }
  }

  /**
   * Clean up lessons older than the cutoff date
   * @param {Array} lessons - All lessons
   * @param {Array} schedules - All schedules
   * @param {Array} missions - All missions
   * @param {Date} cutoffDate - Delete lessons before this date
   * @returns {number} - Number of items deleted
   */
  async cleanupOldLessons(lessons, schedules, missions, cutoffDate) {
    try {
      const batch = writeBatch(db);
      let deletedCount = 0;

      // Find old completed or cancelled lessons
      const oldLessons = lessons.filter(lesson => {
        const lessonDate = this.parseLessonDate(lesson.date, lesson.time);

        // Only delete lessons that are:
        // 1. Older than cutoff date
        // 2. Completed OR cancelled OR have no status
        const isOld = lessonDate && lessonDate < cutoffDate;
        const isDone = lesson.status === 'completed' ||
                       lesson.status === 'cancelled' ||
                       lesson.confirmed === true;

        return isOld && isDone;
      });

      if (oldLessons.length === 0) {
        return 0;
      }

      console.log(`Found ${oldLessons.length} old lessons to delete`);

      // Delete each old lesson and its related data
      for (const lesson of oldLessons) {
        // Delete the lesson
        batch.delete(doc(db, 'lessons', lesson.id));
        deletedCount++;

        // Find and delete related schedules
        const relatedSchedules = schedules.filter(s => s.lessonId === lesson.id);
        for (const schedule of relatedSchedules) {
          batch.delete(doc(db, 'schedules', schedule.id));
          deletedCount++;
        }

        // Find and delete related missions
        const relatedMissions = missions.filter(m => m.lessonId === lesson.id);
        for (const mission of relatedMissions) {
          batch.delete(doc(db, 'missions', mission.id));
          deletedCount++;
        }
      }

      // Commit the batch delete
      await batch.commit();

      return deletedCount;
    } catch (error) {
      console.error('Error cleaning up old lessons:', error);
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

      // Delete the lesson
      batch.delete(doc(db, 'lessons', lessonId));

      // Find and delete related schedules
      const schedulesQuery = query(
        collection(db, 'schedules'),
        where('lessonId', '==', lessonId)
      );
      const schedulesSnapshot = await getDocs(schedulesQuery);
      schedulesSnapshot.forEach(doc => {
        batch.delete(doc.ref);
      });

      // Find and delete related missions
      const missionsQuery = query(
        collection(db, 'missions'),
        where('lessonId', '==', lessonId)
      );
      const missionsSnapshot = await getDocs(missionsQuery);
      missionsSnapshot.forEach(doc => {
        batch.delete(doc.ref);
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
   * Perform cleanup operation (alias for cleanupOldLessons for backward compatibility)
   * @param {Array} lessons - All lessons
   * @param {Array} schedules - All schedules
   * @param {Array} missions - All missions
   * @param {boolean} dryRun - If true, only reports what would be deleted
   * @returns {object} - Cleanup result
   */
  async performCleanup(lessons, schedules, missions, dryRun = false) {
    try {
      const cutoffDate = this.calculateCutoffDate(this.defaultRetentionDays);

      if (dryRun) {
        // Just return statistics without deleting
        const stats = this.getCleanupStats(lessons, this.defaultRetentionDays);
        return {
          success: true,
          dryRun: true,
          ...stats,
        };
      }

      const deletedCount = await this.cleanupOldLessons(lessons, schedules, missions, cutoffDate);

      return {
        success: true,
        deleted: deletedCount,
        message: `Cleaned up ${deletedCount} old lesson records`,
      };
    } catch (error) {
      console.error('Error performing cleanup:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Calculate the cutoff date (lessons before this will be deleted)
   * @param {number} retentionDays - How many days to keep
   * @returns {Date}
   * @private
   */
  calculateCutoffDate(retentionDays) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - retentionDays);
    cutoff.setHours(0, 0, 0, 0); // Start of day
    return cutoff;
  }

  /**
   * Parse lesson date and time into a Date object
   * @private
   */
  parseLessonDate(dateStr, timeStr) {
    try {
      // Date format: YYYY-MM-DD, Time format: HH:MM
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
   * Clean up cancelled lessons immediately
   * @param {Array} lessons - All lessons
   * @param {Array} schedules - All schedules
   * @param {Array} missions - All missions
   */
  async cleanupCancelledLessons(lessons, schedules, missions) {
    try {
      const cancelledLessons = lessons.filter(lesson =>
        lesson.status === 'cancelled'
      );

      if (cancelledLessons.length === 0) {
        return 0;
      }

      console.log(`Cleaning up ${cancelledLessons.length} cancelled lessons`);

      const batch = writeBatch(db);
      let deletedCount = 0;

      for (const lesson of cancelledLessons) {
        // Delete the lesson
        batch.delete(doc(db, 'lessons', lesson.id));
        deletedCount++;

        // Find and delete related schedules
        const relatedSchedules = schedules.filter(s => s.lessonId === lesson.id);
        for (const schedule of relatedSchedules) {
          batch.delete(doc(db, 'schedules', schedule.id));
          deletedCount++;
        }

        // Find and delete related missions
        const relatedMissions = missions.filter(m => m.lessonId === lesson.id);
        for (const mission of relatedMissions) {
          batch.delete(doc(db, 'missions', mission.id));
          deletedCount++;
        }
      }

      await batch.commit();

      console.log(`Cleaned up ${deletedCount} cancelled lesson records`);
      return deletedCount;
    } catch (error) {
      console.error('Error cleaning up cancelled lessons:', error);
      return 0;
    }
  }

  /**
   * Get statistics about what would be cleaned up
   * @param {Array} lessons - All lessons
   * @param {number} retentionDays - How many days to keep
   * @returns {object} - Statistics
   */
  getCleanupStats(lessons, retentionDays = 90) {
    const cutoffDate = this.calculateCutoffDate(retentionDays);

    const oldLessons = lessons.filter(lesson => {
      const lessonDate = this.parseLessonDate(lesson.date, lesson.time);
      const isOld = lessonDate && lessonDate < cutoffDate;
      const isDone = lesson.status === 'completed' ||
                     lesson.status === 'cancelled' ||
                     lesson.confirmed === true;

      return isOld && isDone;
    });

    const cancelledLessons = lessons.filter(l => l.status === 'cancelled');

    return {
      totalLessons: lessons.length,
      oldCompletedLessons: oldLessons.length,
      cancelledLessons: cancelledLessons.length,
      cutoffDate: cutoffDate.toISOString(),
      retentionDays,
    };
  }
}

// Export singleton instance
const lessonCleanupService = new LessonCleanupService();
export default lessonCleanupService;

