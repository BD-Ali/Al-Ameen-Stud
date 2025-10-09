import React, { createContext, useState } from 'react';

/**
 * DataContext stores all of the core stable data in memory and provides
 * helper functions to mutate the data.  In a production application the data
 * would be persisted to a back‑end service, but for this demo we keep it
 * in React state.
 */
export const DataContext = createContext();

export const DataProvider = ({ children }) => {
  // Horses in the stable.  Each horse has an id, name, breed, owner, feedSchedule and value.
  const [horses, setHorses] = useState([
    {
      id: '1',
      name: 'Thunder',
      breed: 'Arabian',
      owner: 'Sarah Cohen',
      feedSchedule: '08:00 hay; 18:00 grain',
      value: 15000,
    },
    {
      id: '2',
      name: 'Bella',
      breed: 'Quarter Horse',
      owner: 'David Levi',
      feedSchedule: '07:30 hay; 17:30 grain',
      value: 12000,
    },
  ]);

  // Clients who take lessons.  Each client has an id, name, amountPaid and amountDue.
  const [clients, setClients] = useState([
    { id: '1', name: 'Emma Rosen', amountPaid: 200, amountDue: 100 },
    { id: '2', name: 'Omer Asaf', amountPaid: 300, amountDue: 0 },
  ]);

  // Workers in the stable (private/admin only).
  const [workers, setWorkers] = useState([
    { id: '1', name: 'Yossi', role: 'Trainer', contact: '+972‑52‑1234567' },
    { id: '2', name: 'Maya', role: 'Groom', contact: '+972‑52‑2345678' },
  ]);

  // Scheduled lessons.  Each lesson has an id, date, time, horseId, clientId, instructorId and price.
  const [lessons, setLessons] = useState([
    { id: '1', date: '2025-10-10', time: '09:00', horseId: '1', clientId: '1', instructorId: '1', price: 100 },
    { id: '2', date: '2025-10-11', time: '11:00', horseId: '2', clientId: '2', instructorId: '2', price: 100 },
  ]);

  /**
   * Add a new horse to the stable.  Assigns a unique id based on current time.
   */
  const addHorse = (horse) => {
    setHorses((prev) => [
      ...prev,
      { id: Date.now().toString(), ...horse },
    ]);
  };

  /**
   * Update an existing horse.  Finds by id and merges changes.
   */
  const updateHorse = (id, updates) => {
    setHorses((prev) => prev.map((h) => (h.id === id ? { ...h, ...updates } : h)));
  };

  /**
   * Add a new client.
   */
  const addClient = (client) => {
    setClients((prev) => [
      ...prev,
      { id: Date.now().toString(), ...client },
    ]);
  };

  /**
   * Update a client (e.g., payment status).
   */
  const updateClient = (id, updates) => {
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  /**
   * Add a new worker.
   */
  const addWorker = (worker) => {
    setWorkers((prev) => [
      ...prev,
      { id: Date.now().toString(), ...worker },
    ]);
  };

  /**
   * Add a new lesson.
   */
  const addLesson = (lesson) => {
    setLessons((prev) => [
      ...prev,
      { id: Date.now().toString(), ...lesson },
    ]);
  };

  return (
    <DataContext.Provider
      value={{
        horses,
        addHorse,
        updateHorse,
        clients,
        addClient,
        updateClient,
        workers,
        addWorker,
        lessons,
        addLesson,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};