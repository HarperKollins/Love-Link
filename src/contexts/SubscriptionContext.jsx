import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from './AuthContext';
import { isTrialActive, getTrialDaysLeft } from '../services/subscription';

const SubscriptionContext = createContext();

export function useSubscription() {
  return useContext(SubscriptionContext);
}

export function SubscriptionProvider({ children }) {
  const { currentUser } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    const subscriptionRef = doc(db, 'subscriptions', currentUser.uid);
    
    const unsubscribe = onSnapshot(subscriptionRef, (doc) => {
      if (doc.exists()) {
        setSubscription({
          id: doc.id,
          ...doc.data(),
          signupDate: doc.data().signupDate?.toDate(),
          trialEndDate: doc.data().signupDate ? 
            new Date(doc.data().signupDate.toDate().getTime() + (3 * 24 * 60 * 60 * 1000)) : null,
          premiumEndDate: doc.data().premiumEndDate?.toDate()
        });
      } else {
        setSubscription(null);
      }
      
      setLoading(false);
    }, (error) => {
      console.error('Error fetching subscription:', error);
      setLoading(false);
    });
    
    return unsubscribe;
  }, [currentUser]);

  // Check if user has access (either in trial or premium)
  const hasAccess = () => {
    if (!currentUser || !subscription) return false;
    
    // If user is premium, they have access
    if (subscription.isPremium) {
      const now = new Date();
      return subscription.premiumEndDate > now;
    }
    
    // If user is in trial period, they have access
    if (subscription.signupDate) {
      return isTrialActive(subscription.signupDate);
    }
    
    return false;
  };

  const value = {
    subscription,
    loading,
    hasAccess: hasAccess(),
    isTrialActive: subscription?.signupDate ? isTrialActive(subscription.signupDate) : false,
    trialDaysLeft: subscription?.signupDate ? getTrialDaysLeft(subscription.signupDate) : 0,
    isPremium: subscription?.isPremium || false,
    premiumEndDate: subscription?.premiumEndDate || null
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}
