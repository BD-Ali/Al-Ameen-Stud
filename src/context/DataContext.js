import React, { createContext, useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
  setDoc,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';
import notificationService from '../services/notificationService';
import lessonReminderService from '../services/lessonReminderService';
import lessonCleanupService from '../services/lessonCleanupService';
import { useTranslation } from '../i18n/LanguageContext';

/**
 * DataContext stores all of the core stable data and syncs with Firebase Firestore.
 * All data is now persisted in the cloud and synced in real-time.
 */
export const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [horses, setHorses] = useState([]);
  const [clients, setClients] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [missions, setMissions] = useState([]);
  const [workerUsers, setWorkerUsers] = useState([]); // Users with role 'worker'
  const [loading, setLoading] = useState(true);
  const [weeklySchedules, setWeeklySchedules] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);

  const { t } = useTranslation();

  // Subscribe to horses collection
  useEffect(() => {
    const q = query(collection(db, 'horses'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const horsesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setHorses(horsesData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching horses:', error);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Subscribe to clients collection
  useEffect(() => {
    const q = query(collection(db, 'clients'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const clientsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setClients(clientsData);
    }, (error) => {
      console.error('Error fetching clients:', error);
    });

    return unsubscribe;
  }, []);

  // Subscribe to workers collection
  useEffect(() => {
    const q = query(collection(db, 'workers'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const workersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setWorkers(workersData);
    }, (error) => {
      console.error('Error fetching workers:', error);
    });

    return unsubscribe;
  }, []);

  // Subscribe to users collection and filter workers by role
  useEffect(() => {
    const q = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Filter only users with role 'worker'
      const workerUsersData = usersData.filter(user => user.role === 'worker');
      setWorkerUsers(workerUsersData);
    }, (error) => {
      console.error('Error fetching worker users:', error);
    });

    return unsubscribe;
  }, []);

  // Subscribe to lessons collection
  useEffect(() => {
    const q = query(collection(db, 'lessons'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lessonsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLessons(lessonsData);
    }, (error) => {
      console.error('Error fetching lessons:', error);
    });

    return unsubscribe;
  }, []);

  // Start automatic lesson cleanup — runs daily at midnight (00:00)
  useEffect(() => {
    if (lessons.length > 0 && schedules.length >= 0 && missions.length >= 0) {
      // Start auto-cleanup that runs daily at midnight to delete expired lessons
      lessonCleanupService.startAutoCleanup(
        () => lessons,
        () => schedules,
        () => missions
      );

      return () => {
        // Stop auto-cleanup when component unmounts
        lessonCleanupService.stopAutoCleanup();
      };
    }
  }, [lessons.length, schedules.length, missions.length]);

  // Subscribe to reminders collection
  useEffect(() => {
    const q = query(collection(db, 'reminders'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const remindersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setReminders(remindersData);
    }, (error) => {
      console.error('Error fetching reminders:', error);
    });

    return unsubscribe;
  }, []);

  // Subscribe to schedules collection
  useEffect(() => {
    const q = query(collection(db, 'schedules'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const schedulesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSchedules(schedulesData);
    }, (error) => {
      console.error('Error fetching schedules:', error);
    });

    return unsubscribe;
  }, []);

  // Subscribe to missions collection
  useEffect(() => {
    const q = query(collection(db, 'missions'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const missionsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMissions(missionsData);
    }, (error) => {
      console.error('Error fetching missions:', error);
    });

    return unsubscribe;
  }, []);

  // Subscribe to weeklySchedules collection
  useEffect(() => {
    const q = query(collection(db, 'weeklySchedules'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const weeklySchedulesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setWeeklySchedules(weeklySchedulesData);
    }, (error) => {
      console.error('Error fetching weekly schedules:', error);
    });

    return unsubscribe;
  }, []);

  // Subscribe to announcements collection
  useEffect(() => {
    const q = query(collection(db, 'announcements'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const announcementsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAnnouncements(announcementsData);
    }, (error) => {
      console.error('Error fetching announcements:', error);
    });

    return unsubscribe;
  }, []);

  // Subscribe to paymentHistory collection
  useEffect(() => {
    const q = query(collection(db, 'paymentHistory'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPaymentHistory(data);
    }, (error) => {
      console.error('Error fetching payment history:', error);
    });

    return unsubscribe;
  }, []);

  /**
   * Add a payment record to payment history
   */
  const addPaymentRecord = async (clientId, record) => {
    try {
      await addDoc(collection(db, 'paymentHistory'), {
        clientId,
        ...record,
        createdAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Error adding payment record:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Create a new user account with Firebase Auth and store in Firestore
   */
  const createUserAccount = async (name, email, phoneNumber, role = 'client', subscriptionData = null) => {
    try {
      // Create auth user with phone number as password (remove dashes from phone number)
      const passwordFromPhone = phoneNumber.replace(/-/g, '');
      const userCredential = await createUserWithEmailAndPassword(auth, email, passwordFromPhone);
      const user = userCredential.user;

      // Store user profile in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email,
        name,
        phoneNumber,
        role,
        createdAt: serverTimestamp(),
      });

      // If client, create client record
      if (role === 'client') {
        const clientData = {
          name,
          email,
          phoneNumber,
          amountPaid: 0,
          amountDue: 0,
          lessonCount: 0,
          createdAt: serverTimestamp(),
        };

        // Add subscription data if provided
        if (subscriptionData) {
          clientData.hasSubscription = subscriptionData.hasSubscription || false;
          clientData.subscriptionLessons = subscriptionData.subscriptionLessons || 0;
          clientData.subscriptionTotalLessons = subscriptionData.subscriptionTotalLessons || 0;
          clientData.subscriptionUsedLessons = subscriptionData.subscriptionUsedLessons || 0;
          clientData.subscriptionActive = subscriptionData.subscriptionActive || false;
          clientData.subscriptionStartDate = subscriptionData.subscriptionStartDate || null;
        } else {
          // Default subscription values
          clientData.hasSubscription = false;
          clientData.subscriptionLessons = 0;
          clientData.subscriptionTotalLessons = 0;
          clientData.subscriptionUsedLessons = 0;
          clientData.subscriptionActive = false;
        }

        await setDoc(doc(db, 'clients', user.uid), clientData);
      }

      // If worker, create worker record
      if (role === 'worker') {
        await setDoc(doc(db, 'workers', user.uid), {
          name,
          email,
          phoneNumber,
          role: 'worker', // Default role stored in English
          contact: phoneNumber,
          createdAt: serverTimestamp(),
        });
      }

      return { success: true, userId: user.uid };
    } catch (error) {
      console.error('Error creating user account:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Add a new horse to the stable.
   */
  const addHorse = async (horse) => {
    try {
      await addDoc(collection(db, 'horses'), {
        ...horse,
        createdAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Error adding horse:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Update an existing horse.
   */
  const updateHorse = async (id, updates) => {
    try {
      await updateDoc(doc(db, 'horses', id), {
        ...updates,
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating horse:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Add a new client.
   */
  const addClient = async (client) => {
    try {
      const clientRef = await addDoc(collection(db, 'clients'), {
        ...client,
        lessonCount: client.lessonCount || 0,
        createdAt: serverTimestamp()
      });

      // Send notification about new client registration
      const clientWithId = { ...client, id: clientRef.id };
      await notificationService.sendClientRegisteredNotification(clientWithId);

      return { success: true, id: clientRef.id };
    } catch (error) {
      console.error('Error adding client:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Update a client (e.g., payment status).
   */
  const updateClient = async (id, updates) => {
    try {
      const currentClient = clients.find(c => c.id === id);

      await updateDoc(doc(db, 'clients', id), {
        ...updates,
        updatedAt: serverTimestamp()
      });

      // Send payment notification if amountPaid increased
      if (currentClient && updates.amountPaid && updates.amountPaid > (currentClient.amountPaid || 0)) {
        const paymentAmount = updates.amountPaid - (currentClient.amountPaid || 0);
        const clientWithUpdates = { ...currentClient, ...updates, id };
        await notificationService.sendPaymentReceivedNotification(clientWithUpdates, paymentAmount);
      }

      // Send subscription expiring notification if lessons are running low
      if (updates.subscriptionLessons !== undefined) {
        const remainingLessons = updates.subscriptionLessons;

        // Notify when 3 or fewer lessons remain and subscription is active
        if (remainingLessons > 0 && remainingLessons <= 3 && (currentClient?.subscriptionActive || updates.subscriptionActive)) {
          const clientWithUpdates = { ...currentClient, ...updates, id };
          await notificationService.sendSubscriptionExpiringNotification(clientWithUpdates, remainingLessons);
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating client:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Add a new worker.
   */
  const addWorker = async (worker) => {
    try {
      await addDoc(collection(db, 'workers'), {
        ...worker,
        createdAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Error adding worker:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Check if worker is available at the given date and time
   */
  const isWorkerAvailable = (workerId, date, time, excludeLessonId = null) => {
    const [hours, minutes] = time.split(':').map(Number);
    const lessonStartTime = hours * 60 + minutes;
    const lessonEndTime = lessonStartTime + 60; // 1 hour lesson duration

    const workerLessons = lessons.filter(l =>
      l.instructorId === workerId &&
      l.date === date &&
      l.id !== excludeLessonId
    );

    for (const existingLesson of workerLessons) {
      const [existingHours, existingMinutes] = existingLesson.time.split(':').map(Number);
      const existingStartTime = existingHours * 60 + existingMinutes;
      const existingEndTime = existingStartTime + 60;

      // Check if there's any overlap
      if (
        (lessonStartTime >= existingStartTime && lessonStartTime < existingEndTime) ||
        (lessonEndTime > existingStartTime && lessonEndTime <= existingEndTime) ||
        (lessonStartTime <= existingStartTime && lessonEndTime >= existingEndTime)
      ) {
        return false;
      }
    }
    return true;
  };

  /**
   * Check if horse is available at the given date and time
   */
  const isHorseAvailable = (horseId, date, time, excludeLessonId = null) => {
    const [hours, minutes] = time.split(':').map(Number);
    const lessonStartTime = hours * 60 + minutes;
    const lessonEndTime = lessonStartTime + 60; // 1 hour lesson duration

    const horseLessons = lessons.filter(l =>
      l.horseId === horseId &&
      l.date === date &&
      l.id !== excludeLessonId
    );

    for (const existingLesson of horseLessons) {
      const [existingHours, existingMinutes] = existingLesson.time.split(':').map(Number);
      const existingStartTime = existingHours * 60 + existingMinutes;
      const existingEndTime = existingStartTime + 60;

      // Check if there's any overlap
      if (
        (lessonStartTime >= existingStartTime && lessonStartTime < existingEndTime) ||
        (lessonEndTime > existingStartTime && lessonEndTime <= existingEndTime) ||
        (lessonStartTime <= existingStartTime && lessonEndTime >= existingEndTime)
      ) {
        return false;
      }
    }
    return true;
  };

  /**
   * Check if client is available at the given date and time (no overlapping lessons)
   */
  const isClientAvailable = (clientId, date, time, excludeLessonId = null) => {
    const [hours, minutes] = time.split(':').map(Number);
    const lessonStartTime = hours * 60 + minutes;
    const lessonEndTime = lessonStartTime + 60; // 1 hour lesson duration

    const clientLessons = lessons.filter(l =>
      l.clientId === clientId &&
      l.date === date &&
      l.id !== excludeLessonId &&
      l.status !== 'cancelled'
    );

    for (const existingLesson of clientLessons) {
      const [existingHours, existingMinutes] = existingLesson.time.split(':').map(Number);
      const existingStartTime = existingHours * 60 + existingMinutes;
      const existingEndTime = existingStartTime + 60;

      if (
        (lessonStartTime >= existingStartTime && lessonStartTime < existingEndTime) ||
        (lessonEndTime > existingStartTime && lessonEndTime <= existingEndTime) ||
        (lessonStartTime <= existingStartTime && lessonEndTime >= existingEndTime)
      ) {
        return false;
      }
    }
    return true;
  };

  /**
   * Helper: get date string for a given day of the current week
   * Converts a weekStart + day key to a YYYY-MM-DD string
   */
  const getDateForDayKey = (weekStart, dayKey) => {
    const dayMapping = {
      'saturday': 0, 'sunday': 1, 'monday': 2, 'tuesday': 3,
      'wednesday': 4, 'thursday': 5, 'friday': 6
    };
    const [year, month, day] = weekStart.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    d.setDate(d.getDate() + (dayMapping[dayKey] || 0));
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dd}`;
  };

  /**
   * Helper: get weekId and weekStart from a date string (YYYY-MM-DD)
   */
  const getWeekInfoFromDate = (dateStr) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    // Get Saturday-based week start
    const jsDay = d.getDay(); // 0=Sun .. 6=Sat
    const diff = (jsDay + 1) % 7;
    const weekStartDate = new Date(d);
    weekStartDate.setDate(d.getDate() - diff);
    const ws = `${weekStartDate.getFullYear()}-${String(weekStartDate.getMonth() + 1).padStart(2, '0')}-${String(weekStartDate.getDate()).padStart(2, '0')}`;

    // Week number
    const utc = new Date(Date.UTC(weekStartDate.getFullYear(), weekStartDate.getMonth(), weekStartDate.getDate()));
    const dayNum = utc.getUTCDay() || 7;
    utc.setUTCDate(utc.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
    const weekNum = Math.ceil((((utc - yearStart) / 86400000) + 1) / 7);
    const wId = `${weekStartDate.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;

    // Day key
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayKey = dayNames[d.getDay()];

    return { weekId: wId, weekStart: ws, dayKey };
  };
  const addLesson = async (lesson) => {
    try {
      // Validate worker availability
      if (!isWorkerAvailable(lesson.instructorId, lesson.date, lesson.time)) {
        const workerName = workerUsers.find(w => w.id === lesson.instructorId)?.name || t('notifications.theInstructor');
        return {
          success: false,
          error: t('dataContext.instructorUnavailable', { name: workerName })
        };
      }

      // Validate horse availability
      if (!isHorseAvailable(lesson.horseId, lesson.date, lesson.time)) {
        const horseName = horses.find(h => h.id === lesson.horseId)?.name || t('notifications.theHorse');
        return {
          success: false,
          error: t('dataContext.horseUnavailable', { name: horseName })
        };
      }

      // Validate client availability (prevent double-booking a client)
      if (!isClientAvailable(lesson.clientId, lesson.date, lesson.time)) {
        const clientName = clients.find(c => c.id === lesson.clientId)?.name || t('dataContext.theClient');
        return {
          success: false,
          error: t('dataContext.clientUnavailable', { name: clientName })
        };
      }

      // Add the lesson with initial status
      const lessonRef = await addDoc(collection(db, 'lessons'), {
        ...lesson,
        status: 'scheduled',
        confirmed: false,
        createdAt: serverTimestamp(),
        remindersSent: false,
      });

      const lessonWithId = { ...lesson, id: lessonRef.id };

      // Automatically create a schedule entry for the instructor
      await addDoc(collection(db, 'schedules'), {
        date: lesson.date,
        timeSlot: lesson.time,
        workerId: lesson.instructorId,
        description: t('dataContext.lessonWithClient'),
        type: 'lesson',
        lessonId: lessonRef.id,
        createdAt: serverTimestamp()
      });

      // Automatically create a mission for the instructor
      await addDoc(collection(db, 'missions'), {
        workerId: lesson.instructorId,
        title: t('dataContext.trainingLesson'),
        description: t('dataContext.lessonScheduledAt', { time: lesson.time }),
        dueDate: lesson.date,
        time: lesson.time,
        horseId: lesson.horseId,
        clientId: lesson.clientId,
        lessonId: lessonRef.id,
        type: 'lesson',
        priority: 'high',
        completed: false,
        createdAt: serverTimestamp()
      });

      // Automatically add lesson to weekly schedule so it shows in WeeklyScheduleScreen
      try {
        const { weekId, weekStart, dayKey } = getWeekInfoFromDate(lesson.date);
        const clientName = clients.find(c => c.id === lesson.clientId)?.name || '';
        const horseName = horses.find(h => h.id === lesson.horseId)?.name || '';
        await addDoc(collection(db, 'weeklySchedules'), {
          weekId,
          weekStart,
          day: dayKey,
          timeSlot: lesson.time,
          workerId: lesson.instructorId,
          description: `${t('dataContext.trainingLesson')} — ${clientName} (${horseName})`,
          type: 'lesson',
          lessonId: lessonRef.id,
          createdAt: serverTimestamp()
        });
      } catch (weeklyErr) {
        console.warn('Could not add lesson to weekly schedule:', weeklyErr);
      }

      // Schedule automatic lesson reminder notifications for the client
      const client = clients.find(c => c.id === lesson.clientId);
      if (client) {
        await lessonReminderService.scheduleLessonReminders(lessonWithId, client);
      }

      // Send notification to instructor about new lesson
      const instructor = workerUsers.find(w => w.id === lesson.instructorId);
      const horse = horses.find(h => h.id === lesson.horseId);
      if (instructor && client && horse) {
        await notificationService.sendLessonCreatedNotification(lessonWithId, client, instructor, horse);
      }

      return { success: true, id: lessonRef.id };
    } catch (error) {
      console.error('Error adding lesson:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Update an existing lesson.
   * Reschedules reminder notifications if date/time changed.
   */
  const updateLesson = async (id, updates) => {
    try {
      const currentLesson = lessons.find(l => l.id === id);
      if (!currentLesson) {
        return { success: false, error: 'Lesson not found' };
      }

      // Check which fields changed
      const dateChanged = updates.date && updates.date !== currentLesson.date;
      const timeChanged = updates.time && updates.time !== currentLesson.time;
      const workerChanged = updates.instructorId && updates.instructorId !== currentLesson.instructorId;
      const horseChanged = updates.horseId && updates.horseId !== currentLesson.horseId;
      const clientChanged = updates.clientId && updates.clientId !== currentLesson.clientId;

      // Resolved values after updates
      const resolvedInstructorId = updates.instructorId || currentLesson.instructorId;
      const resolvedDate = updates.date || currentLesson.date;
      const resolvedTime = updates.time || currentLesson.time;
      const resolvedHorseId = updates.horseId || currentLesson.horseId;
      const resolvedClientId = updates.clientId || currentLesson.clientId;

      // Validate worker availability if changed
      if (workerChanged || dateChanged || timeChanged) {
        if (!isWorkerAvailable(resolvedInstructorId, resolvedDate, resolvedTime, id)) {
          const workerName = workerUsers.find(w => w.id === resolvedInstructorId)?.name || t('notifications.theInstructor');
          return {
            success: false,
            error: t('dataContext.instructorUnavailable', { name: workerName })
          };
        }
      }

      // Validate horse availability if changed
      if (horseChanged || dateChanged || timeChanged) {
        if (!isHorseAvailable(resolvedHorseId, resolvedDate, resolvedTime, id)) {
          const horseName = horses.find(h => h.id === resolvedHorseId)?.name || t('notifications.theHorse');
          return {
            success: false,
            error: t('dataContext.horseUnavailable', { name: horseName })
          };
        }
      }

      // Validate client availability if changed
      if (clientChanged || dateChanged || timeChanged) {
        if (!isClientAvailable(resolvedClientId, resolvedDate, resolvedTime, id)) {
          const clientName = clients.find(c => c.id === resolvedClientId)?.name || t('dataContext.theClient');
          return {
            success: false,
            error: t('dataContext.clientUnavailable', { name: clientName })
          };
        }
      }

      await updateDoc(doc(db, 'lessons', id), {
        ...updates,
        updatedAt: serverTimestamp()
      });

      // Sync associated schedule entries when relevant fields change
      if (dateChanged || timeChanged || workerChanged) {
        const associatedSchedules = schedules.filter(s => s.lessonId === id);
        for (const schedule of associatedSchedules) {
          const scheduleUpdates = {};
          if (dateChanged) scheduleUpdates.date = resolvedDate;
          if (timeChanged) scheduleUpdates.timeSlot = resolvedTime;
          if (workerChanged) scheduleUpdates.workerId = resolvedInstructorId;
          await updateDoc(doc(db, 'schedules', schedule.id), scheduleUpdates);
        }
      }

      // Sync associated mission entries when relevant fields change
      if (dateChanged || timeChanged || workerChanged || horseChanged || clientChanged) {
        const associatedMissions = missions.filter(m => m.lessonId === id);
        for (const mission of associatedMissions) {
          const missionUpdates = {};
          if (dateChanged) missionUpdates.dueDate = resolvedDate;
          if (timeChanged) {
            missionUpdates.time = resolvedTime;
            missionUpdates.description = t('dataContext.lessonScheduledAt', { time: resolvedTime });
          }
          if (workerChanged) missionUpdates.workerId = resolvedInstructorId;
          if (horseChanged) missionUpdates.horseId = resolvedHorseId;
          if (clientChanged) missionUpdates.clientId = resolvedClientId;
          await updateDoc(doc(db, 'missions', mission.id), missionUpdates);
        }
      }

      // Sync associated weeklySchedules entries when relevant fields change
      if (dateChanged || timeChanged || workerChanged || horseChanged || clientChanged) {
        try {
          const associatedWeekly = weeklySchedules.filter(s => s.lessonId === id);
          if (dateChanged || timeChanged) {
            // Date/time change means the slot moved — remove old, create new
            for (const ws of associatedWeekly) {
              await deleteDoc(doc(db, 'weeklySchedules', ws.id));
            }
            const { weekId, weekStart, dayKey } = getWeekInfoFromDate(resolvedDate);
            const clientName = clients.find(c => c.id === resolvedClientId)?.name || '';
            const horseName = horses.find(h => h.id === resolvedHorseId)?.name || '';
            await addDoc(collection(db, 'weeklySchedules'), {
              weekId,
              weekStart,
              day: dayKey,
              timeSlot: resolvedTime,
              workerId: resolvedInstructorId,
              description: `${t('dataContext.trainingLesson')} — ${clientName} (${horseName})`,
              type: 'lesson',
              lessonId: id,
              createdAt: serverTimestamp()
            });
          } else {
            // Only worker/horse/client changed — update in-place
            for (const ws of associatedWeekly) {
              const wsUpdates = {};
              if (workerChanged) wsUpdates.workerId = resolvedInstructorId;
              const clientName = clients.find(c => c.id === resolvedClientId)?.name || '';
              const horseName = horses.find(h => h.id === resolvedHorseId)?.name || '';
              wsUpdates.description = `${t('dataContext.trainingLesson')} — ${clientName} (${horseName})`;
              await updateDoc(doc(db, 'weeklySchedules', ws.id), wsUpdates);
            }
          }
        } catch (weeklyErr) {
          console.warn('Could not sync weeklySchedules for lesson update:', weeklyErr);
        }
      }

      // If date or time changed, reschedule reminders
      if (dateChanged || timeChanged) {
        const updatedLesson = { ...currentLesson, ...updates, id };
        const client = clients.find(c => c.id === updatedLesson.clientId);

        if (client) {
          await lessonReminderService.rescheduleLessonReminders(id, updatedLesson, client);

          // Send notification about lesson update
          const changeDescription = dateChanged && timeChanged
            ? t('dataContext.dateTimeChangedTo', { date: updates.date, time: updates.time })
            : dateChanged
            ? t('dataContext.dateChangedTo', { date: updates.date })
            : t('dataContext.timeChangedTo', { time: updates.time });

          await notificationService.sendLessonUpdatedNotification(updatedLesson, client, changeDescription);
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating lesson:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Confirm a lesson as completed by the worker.
   * Updates lesson status, marks mission as completed, and increments client lesson count.
   */
  const confirmLesson = async (lessonId) => {
    try {
      const lesson = lessons.find(l => l.id === lessonId);
      if (!lesson) {
        return { success: false, error: t('dataContext.lessonNotFound') };
      }

      if (lesson.confirmed) {
        return { success: false, error: t('dataContext.lessonAlreadyConfirmed') };
      }

      // Update lesson status
      await updateDoc(doc(db, 'lessons', lessonId), {
        confirmed: true,
        status: 'completed',
        completedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Mark associated mission as completed
      const associatedMissions = missions.filter(m => m.lessonId === lessonId);
      for (const mission of associatedMissions) {
        await updateDoc(doc(db, 'missions', mission.id), {
          completed: true,
          completedAt: serverTimestamp()
        });
      }

      // Increment client lesson count and handle subscription
      const client = clients.find(c => c.id === lesson.clientId);
      if (client) {
        const newLessonCount = (client.lessonCount || 0) + 1;
        const updateData = {
          lessonCount: newLessonCount,
          lastLessonDate: lesson.date,
          updatedAt: serverTimestamp()
        };

        // Handle subscription deduction if client has active subscription
        if (client.hasSubscription && client.subscriptionLessons > 0) {
          const newSubscriptionBalance = client.subscriptionLessons - 1;
          updateData.subscriptionLessons = newSubscriptionBalance;
          updateData.subscriptionUsedLessons = (client.subscriptionUsedLessons || 0) + 1;

          // If subscription is depleted, optionally mark it as inactive
          if (newSubscriptionBalance === 0) {
            updateData.subscriptionActive = false;
          }

          // Send notification if subscription is running low (3 or fewer lessons)
          if (newSubscriptionBalance > 0 && newSubscriptionBalance <= 3 && client.subscriptionActive) {
            const clientWithUpdates = { ...client, ...updateData };
            await notificationService.sendSubscriptionExpiringNotification(clientWithUpdates, newSubscriptionBalance);
          }
        }

        await updateDoc(doc(db, 'clients', lesson.clientId), updateData);

        // Send confirmation notification
        await notificationService.sendLessonConfirmedNotification(lesson, client);
      }

      return { success: true };
    } catch (error) {
      console.error('Error confirming lesson:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Cancel a lesson.
   * Updates lesson status without incrementing client count.
   */
  const cancelLesson = async (lessonId, reason = '') => {
    try {
      const lesson = lessons.find(l => l.id === lessonId);
      if (!lesson) {
        return { success: false, error: t('dataContext.lessonNotFound') };
      }

      // 1. Update the lesson status to cancelled
      await updateDoc(doc(db, 'lessons', lessonId), {
        status: 'cancelled',
        confirmed: false,
        cancelReason: reason,
        cancelledAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // 2. Remove associated missions using Firestore query (more reliable than in-memory)
      try {
        const missionsQuery = query(collection(db, 'missions'), where('lessonId', '==', lessonId));
        const missionsSnap = await getDocs(missionsQuery);
        for (const missionDoc of missionsSnap.docs) {
          await deleteDoc(doc(db, 'missions', missionDoc.id));
        }
      } catch (missionErr) {
        console.warn('Could not clean missions on cancel:', missionErr);
      }

      // 3. Remove associated schedule entries using Firestore query
      try {
        const schedulesQuery = query(collection(db, 'schedules'), where('lessonId', '==', lessonId));
        const schedulesSnap = await getDocs(schedulesQuery);
        for (const schedDoc of schedulesSnap.docs) {
          await deleteDoc(doc(db, 'schedules', schedDoc.id));
        }
      } catch (schedErr) {
        console.warn('Could not clean schedules on cancel:', schedErr);
      }

      // 4. Remove associated weeklySchedules entries using Firestore query
      try {
        const weeklyQuery = query(collection(db, 'weeklySchedules'), where('lessonId', '==', lessonId));
        const weeklySnap = await getDocs(weeklyQuery);
        for (const wsDoc of weeklySnap.docs) {
          await deleteDoc(doc(db, 'weeklySchedules', wsDoc.id));
        }
      } catch (weeklyErr) {
        console.warn('Could not clean weeklySchedules on cancel:', weeklyErr);
      }

      // 5. If lesson was already confirmed, restore the subscription credit
      if (lesson.confirmed || lesson.status === 'completed') {
        const client = clients.find(c => c.id === lesson.clientId);
        if (client) {
          const updateData = {
            lessonCount: Math.max((client.lessonCount || 1) - 1, 0),
            updatedAt: serverTimestamp()
          };
          // Restore subscription lesson if client has a subscription
          if (client.hasSubscription) {
            updateData.subscriptionLessons = (client.subscriptionLessons || 0) + 1;
            updateData.subscriptionUsedLessons = Math.max((client.subscriptionUsedLessons || 1) - 1, 0);
            if (!client.subscriptionActive && updateData.subscriptionLessons > 0) {
              updateData.subscriptionActive = true;
            }
          }
          await updateDoc(doc(db, 'clients', lesson.clientId), updateData);
        }
      }

      // 6. Cancel lesson reminder notifications
      await lessonReminderService.cancelLessonReminders(lessonId);

      // 7. Send cancellation notification to the client
      const client = clients.find(c => c.id === lesson.clientId);
      if (client) {
        await notificationService.sendLessonCancelledNotification(lesson, client, reason);
      }

      return { success: true };
    } catch (error) {
      console.error('Error cancelling lesson:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Remove a lesson.
   * Also removes associated schedule entries, missions, and cancels reminder notifications.
   */
  const removeLesson = async (id) => {
    try {
      // Cancel lesson reminder notifications
      await lessonReminderService.cancelLessonReminders(id);

      // Remove the lesson
      await deleteDoc(doc(db, 'lessons', id));

      // Remove associated schedules using Firestore query
      try {
        const schedulesQuery = query(collection(db, 'schedules'), where('lessonId', '==', id));
        const schedulesSnap = await getDocs(schedulesQuery);
        for (const schedDoc of schedulesSnap.docs) {
          await deleteDoc(doc(db, 'schedules', schedDoc.id));
        }
      } catch (schedErr) {
        console.warn('Could not clean schedules on remove:', schedErr);
      }

      // Remove associated missions using Firestore query
      try {
        const missionsQuery = query(collection(db, 'missions'), where('lessonId', '==', id));
        const missionsSnap = await getDocs(missionsQuery);
        for (const missionDoc of missionsSnap.docs) {
          await deleteDoc(doc(db, 'missions', missionDoc.id));
        }
      } catch (missionErr) {
        console.warn('Could not clean missions on remove:', missionErr);
      }

      // Remove associated weeklySchedules using Firestore query
      try {
        const weeklyQuery = query(collection(db, 'weeklySchedules'), where('lessonId', '==', id));
        const weeklySnap = await getDocs(weeklyQuery);
        for (const wsDoc of weeklySnap.docs) {
          await deleteDoc(doc(db, 'weeklySchedules', wsDoc.id));
        }
      } catch (weeklyErr) {
        console.warn('Could not clean weeklySchedules on remove:', weeklyErr);
      }

      return { success: true };
    } catch (error) {
      console.error('Error removing lesson:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Add a new reminder for a horse.
   * Schedules 2 notifications: 2 days before and at 8 AM on the reminder date.
   */
  const addReminder = async (reminder) => {
    try {
      const reminderRef = await addDoc(collection(db, 'reminders'), {
        ...reminder,
        createdAt: serverTimestamp()
      });

      const reminderWithId = { ...reminder, id: reminderRef.id };
      const reminderDate = new Date(reminder.date);
      const now = new Date();

      // Get horse name for notifications
      const horse = horses.find(h => h.id === reminder.horseId);
      const horseName = horse?.name || t('notifications.theHorse');
      const description = reminder.description || t('notifications.reminder');

      // Schedule notification 2 days before at the same time as reminder
      const twoDaysBefore = new Date(reminderDate);
      twoDaysBefore.setDate(twoDaysBefore.getDate() - 2);

      if (reminder.time) {
        const [hours, minutes] = reminder.time.split(':');
        twoDaysBefore.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      } else {
        twoDaysBefore.setHours(8, 0, 0, 0); // Default to 8 AM if no time specified
      }

      // Only schedule 2-day-before notification if it's in the future
      if (twoDaysBefore > now) {
        await notificationService.scheduleNotification(
          t('dataContext.advanceReminder'),
          t('dataContext.advanceReminderBody', { name: horseName, desc: description }),
          twoDaysBefore,
          {
            type: 'reminder_advance',
            reminderId: reminderRef.id,
            horseId: reminder.horseId,
            horseName: horseName,
            daysUntil: 2,
            channelId: 'default',
          },
          `reminder_2days_${reminderRef.id}`
        );
        console.log(`Scheduled 2-day advance reminder for ${horseName} at ${twoDaysBefore.toISOString()}`);
      }

      // Schedule notification at 8 AM on the reminder date
      const reminderDay8AM = new Date(reminderDate);
      reminderDay8AM.setHours(8, 0, 0, 0);

      // Only schedule same-day notification if it's in the future
      if (reminderDay8AM > now) {
        await notificationService.scheduleNotification(
          t('dataContext.todayReminder'),
          t('dataContext.todayReminderBody', { name: horseName, desc: description }),
          reminderDay8AM,
          {
            type: 'reminder_today',
            reminderId: reminderRef.id,
            horseId: reminder.horseId,
            horseName: horseName,
            channelId: 'default',
          },
          `reminder_today_${reminderRef.id}`
        );
        console.log(`Scheduled same-day reminder for ${horseName} at ${reminderDay8AM.toISOString()}`);
      }

      return { success: true, id: reminderRef.id };
    } catch (error) {
      console.error('Error adding reminder:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Update an existing reminder.
   * Reschedules notifications if date changes.
   */
  const updateReminder = async (id, updates) => {
    try {
      const currentReminder = reminders.find(r => r.id === id);

      await updateDoc(doc(db, 'reminders', id), {
        ...updates,
        updatedAt: serverTimestamp()
      });

      // If date changed, reschedule notifications
      if (updates.date && currentReminder && updates.date !== currentReminder.date) {
        // Cancel old notifications
        await notificationService.cancelNotification(`reminder_2days_${id}`);
        await notificationService.cancelNotification(`reminder_today_${id}`);

        // Schedule new notifications with updated date
        const updatedReminder = { ...currentReminder, ...updates, id };
        const reminderDate = new Date(updates.date);
        const now = new Date();

        const horse = horses.find(h => h.id === updatedReminder.horseId);
        const horseName = horse?.name || t('notifications.theHorse');
        const description = updatedReminder.description || t('notifications.reminder');

        // Schedule 2 days before
        const twoDaysBefore = new Date(reminderDate);
        twoDaysBefore.setDate(twoDaysBefore.getDate() - 2);

        if (updatedReminder.time) {
          const [hours, minutes] = updatedReminder.time.split(':');
          twoDaysBefore.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        } else {
          twoDaysBefore.setHours(8, 0, 0, 0);
        }

        if (twoDaysBefore > now) {
          await notificationService.scheduleNotification(
            t('dataContext.advanceReminder'),
            t('dataContext.advanceReminderBody', { name: horseName, desc: description }),
            twoDaysBefore,
            {
              type: 'reminder_advance',
              reminderId: id,
              horseId: updatedReminder.horseId,
              horseName: horseName,
              daysUntil: 2,
              channelId: 'default',
            },
            `reminder_2days_${id}`
          );
        }

        // Schedule at 8 AM on reminder date
        const reminderDay8AM = new Date(reminderDate);
        reminderDay8AM.setHours(8, 0, 0, 0);

        if (reminderDay8AM > now) {
          await notificationService.scheduleNotification(
            t('dataContext.todayReminder'),
            t('dataContext.todayReminderBody', { name: horseName, desc: description }),
            reminderDay8AM,
            {
              type: 'reminder_today',
              reminderId: id,
              horseId: updatedReminder.horseId,
              horseName: horseName,
              channelId: 'default',
            },
            `reminder_today_${id}`
          );
        }

        console.log(`Rescheduled notifications for reminder ${id}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating reminder:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Remove a reminder.
   * Also cancels scheduled notifications (2-day advance and same-day).
   */
  const removeReminder = async (id) => {
    try {
      // Cancel both scheduled notifications for this reminder
      await notificationService.cancelNotification(`reminder_2days_${id}`);
      await notificationService.cancelNotification(`reminder_today_${id}`);

      await deleteDoc(doc(db, 'reminders', id));

      console.log(`Removed reminder ${id} and cancelled notifications`);
      return { success: true };
    } catch (error) {
      console.error('Error removing reminder:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Add a new schedule entry.
   * Automatically creates a mission for the assigned worker.
   */
  const addSchedule = async (schedule) => {
    try {
      const scheduleRef = await addDoc(collection(db, 'schedules'), {
        ...schedule,
        createdAt: serverTimestamp()
      });

      // Automatically create a mission for the worker
      const missionRef = await addDoc(collection(db, 'missions'), {
        workerId: schedule.workerId,
        title: schedule.description || t('dataContext.workTask'),
        description: t('dataContext.scheduledAt', { time: schedule.timeSlot }),
        dueDate: schedule.date,
        time: schedule.timeSlot,
        scheduleId: scheduleRef.id,
        type: 'schedule',
        priority: 'medium',
        completed: false,
        createdAt: serverTimestamp()
      });

      // Send notification to worker about new schedule/mission
      if (schedule.workerId) {
        const worker = workerUsers.find(w => w.id === schedule.workerId) ||
                       workers.find(w => w.id === schedule.workerId);
        if (worker) {
          const missionData = {
            id: missionRef.id,
            workerId: schedule.workerId,
            title: schedule.description || t('dataContext.workTask'),
            description: t('dataContext.scheduledAt', { time: schedule.timeSlot }),
            dueDate: schedule.date,
            time: schedule.timeSlot,
          };
          await notificationService.sendMissionAssignedNotification(missionData, worker);
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Error adding schedule:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Update an existing schedule.
   */
  const updateSchedule = async (id, updates) => {
    try {
      await updateDoc(doc(db, 'schedules', id), {
        ...updates,
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating schedule:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Remove a schedule entry.
   */
  const removeSchedule = async (id) => {
    try {
      await deleteDoc(doc(db, 'schedules', id));

      // Remove associated missions
      const associatedMissions = missions.filter(m => m.scheduleId === id);
      for (const mission of associatedMissions) {
        await deleteDoc(doc(db, 'missions', mission.id));
      }

      return { success: true };
    } catch (error) {
      console.error('Error removing schedule:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Remove a horse from the stable.
   * Prevents deletion if horse has scheduled or upcoming lessons.
   */
  const removeHorse = async (id) => {
    try {
      // Check if horse has any upcoming or scheduled lessons
      const now = new Date();
      const horseLessons = lessons.filter(lesson => {
        if (lesson.horseId !== id) return false;

        // Check if lesson is in the future or not completed
        const lessonDate = new Date(`${lesson.date}T${lesson.time || '00:00'}`);
        return lessonDate >= now || lesson.status === 'scheduled';
      });

      if (horseLessons.length > 0) {
        return {
          success: false,
          error: t('dataContext.cannotDeleteHorse', { count: horseLessons.length })
        };
      }

      await deleteDoc(doc(db, 'horses', id));
      return { success: true };
    } catch (error) {
      console.error('Error removing horse:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Remove a client.
   * Prevents deletion if client has scheduled or upcoming lessons.
   */
  const removeClient = async (id) => {
    try {
      // Check if client has any upcoming or scheduled lessons
      const now = new Date();
      const clientLessons = lessons.filter(lesson => {
        if (lesson.clientId !== id) return false;

        // Check if lesson is in the future or not completed
        const lessonDate = new Date(`${lesson.date}T${lesson.time || '00:00'}`);
        return lessonDate >= now || lesson.status === 'scheduled';
      });

      if (clientLessons.length > 0) {
        return {
          success: false,
          error: t('dataContext.cannotDeleteClient', { count: clientLessons.length })
        };
      }

      await deleteDoc(doc(db, 'clients', id));

      // Also try to remove from users collection if exists
      try {
        await deleteDoc(doc(db, 'users', id));
      } catch (userError) {
        // User might not exist in users collection, that's okay
        console.log('User document not found or already deleted');
      }

      return { success: true };
    } catch (error) {
      console.error('Error removing client:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Remove a worker.
   * Prevents deletion if worker has scheduled or upcoming lessons.
   */
  const removeWorker = async (id) => {
    try {
      // Check if worker has any upcoming or scheduled lessons
      const now = new Date();
      const workerLessons = lessons.filter(lesson => {
        if (lesson.instructorId !== id) return false;

        // Check if lesson is in the future or not completed
        const lessonDate = new Date(`${lesson.date}T${lesson.time || '00:00'}`);
        return lessonDate >= now || lesson.status === 'scheduled';
      });

      if (workerLessons.length > 0) {
        return {
          success: false,
          error: t('dataContext.cannotDeleteWorker', { count: workerLessons.length })
        };
      }

      // Check if worker has upcoming schedules
      const workerSchedules = schedules.filter(schedule => {
        if (schedule.workerId !== id) return false;
        const scheduleDate = new Date(schedule.date);
        return scheduleDate >= now;
      });

      if (workerSchedules.length > 0) {
        return {
          success: false,
          error: t('dataContext.workerHasSchedules', { count: workerSchedules.length })
        };
      }

      await deleteDoc(doc(db, 'workers', id));

      // Also try to remove from users collection if exists
      try {
        await deleteDoc(doc(db, 'users', id));
      } catch (userError) {
        // User might not exist in users collection, that's okay
        console.log('User document not found or already deleted');
      }

      return { success: true };
    } catch (error) {
      console.error('Error removing worker:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Add a new mission manually.
   */
  const addMission = async (mission) => {
    try {
      const missionRef = await addDoc(collection(db, 'missions'), {
        ...mission,
        createdAt: serverTimestamp()
      });

      // Send notification to worker about new mission
      if (mission.workerId) {
        const worker = workerUsers.find(w => w.id === mission.workerId) ||
                       workers.find(w => w.id === mission.workerId);
        if (worker) {
          const missionWithId = { ...mission, id: missionRef.id };
          await notificationService.sendMissionAssignedNotification(missionWithId, worker);
        }
      }

      return { success: true, id: missionRef.id };
    } catch (error) {
      console.error('Error adding mission:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Update a mission (e.g., mark as completed).
   */
  const updateMission = async (id, updates) => {
    try {
      const currentMission = missions.find(m => m.id === id);

      await updateDoc(doc(db, 'missions', id), {
        ...updates,
        updatedAt: serverTimestamp()
      });

      // Send notification when mission is marked as completed
      if (updates.completed === true && currentMission && !currentMission.completed) {
        if (currentMission.workerId) {
          const worker = workerUsers.find(w => w.id === currentMission.workerId) ||
                         workers.find(w => w.id === currentMission.workerId);
          if (worker) {
            const updatedMission = { ...currentMission, ...updates, id };
            await notificationService.sendMissionCompletedNotification(updatedMission, worker);
          }
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating mission:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Remove a mission.
   */
  const removeMission = async (id) => {
    try {
      await deleteDoc(doc(db, 'missions', id));
      return { success: true };
    } catch (error) {
      console.error('Error removing mission:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Add a weekly schedule entry.
   */
  const addWeeklySchedule = async (schedule) => {
    try {
      await addDoc(collection(db, 'weeklySchedules'), {
        ...schedule,
        createdAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Error adding weekly schedule:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Update a weekly schedule entry.
   */
  const updateWeeklySchedule = async (id, updates) => {
    try {
      await updateDoc(doc(db, 'weeklySchedules', id), {
        ...updates,
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating weekly schedule:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Remove a weekly schedule entry.
   */
  const removeWeeklySchedule = async (id) => {
    try {
      await deleteDoc(doc(db, 'weeklySchedules', id));
      return { success: true };
    } catch (error) {
      console.error('Error removing weekly schedule:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Automatically generate schedule for a new week based on the previous week.
   * This function is idempotent - it won't create duplicates if called multiple times.
   * @param {string} weekId - The week ID (e.g., "2025-W42")
   * @param {string} weekStart - The ISO date string for the week start (e.g., "2025-10-18")
   * @returns {Promise<{success: boolean, message?: string, error?: string, count?: number}>}
   */
  const autoGenerateWeekSchedule = async (weekId, weekStart) => {
    try {
      // Check if this week already has schedules (prevent duplicates)
      const existingSchedules = weeklySchedules?.filter(s => s.weekId === weekId) || [];
      if (existingSchedules.length > 0) {
        return { success: true, message: 'Schedule already exists', count: existingSchedules.length };
      }

      // Calculate previous week
      const currentWeekDate = new Date(weekStart);
      const previousWeekDate = new Date(currentWeekDate);
      previousWeekDate.setDate(previousWeekDate.getDate() - 7);
      const previousWeekStart = previousWeekDate.toISOString().split('T')[0];

      // Calculate previous week ID
      const previousWeekNum = getWeekNumberFromDate(previousWeekDate);
      const previousYear = previousWeekDate.getFullYear();
      const previousWeekId = `${previousYear}-W${String(previousWeekNum).padStart(2, '0')}`;

      // Get previous week's schedules
      const previousWeekSchedules = weeklySchedules?.filter(s => s.weekId === previousWeekId) || [];

      if (previousWeekSchedules.length === 0) {
        return { success: true, message: 'No previous week to copy from', count: 0 };
      }

      // Copy schedules from previous week to new week with updated dates
      let copiedCount = 0;
      const batch = writeBatch(db);

      for (const schedule of previousWeekSchedules) {
        const newScheduleRef = doc(collection(db, 'weeklySchedules'));
        batch.set(newScheduleRef, {
          weekId,
          weekStart,
          day: schedule.day,
          timeSlot: schedule.timeSlot,
          workerId: schedule.workerId,
          description: schedule.description,
          autoGenerated: true,
          generatedFrom: previousWeekId,
          createdAt: serverTimestamp()
        });
        copiedCount++;
      }

      await batch.commit();
      return { success: true, message: 'Schedule generated from previous week', count: copiedCount };
    } catch (error) {
      console.error('Error auto-generating week schedule:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Helper function to calculate week number from date
   */
  const getWeekNumberFromDate = (date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  };

  /**
   * Update a weekly schedule with option to apply to future weeks
   * @param {string} id - Schedule ID to update
   * @param {object} updates - Updates to apply
   * @param {boolean} applyToFuture - Whether to apply changes to this and all future weeks
   */
  const updateWeeklyScheduleWithFuture = async (id, updates, applyToFuture = false) => {
    try {
      // Find the schedule being updated
      const scheduleToUpdate = weeklySchedules?.find(s => s.id === id);
      if (!scheduleToUpdate) {
        return { success: false, error: 'Schedule not found' };
      }

      // Update current schedule
      await updateDoc(doc(db, 'weeklySchedules', id), {
        ...updates,
        updatedAt: serverTimestamp()
      });

      if (applyToFuture) {
        // Find all future weeks with matching day/timeSlot/workerId
        const currentWeekDate = new Date(scheduleToUpdate.weekStart);
        const futureSchedules = weeklySchedules?.filter(s => {
          const scheduleDate = new Date(s.weekStart);
          return scheduleDate > currentWeekDate &&
                 s.day === scheduleToUpdate.day &&
                 s.timeSlot === scheduleToUpdate.timeSlot &&
                 s.workerId === scheduleToUpdate.workerId;
        }) || [];

        // Update all future matching schedules
        const batch = writeBatch(db);
        for (const futureSchedule of futureSchedules) {
          const scheduleRef = doc(db, 'weeklySchedules', futureSchedule.id);
          batch.update(scheduleRef, {
            ...updates,
            updatedAt: serverTimestamp()
          });
        }
        await batch.commit();

        return { success: true, message: `Updated ${futureSchedules.length + 1} schedules` };
      }

      return { success: true, message: 'Schedule updated' };
    } catch (error) {
      console.error('Error updating weekly schedule:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Create default weekly schedule template for a specific week.
   * This can be customized based on stable's needs.
   */
  const createDefaultWeekSchedule = async (weekId, weekStart) => {
    try {
      // Check if there are any workers
      if (!workerUsers || workerUsers.length === 0) {
        return { success: false, error: t('dataContext.noWorkersForSchedule') };
      }

      // Define default schedule template
      // Morning shift: 8 AM - 2 PM, Evening shift: 3 PM - 11 PM
      const daysOfWeek = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
      const morningShifts = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00'];
      const eveningShifts = ['15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'];

      // Rotate workers across days
      let workerIndex = 0;

      for (const day of daysOfWeek) {
        // Morning shift - assign first available worker
        if (workerUsers[workerIndex % workerUsers.length]) {
          const worker = workerUsers[workerIndex % workerUsers.length];
          for (const timeSlot of morningShifts) {
            await addDoc(collection(db, 'weeklySchedules'), {
              weekId,
              weekStart,
              day,
              timeSlot,
              workerId: worker.id,
              description: t('dataContext.morningCare'),
              isDefault: true,
              createdAt: serverTimestamp()
            });
          }
          workerIndex++;
        }

        // Evening shift - assign next available worker
        if (workerUsers[workerIndex % workerUsers.length]) {
          const worker = workerUsers[workerIndex % workerUsers.length];
          for (const timeSlot of eveningShifts) {
            await addDoc(collection(db, 'weeklySchedules'), {
              weekId,
              weekStart,
              day,
              timeSlot,
              workerId: worker.id,
              description: t('dataContext.eveningCare'),
              isDefault: true,
              createdAt: serverTimestamp()
            });
          }
          workerIndex++;
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Error creating default week schedule:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Save current date schedule as default template for daily schedules
   */
  const saveScheduleAsDefault = async (date) => {
    try {
      const dateSchedules = schedules.filter(s => s.date === date);

      if (dateSchedules.length === 0) {
        return { success: false, error: t('dataContext.noSchedulesToSave') };
      }

      // Save to a default template collection
      for (const schedule of dateSchedules) {
        await addDoc(collection(db, 'defaultScheduleTemplate'), {
          timeSlot: schedule.timeSlot,
          workerId: schedule.workerId,
          description: schedule.description,
          createdAt: serverTimestamp()
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Error saving schedule as default:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Load default schedule template for a specific date
   */
  const loadDefaultSchedule = async (date) => {
    try {
      const q = query(collection(db, 'defaultScheduleTemplate'));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return { success: false, error: t('dataContext.noDefaultSchedule') };
      }

      const templates = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Apply templates to the specified date
      for (const template of templates) {
        await addDoc(collection(db, 'schedules'), {
          date,
          timeSlot: template.timeSlot,
          workerId: template.workerId,
          description: template.description,
          fromDefault: true,
          createdAt: serverTimestamp()
        });

        // Create mission for the worker
        await addDoc(collection(db, 'missions'), {
          workerId: template.workerId,
          title: template.description || t('dataContext.workTask'),
          description: t('dataContext.scheduledAt', { time: template.timeSlot }),
          dueDate: date,
          time: template.timeSlot,
          type: 'schedule',
          priority: 'medium',
          completed: false,
          createdAt: serverTimestamp()
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Error loading default schedule:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Clear all schedules for a specific date
   * OPTIMIZED VERSION: Uses Firebase writeBatch() for atomic bulk deletes
   * Handles 600+ deletions in under 5 seconds
   */
  const clearScheduleForDate = async (date, onProgress = null) => {
    try {
      const startTime = Date.now();

      // Filter schedules and build deletion map
      const dateSchedules = schedules.filter(s => s.date === date);

      if (dateSchedules.length === 0) {
        return { success: false, error: t('dataContext.noSchedulesToDelete') };
      }

      // Build a map of scheduleId -> missions for O(1) lookup instead of O(n²)
      const scheduleIdToMissions = {};
      missions.forEach(mission => {
        if (mission.scheduleId) {
          if (!scheduleIdToMissions[mission.scheduleId]) {
            scheduleIdToMissions[mission.scheduleId] = [];
          }
          scheduleIdToMissions[mission.scheduleId].push(mission);
        }
      });

      // Collect all documents to delete
      const docsToDelete = [];
      dateSchedules.forEach(schedule => {
        docsToDelete.push({ type: 'schedules', id: schedule.id });

        // Add associated missions
        const associatedMissions = scheduleIdToMissions[schedule.id] || [];
        associatedMissions.forEach(mission => {
          docsToDelete.push({ type: 'missions', id: mission.id });
        });
      });

      const totalDocs = docsToDelete.length;
      console.log(`Clearing ${totalDocs} documents for date ${date}`);

      // Firebase writeBatch supports max 500 operations per batch
      const BATCH_SIZE = 500;
      const batches = [];

      for (let i = 0; i < docsToDelete.length; i += BATCH_SIZE) {
        const chunk = docsToDelete.slice(i, i + BATCH_SIZE);
        const batch = writeBatch(db);

        chunk.forEach(({ type, id }) => {
          const docRef = doc(db, type, id);
          batch.delete(docRef);
        });

        batches.push(batch);
      }

      // Execute all batches in parallel for maximum speed
      let completedBatches = 0;
      await Promise.all(
        batches.map(async (batch) => {
          await batch.commit();
          completedBatches++;
          if (onProgress) {
            onProgress({
              completed: completedBatches,
              total: batches.length,
              percentage: Math.round((completedBatches / batches.length) * 100)
            });
          }
        })
      );

      const duration = Date.now() - startTime;
      console.log(`✅ Cleared ${totalDocs} documents in ${duration}ms (${(totalDocs / (duration / 1000)).toFixed(0)} docs/sec)`);

      return {
        success: true,
        count: dateSchedules.length,
        totalDeleted: totalDocs,
        duration,
        docsPerSecond: Math.round(totalDocs / (duration / 1000))
      };
    } catch (error) {
      console.error('Error clearing schedule:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * ALTERNATIVE: Ultra-fast parallel deletion using Promise.all()
   * Slightly faster than writeBatch but not atomic
   * Use this if you don't need transaction guarantees
   */
  const clearScheduleForDateParallel = async (date, onProgress = null) => {
    try {
      const startTime = Date.now();

      const dateSchedules = schedules.filter(s => s.date === date);

      if (dateSchedules.length === 0) {
        return { success: false, error: t('dataContext.noSchedulesToDelete') };
      }

      // Build deletion map
      const scheduleIdToMissions = {};
      missions.forEach(mission => {
        if (mission.scheduleId) {
          if (!scheduleIdToMissions[mission.scheduleId]) {
            scheduleIdToMissions[mission.scheduleId] = [];
          }
          scheduleIdToMissions[mission.scheduleId].push(mission);
        }
      });

      // Collect all delete promises
      const deletePromises = [];
      let totalDocs = 0;

      dateSchedules.forEach(schedule => {
        deletePromises.push(deleteDoc(doc(db, 'schedules', schedule.id)));
        totalDocs++;

        const associatedMissions = scheduleIdToMissions[schedule.id] || [];
        associatedMissions.forEach(mission => {
          deletePromises.push(deleteDoc(doc(db, 'missions', mission.id)));
          totalDocs++;
        });
      });

      console.log(`Deleting ${totalDocs} documents in parallel...`);

      // Execute ALL deletes in parallel
      if (onProgress) {
        let completed = 0;
        await Promise.all(
          deletePromises.map(promise =>
            promise.then(() => {
              completed++;
              if (completed % 50 === 0 || completed === totalDocs) {
                onProgress({
                  completed,
                  total: totalDocs,
                  percentage: Math.round((completed / totalDocs) * 100)
                });
              }
            })
          )
        );
      } else {
        await Promise.all(deletePromises);
      }

      const duration = Date.now() - startTime;
      console.log(`✅ Cleared ${totalDocs} documents in ${duration}ms (${(totalDocs / (duration / 1000)).toFixed(0)} docs/sec)`);

      return {
        success: true,
        count: dateSchedules.length,
        totalDeleted: totalDocs,
        duration,
        docsPerSecond: Math.round(totalDocs / (duration / 1000))
      };
    } catch (error) {
      console.error('Error clearing schedule:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Bulk delete missions by IDs - optimized with batching
   */
  const bulkDeleteMissions = async (missionIds, onProgress = null) => {
    try {
      if (!missionIds || missionIds.length === 0) {
        return { success: false, error: 'No missions to delete' };
      }

      const startTime = Date.now();
      const BATCH_SIZE = 500;
      const batches = [];

      for (let i = 0; i < missionIds.length; i += BATCH_SIZE) {
        const chunk = missionIds.slice(i, i + BATCH_SIZE);
        const batch = writeBatch(db);

        chunk.forEach(id => {
          const docRef = doc(db, 'missions', id);
          batch.delete(docRef);
        });

        batches.push(batch);
      }

      let completedBatches = 0;
      await Promise.all(
        batches.map(async (batch) => {
          await batch.commit();
          completedBatches++;
          if (onProgress) {
            onProgress({
              completed: completedBatches,
              total: batches.length,
              percentage: Math.round((completedBatches / batches.length) * 100)
            });
          }
        })
      );

      const duration = Date.now() - startTime;

      return {
        success: true,
        deleted: missionIds.length,
        duration,
        docsPerSecond: Math.round(missionIds.length / (duration / 1000))
      };
    } catch (error) {
      console.error('Error bulk deleting missions:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Add a new announcement
   */
  const addAnnouncement = async (announcement) => {
    try {
      const docRef = await addDoc(collection(db, 'announcements'), {
        ...announcement,
        createdAt: serverTimestamp(),
        notificationSentAt: null,
      });

      // Send notification if status is published and sendNotification is true
      if (announcement.status === 'published' && announcement.sendNotification !== false) {
        const announcementWithId = { ...announcement, id: docRef.id };

        // If scheduled for future, schedule notification
        if (announcement.scheduledDate && new Date(announcement.scheduledDate) > new Date()) {
          await notificationService.scheduleAnnouncementNotification(
            announcementWithId,
            announcement.scheduledDate
          );
        } else {
          // Send immediately
          const result = await notificationService.sendAnnouncementNotification(announcementWithId, true);

          // Update announcement with notification status
          await updateDoc(doc(db, 'announcements', docRef.id), {
            notificationSentAt: serverTimestamp(),
            notificationSentCount: result.sent || 0,
            notificationSkippedCount: result.skipped || 0,
          });
        }
      }

      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error adding announcement:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Update an existing announcement
   */
  const updateAnnouncement = async (id, updates) => {
    try {
      // Get the current announcement to check status change
      const currentAnnouncement = announcements.find(a => a.id === id);
      const wasPublished = currentAnnouncement?.status === 'published';
      const isNowPublished = updates.status === 'published';

      await updateDoc(doc(db, 'announcements', id), {
        ...updates,
        updatedAt: serverTimestamp()
      });

      // Send notification if:
      // 1. Status changed from draft/scheduled to published
      // 2. sendNotification is not false
      // 3. Not already sent
      if (!wasPublished && isNowPublished && updates.sendNotification !== false && !currentAnnouncement?.notificationSentAt) {
        const announcementData = { ...currentAnnouncement, ...updates, id };

        // If scheduled for future, schedule notification
        if (updates.scheduledDate && new Date(updates.scheduledDate) > new Date()) {
          await notificationService.scheduleAnnouncementNotification(
            announcementData,
            updates.scheduledDate
          );
        } else {
          // Send immediately
          const result = await notificationService.sendAnnouncementNotification(announcementData, true);

          // Update announcement with notification status
          await updateDoc(doc(db, 'announcements', id), {
            notificationSentAt: serverTimestamp(),
            notificationSentCount: result.sent || 0,
            notificationSkippedCount: result.skipped || 0,
          });
        }
      }

      // Cancel scheduled notification if unpublished or expired
      if (wasPublished && !isNowPublished) {
        await notificationService.cancelScheduledNotification(id);
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating announcement:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Delete an announcement
   */
  const deleteAnnouncement = async (id) => {
    try {
      // Cancel any scheduled notifications
      await notificationService.cancelScheduledNotification(id);

      await deleteDoc(doc(db, 'announcements', id));
      return { success: true };
    } catch (error) {
      console.error('Error deleting announcement:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Manually trigger lesson cleanup
   * Removes expired unconfirmed lessons that are 24+ hours past their scheduled time
   * @param {boolean} dryRun - If true, only reports what would be deleted
   * @returns {Promise<Object>} Cleanup result
   */
  const cleanupExpiredLessons = async (dryRun = false) => {
    try {
      return await lessonCleanupService.performCleanup(lessons, schedules, missions, dryRun);
    } catch (error) {
      console.error('Error during manual cleanup:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Get cleanup statistics and status
   * @returns {Object} Cleanup stats
   */
  const getCleanupStats = () => {
    return lessonCleanupService.getCleanupStats(lessons);
  };

  /**
   * Get only confirmed/completed lessons for a client
   * This is what should be counted toward client statistics
   * @param {string} clientId - Client ID
   * @returns {Array} Confirmed lessons only
   */
  const getConfirmedLessons = (clientId) => {
    return lessons.filter(l =>
      l.clientId === clientId &&
      l.status !== 'cancelled' &&
      (l.confirmed === true || l.status === 'completed')
    );
  };

  /**
   * Get count of confirmed lessons for a client
   * @param {string} clientId - Client ID
   * @returns {number} Count of confirmed lessons
   */
  const getConfirmedLessonCount = (clientId) => {
    return getConfirmedLessons(clientId).length;
  };

  /**
   * Get all scheduled (unconfirmed) lessons for a client
   * These are lessons that haven't been confirmed yet
   * @param {string} clientId - Client ID
   * @returns {Array} Scheduled lessons
   */
  const getScheduledLessons = (clientId) => {
    return lessons.filter(l =>
      l.clientId === clientId &&
      l.status === 'scheduled' &&
      !l.confirmed
    );
  };

  /**
   * Get all cancelled lessons for a client
   * @param {string} clientId - Client ID
   * @returns {Array} Cancelled lessons
   */
  const getCancelledLessons = (clientId) => {
    return lessons.filter(l =>
      l.clientId === clientId &&
      l.status === 'cancelled'
    );
  };

  return (
    <DataContext.Provider
      value={{
        horses,
        addHorse,
        updateHorse,
        removeHorse,
        clients,
        addClient,
        updateClient,
        removeClient,
        workers,
        addWorker,
        removeWorker,
        workerUsers,
        lessons,
        addLesson,
        updateLesson,
        removeLesson,
        confirmLesson,
        cancelLesson,
        reminders,
        addReminder,
        updateReminder,
        removeReminder,
        schedules,
        addSchedule,
        updateSchedule,
        removeSchedule,
        missions,
        addMission,
        updateMission,
        removeMission,
        createUserAccount,
        loading,
        weeklySchedules,
        addWeeklySchedule,
        updateWeeklySchedule,
        removeWeeklySchedule,
        autoGenerateWeekSchedule,
        createDefaultWeekSchedule,
        saveScheduleAsDefault,
        loadDefaultSchedule,
        clearScheduleForDate,
        clearScheduleForDateParallel,
        bulkDeleteMissions,
        announcements,
        addAnnouncement,
        updateAnnouncement,
        deleteAnnouncement,
        // Lesson cleanup functions
        cleanupExpiredLessons,
        getCleanupStats,
        // Confirmed lesson helpers
        getConfirmedLessons,
        getConfirmedLessonCount,
        getScheduledLessons,
        getCancelledLessons,
        // Availability checks
        isWorkerAvailable,
        isHorseAvailable,
        isClientAvailable,
        // Payment history
        paymentHistory,
        addPaymentRecord,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

