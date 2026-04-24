import React, { createContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebaseConfig';

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
        phone,
        role,
        createdAt: new Date().toISOString(),
      });

      // If client, create client record
      if (role === 'client') {
        await setDoc(doc(db, 'clients', user.uid), {
          name,
          email,
          phone,
          amountPaid: 0,
          amountDue: 0,
          createdAt: new Date().toISOString(),
        });
      }

      setUserRole(role);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
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
      return { success: false, error: error.message };
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
