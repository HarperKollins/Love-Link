import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  GoogleAuthProvider, 
  signInWithPopup,
  sendEmailVerification,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Check if email is a school email
  const isSchoolEmail = (email) => {
    // This is a simplified check - you can make this more specific
    // For example: return email.endsWith('@ebsu.edu.ng');
    return email.includes('@');
  };

  // Sign up with email and password
  async function signup(email, password, displayName) {
    try {
      setError('');
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update profile with display name
      await updateProfile(user, { displayName });
      
      // Send email verification
      await sendEmailVerification(user);
      
      // Create user document in Firestore
      const userDoc = {
        uid: user.uid,
        email: user.email,
        displayName,
        createdAt: new Date(),
        trialEndDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days trial
        subscription: {
          status: 'trial',
          plan: 'trial',
          endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
        }
      };

      await setDoc(doc(db, 'users', user.uid), userDoc);
      return user;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }

  // Login with email and password
  async function login(email, password) {
    try {
      setError('');
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }

  // Login with Google
  async function signInWithGoogle() {
    try {
      setError('');
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user document exists
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        // Create new user document with trial period
        const userData = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          createdAt: new Date(),
          trialEndDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days trial
          subscription: {
            status: 'trial',
            plan: 'trial',
            endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
          }
        };
        await setDoc(doc(db, 'users', user.uid), userData);
      }

      return user;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }

  // Logout
  async function logout() {
    try {
      setError('');
      await signOut(auth);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }

  // Update user profile
  async function updateUserProfile(updates) {
    try {
      setError('');
      if (currentUser) {
        // Update Firebase Auth profile
        await updateProfile(currentUser, updates);
        
        // Update Firestore document
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, updates);
      }
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }

  async function updateSubscription(plan) {
    try {
      setError('');
      if (!currentUser) throw new Error('No user logged in');

      const userRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) throw new Error('User document not found');

      const subscriptionData = {
        status: 'active',
        plan,
        startDate: new Date(),
        endDate: new Date(Date.now() + (
          plan === 'monthly' ? 30 * 24 * 60 * 60 * 1000 :
          plan === '3months' ? 90 * 24 * 60 * 60 * 1000 :
          365 * 24 * 60 * 60 * 1000
        ))
      };

      await updateDoc(userRef, {
        subscription: subscriptionData
      });

      return subscriptionData;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }

  async function resetPassword(email) {
    try {
      setError('');
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Get user document from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setCurrentUser({ ...user, ...userDoc.data() });
        } else {
          setCurrentUser(user);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    logout,
    resetPassword,
    updateUserProfile,
    updateSubscription,
    signInWithGoogle,
    isSchoolEmail,
    error,
    setError
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
