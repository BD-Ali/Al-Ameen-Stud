import React, { createContext, useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebaseConfig';

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
  const [loading, setLoading] = useState(true);

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
   */
  const addLesson = async (lesson) => {
    try {
      await addDoc(collection(db, 'lessons'), {
        ...lesson,
        createdAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Error adding lesson:', error);
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
   * Remove a lesson.
   */
  const removeLesson = async (id) => {
    try {
      await deleteDoc(doc(db, 'lessons', id));
      return { success: true };
    } catch (error) {
      console.error('Error removing lesson:', error);
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
        lessons,
        addLesson,
        removeLesson,
        loading,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};