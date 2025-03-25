import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  GoogleAuthProvider, 
  signInWithPopup,
  sendEmailVerification,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if email is a school email
  const isSchoolEmail = (email) => {
    // This is a simplified check - you can make this more specific
    // For example: return email.endsWith('@ebsu.edu.ng');
    return email.includes('@');
  };

  // Sign up with email and password
  async function signup(email, password, displayName) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update profile with display name
      await updateProfile(user, { displayName });
      
      // Send email verification
      await sendEmailVerification(user);
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        displayName,
        email,
        emailVerified: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      // Create user actions document
      await setDoc(doc(db, 'userActions', user.uid), {
        likes: [],
        dislikes: [],
        matches: [],
        createdAt: serverTimestamp()
      });
      
      // Create subscription document with trial info
      await setDoc(doc(db, 'subscriptions', user.uid), {
        isActive: false,
        isPremium: false,
        signupDate: serverTimestamp(),
        trialUsed: false,
        createdAt: serverTimestamp()
      });
      
      return user;
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  }

  // Login with email and password
  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  // Login with Google
  async function loginWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;
      
      // Check if user document exists
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        // Create user document in Firestore
        await setDoc(doc(db, 'users', user.uid), {
          displayName: user.displayName,
          email: user.email,
          emailVerified: user.emailVerified,
          photoURL: user.photoURL,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        
        // Create user actions document
        await setDoc(doc(db, 'userActions', user.uid), {
          likes: [],
          dislikes: [],
          matches: [],
          createdAt: serverTimestamp()
        });
        
        // Create subscription document with trial info
        await setDoc(doc(db, 'subscriptions', user.uid), {
          isActive: false,
          isPremium: false,
          signupDate: serverTimestamp(),
          trialUsed: false,
          createdAt: serverTimestamp()
        });
      }
      
      return user;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  }

  // Logout
  function logout() {
    return signOut(auth);
  }

  // Update user profile
  async function updateUserProfile(data) {
    try {
      const user = auth.currentUser;
      
      if (!user) {
        throw new Error('No user is signed in');
      }
      
      // Update display name and photo URL if provided
      if (data.displayName || data.photoURL) {
        await updateProfile(user, {
          displayName: data.displayName || user.displayName,
          photoURL: data.photoURL || user.photoURL
        });
      }
      
      // Update user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        ...data,
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      return user;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    logout,
    loginWithGoogle,
    updateUserProfile,
    isSchoolEmail
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
