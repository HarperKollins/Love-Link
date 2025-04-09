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
      
      // Configure custom parameters
      provider.setCustomParameters({
        prompt: 'select_account',
        login_hint: '', // Clear any previous login hints
        // Add additional OAuth scopes if needed
        scope: 'profile email'
      });

      // Use signInWithRedirect instead of popup for better mobile experience
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      if (isMobile) {
        await signInWithRedirect(auth, provider);
        return null; // The redirect will handle the rest
      }

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
          createdAt: serverTimestamp(),
          trialEndDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days trial
          subscription: {
            status: 'trial',
            plan: 'trial',
            endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
          },
          // Add university-related fields
          university: '',
          department: '',
          yearOfStudy: '',
          verified: false
        };
        await setDoc(doc(db, 'users', user.uid), userData);
      }

      return user;
    } catch (error) {
      console.error('Google Sign In Error:', error);
      if (error.code === 'auth/popup-closed-by-user') {
        // Don't throw error for user-initiated cancellation
        setError(null);
        return null;
      } else if (error.code === 'auth/cancelled-popup-request') {
        setError('Please try again.');
      } else if (error.code === 'auth/popup-blocked') {
        setError('Popup was blocked. Please enable popups for this site.');
      } else if (error.code === 'auth/unauthorized-domain') {
        setError('This domain is not authorized. Please contact support.');
      } else {
        setError('Failed to sign in. ' + error.message);
      }
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
      try {
        if (user) {
          // Get additional user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          const userData = userDoc.exists() ? userDoc.data() : {};
          
          // Check if user is admin
          const adminDoc = await getDoc(doc(db, 'admins', user.uid));
          const isAdmin = adminDoc.exists();
          
          // Merge user data
          const enhancedUser = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || userData.displayName || 'Anonymous',
            photoURL: user.photoURL || userData.photoURL || '/default-avatar.png',
            university: userData.university || 'Unknown University',
            isAdmin,
            ...userData
          };
          
          setCurrentUser(enhancedUser);
        } else {
          setCurrentUser(null);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        // If there's an error, still set basic user data
        if (user) {
          setCurrentUser({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || 'Anonymous',
            photoURL: user.photoURL || '/default-avatar.png',
            university: 'Unknown University'
          });
        } else {
          setCurrentUser(null);
        }
      } finally {
        setLoading(false);
      }
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
