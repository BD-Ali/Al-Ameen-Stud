import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Firebase configuration for Al-Ameen Stable app.
 * Connected to project: al-ameen-stable
 */
const firebaseConfig = {
  apiKey: "AIzaSyB6xWP-IIN1Jephs0h1bWjBtEDlnqXFom4",
  authDomain: "al-ameen-stable.firebaseapp.com",
  projectId: "al-ameen-stable",
  storageBucket: "al-ameen-stable.firebasestorage.app",
  messagingSenderId: "941395916267",
  appId: "1:941395916267:web:cd92dc8061b3f226a1d5ae",
  measurementId: "G-JPGEYFT1JS"
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

/*
 * ========================================
 * FIREBASE SETUP CHECKLIST
 * ========================================
 *
 * □ Step 1: Create Firebase Project
 *   - Go to: https://console.firebase.google.com/
 *   - Click "Add project"
 *   - Name: "al-ameen-stable" (or your choice)
 *   - Click "Continue" through the setup
 *
 * □ Step 2: Enable Authentication
 *   - In Firebase Console: Build > Authentication
 *   - Click "Get Started"
 *   - Select "Email/Password"
 *   - Toggle "Enable" and save
 *
 * □ Step 3: Create Firestore Database
 *   - In Firebase Console: Build > Firestore Database
 *   - Click "Create database"
 *   - Select "Start in production mode"
 *   - Choose your region
 *   - Click "Enable"
 *
 * □ Step 4: Get Your Firebase Config
 *   - Click the gear icon (⚙️) > Project settings
 *   - Scroll down to "Your apps"
 *   - Click the web icon </> to add a web app
 *   - Register app with nickname: "Al-Ameen Stable"
 *   - Copy the firebaseConfig object shown
 *
 * □ Step 5: Update firebaseConfig.js
 *   - Open firebaseConfig.js in this project
 *   - Replace the placeholder values with your actual config
 *   - Save the file
 *
 * □ Step 6: Set Firestore Security Rules
 *   - In Firebase Console: Firestore Database > Rules tab
 *   - Copy the rules from DEPLOYMENT.md
 *   - Publish the rules
 *
 * ========================================
 * TESTING LOCALLY
 * ========================================
 *
 * Run: npm start
 * Then press: w (for web), a (android), or i (iOS)
 *
 * Create your first admin account:
 * - Click "Sign Up"
 * - Fill in your details
 * - Select "Admin" role
 * - Sign up!
 *
 * ========================================
 * DEPLOYING TO PRODUCTION
 * ========================================
 *
 * See DEPLOYMENT.md for complete deployment instructions
 *
 */
