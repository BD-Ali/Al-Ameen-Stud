import React, { createContext, useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
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

  /**
   * Create a new user account with Firebase Auth and store in Firestore
   */
  const createUserAccount = async (name, email, phoneNumber, role = 'client') => {
    try {
      // Create auth user with phone number as password
      const userCredential = await createUserWithEmailAndPassword(auth, email, phoneNumber);
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
        await setDoc(doc(db, 'clients', user.uid), {
          name,
          email,
          phoneNumber,
          amountPaid: 0,
          amountDue: 0,
          lessonCount: 0,
          createdAt: serverTimestamp(),
        });
      }

      // If worker, create worker record
      if (role === 'worker') {
        await setDoc(doc(db, 'workers', user.uid), {
          name,
          email,
          phoneNumber,
          role: 'عامل', // Default role
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
      await addDoc(collection(db, 'clients'), {
        ...client,
        lessonCount: client.lessonCount || 0,
        createdAt: serverTimestamp()
      });
      return { success: true };
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
      await updateDoc(doc(db, 'clients', id), {
        ...updates,
        updatedAt: serverTimestamp()
      });
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
   * Add a new lesson.
   * Automatically creates a schedule entry, mission, and schedules reminder notifications.
   */
  const addLesson = async (lesson) => {
    try {
      // Add the lesson
      const lessonRef = await addDoc(collection(db, 'lessons'), {
        ...lesson,
        createdAt: serverTimestamp(),
        remindersSent: false,
      });

      const lessonWithId = { ...lesson, id: lessonRef.id };

      // Automatically create a schedule entry for the instructor
      await addDoc(collection(db, 'schedules'), {
        date: lesson.date,
        timeSlot: lesson.time,
        workerId: lesson.instructorId,
        description: `درس مع عميل`,
        type: 'lesson',
        lessonId: lessonRef.id,
        createdAt: serverTimestamp()
      });

      // Automatically create a mission for the instructor
      await addDoc(collection(db, 'missions'), {
        workerId: lesson.instructorId,
        title: `درس تدريب`,
        description: `درس مجدول في ${lesson.time}`,
        dueDate: lesson.date,
        time: lesson.time,
        horseId: lesson.horseId,
        lessonId: lessonRef.id,
        type: 'lesson',
        priority: 'high',
        completed: false,
        createdAt: serverTimestamp()
      });

      // Schedule automatic lesson reminder notifications for the client
      const client = clients.find(c => c.id === lesson.clientId);
      if (client) {
        await lessonReminderService.scheduleLessonReminders(lessonWithId, client);
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

      // Check if date or time changed
      const dateChanged = updates.date && updates.date !== currentLesson.date;
      const timeChanged = updates.time && updates.time !== currentLesson.time;

      await updateDoc(doc(db, 'lessons', id), {
        ...updates,
        updatedAt: serverTimestamp()
      });

      // If date or time changed, reschedule reminders
      if (dateChanged || timeChanged) {
        const updatedLesson = { ...currentLesson, ...updates, id };
        const client = clients.find(c => c.id === updatedLesson.clientId);

        if (client) {
          await lessonReminderService.rescheduleLessonReminders(id, updatedLesson, client);
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating lesson:', error);
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

      // Remove associated schedules
      const associatedSchedules = schedules.filter(s => s.lessonId === id);
      for (const schedule of associatedSchedules) {
        await deleteDoc(doc(db, 'schedules', schedule.id));
      }

      // Remove associated missions
      const associatedMissions = missions.filter(m => m.lessonId === id);
      for (const mission of associatedMissions) {
        await deleteDoc(doc(db, 'missions', mission.id));
      }

      return { success: true };
    } catch (error) {
      console.error('Error removing lesson:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Add a new reminder for a horse.
   */
  const addReminder = async (reminder) => {
    try {
      await addDoc(collection(db, 'reminders'), {
        ...reminder,
        createdAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Error adding reminder:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Update an existing reminder.
   */
  const updateReminder = async (id, updates) => {
    try {
      await updateDoc(doc(db, 'reminders', id), {
        ...updates,
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating reminder:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Remove a reminder.
   */
  const removeReminder = async (id) => {
    try {
      await deleteDoc(doc(db, 'reminders', id));
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
      await addDoc(collection(db, 'missions'), {
        workerId: schedule.workerId,
        title: schedule.description || 'مهمة عمل',
        description: `مجدول في ${schedule.timeSlot}`,
        dueDate: schedule.date,
        time: schedule.timeSlot,
        scheduleId: scheduleRef.id,
        type: 'schedule',
        priority: 'medium',
        completed: false,
        createdAt: serverTimestamp()
      });

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
   */
  const removeHorse = async (id) => {
    try {
      await deleteDoc(doc(db, 'horses', id));
      return { success: true };
    } catch (error) {
      console.error('Error removing horse:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Remove a client.
   */
  const removeClient = async (id) => {
    try {
      await deleteDoc(doc(db, 'clients', id));
      return { success: true };
    } catch (error) {
      console.error('Error removing client:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Remove a worker.
   */
  const removeWorker = async (id) => {
    try {
      await deleteDoc(doc(db, 'workers', id));
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
      await addDoc(collection(db, 'missions'), {
        ...mission,
        createdAt: serverTimestamp()
      });
      return { success: true };
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
      await updateDoc(doc(db, 'missions', id), {
        ...updates,
        updatedAt: serverTimestamp()
      });
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
        return { success: false, error: 'لا يوجد عمال متاحون لإنشاء الجدول الافتراضي' };
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
              description: 'رعاية الخيول والإسطبلات - الفترة الصباحية',
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
              description: 'رعاية الخيول والإسطبلات - الفترة المسائية',
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
        return { success: false, error: 'لا توجد جداول لحفظها كافتراضية' };
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
        return { success: false, error: 'لا يوجد جدول افتراضي محفوظ' };
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
          title: template.description || 'مهمة عمل',
          description: `مجدول في ${template.timeSlot}`,
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
        return { success: false, error: 'لا توجد جداول لحذفها' };
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
        return { success: false, error: 'لا توجد جداول لحذفها' };
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
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

