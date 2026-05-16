import React, { createContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebaseConfig';
import { translate } from '../i18n/LanguageContext';

/**
 * Maps a Firebase Auth error to a user-friendly translated message.
 */
const getAuthErrorMessage = (error) => {
  switch (error?.code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return translate('auth.invalidCredentials');
    case 'auth/email-already-in-use':
      return translate('auth.emailInUse');
    case 'auth/invalid-email':
      return translate('auth.invalidEmail');
    case 'auth/weak-password':
      return translate('auth.weakPassword');
    case 'auth/too-many-requests':
      return translate('profile.tooManyAttempts');
    case 'auth/network-request-failed':
      return translate('common.networkError');
    default:
      return translate('common.unexpectedError');
  }
};

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Fetch user role from Firestore
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setUserRole(userDoc.data().role);
        }
      } else {
        setUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signUp = async (email, password, name, phone, role = 'client') => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Store user profile in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email,
        name,
        phoneNumber: phone,
        role,
        createdAt: new Date().toISOString(),
      });

      // If client, create client record
      if (role === 'client') {
        await setDoc(doc(db, 'clients', user.uid), {
          name,
          email,
          phoneNumber: phone,
          amountPaid: 0,
          amountDue: 0,
          lessonCount: 0,
          hasSubscription: false,
          subscriptionActive: false,
          subscriptionLessons: 0,
          subscriptionUsedLessons: 0,
          subscriptionTotalLessons: 0,
          createdAt: new Date().toISOString(),
        });
      }

      setUserRole(role);
      return { success: true };
    } catch (error) {
      return { success: false, error: getAuthErrorMessage(error) };
    }
  };

  const signIn = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Fetch user role
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        setUserRole(userDoc.data().role);
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: getAuthErrorMessage(error) };
    }
  };

  const logOut = async () => {
    try {
      await signOut(auth);
      setUserRole(null);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  /**
   * Create a user account (for admin to create client/worker accounts)
   */
  const createUserAccount = async (email, password, name, role, phoneNumber) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;

      // Store user profile in Firestore
      await setDoc(doc(db, 'users', newUser.uid), {
        email,
        name,
        role,
        phoneNumber,
        createdAt: new Date().toISOString(),
      });

      // If client, create client record
      if (role === 'client') {
        await setDoc(doc(db, 'clients', newUser.uid), {
          name,
          email,
          phoneNumber,
          amountPaid: 0,
          amountDue: 0,
          lessonsCount: 0,
          createdAt: new Date().toISOString(),
        });
      }

      // Sign out the newly created user to keep admin logged in
      await signOut(auth);

      return { success: true, userId: newUser.uid };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userRole,
        loading,
        signUp,
        signIn,
        logOut,
        createUserAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
