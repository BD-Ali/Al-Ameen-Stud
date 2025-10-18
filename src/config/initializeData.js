/**
 * Firebase Data Initialization Script
 *
 * This script helps you add sample data to your Firestore database.
 * Run this AFTER you've set up Firebase and created your admin account.
 *
 * HOW TO USE:
 * 1. Make sure you're logged in as an admin
 * 2. You can manually add this data through Firebase Console, or
 * 3. Create a temporary screen in your app to run these functions
 */

import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebaseConfig';

// Sample horses data
export const initializeHorses = async () => {
  const horses = [
    {
      name: 'Thunder',
      breed: 'Arabian',
      owner: 'Sarah Cohen',
      feedSchedule: '08:00 hay; 18:00 grain',
      value: 15000,
      createdAt: serverTimestamp()
    },
    {
      name: 'Bella',
      breed: 'Quarter Horse',
      owner: 'David Levi',
      feedSchedule: '07:30 hay; 17:30 grain',
      value: 12000,
      createdAt: serverTimestamp()
    },
    {
      name: 'Spirit',
      breed: 'Thoroughbred',
      owner: 'Emma Rosen',
      feedSchedule: '08:00 hay; 19:00 grain',
      value: 18000,
      createdAt: serverTimestamp()
    }
  ];

  try {
    for (const horse of horses) {
      await addDoc(collection(db, 'horses'), horse);
    }
    console.log('Sample horses added successfully!');
    return { success: true };
  } catch (error) {
    console.error('Error adding horses:', error);
    return { success: false, error: error.message };
  }
};

// Sample workers data
export const initializeWorkers = async () => {
  const workers = [
    {
      name: 'Yossi Cohen',
      role: 'Head Trainer',
      contact: '+972-52-1234567',
      createdAt: serverTimestamp()
    },
    {
      name: 'Maya Levi',
      role: 'Groom',
      contact: '+972-52-2345678',
      createdAt: serverTimestamp()
    },
    {
      name: 'David Rosen',
      role: 'Assistant Trainer',
      contact: '+972-52-3456789',
      createdAt: serverTimestamp()
    }
  ];

  try {
    for (const worker of workers) {
      await addDoc(collection(db, 'workers'), worker);
    }
    console.log('Sample workers added successfully!');
    return { success: true };
  } catch (error) {
    console.error('Error adding workers:', error);
    return { success: false, error: error.message };
  }
};

// Initialize all sample data
export const initializeAllSampleData = async () => {
  console.log('Initializing sample data...');

  await initializeHorses();
  await initializeWorkers();

  console.log('All sample data initialized!');
  console.log('Note: Clients are created when users sign up with "Client" role');
  console.log('Note: Lessons should be added through the admin interface');
};

// Note: You can call these functions from a temporary admin screen
// or directly from Firebase Console by adding documents manually

