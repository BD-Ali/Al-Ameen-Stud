import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Firebase Configuration - EXAMPLE FILE
 *
 * IMPORTANT: This is an example configuration file.
 *
 * To use this app:
 * 1. Create a Firebase project at https://console.firebase.google.com
 * 2. Enable Authentication (Email/Password provider)
 * 3. Enable Cloud Firestore database
 * 4. Copy your Firebase configuration from Project Settings
 * 5. Replace the values below with your actual credentials
 * 6. Rename this file to firebaseConfig.js (remove .example)
 *
 * SECURITY WARNING:
 * - Never commit actual credentials to public repositories
 * - Add firebaseConfig.js to .gitignore
 * - Use environment variables for production
 */

const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.firebasestorage.app",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID" // Optional
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication with AsyncStorage persistence
// This allows users to stay logged in between app sessions
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Firestore
export const db = getFirestore(app);

export default app;

