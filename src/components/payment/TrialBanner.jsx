import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSubscription } from '../../contexts/SubscriptionContext';

const TrialBanner = () => {
  const { isTrialActive, trialDaysLeft, isPremium } = useSubscription();
  
  // Don't show banner if user is premium
  if (isPremium) {
    return null;
  }
  
  // Don't show banner if trial is not active
  if (!isTrialActive) {
    return (
      <div className="bg-red-600 text-white px-4 py-2 text-center">
        <p className="text-sm">
          Your free trial has ended. 
          <Link to="/subscription" className="ml-2 font-bold underline">
            Upgrade now
          </Link>
        </p>
      </div>
    );
  }
  
  return (
    <div className="bg-primary-600 text-white px-4 py-2 text-center">
      <p className="text-sm">
        {trialDaysLeft === 1 ? (
          <>
            Your free trial ends today! 
            <Link to="/subscription" className="ml-2 font-bold underline">
              Upgrade now
            </Link>
          </>
        ) : (
          <>
            You have {trialDaysLeft} days left in your free trial. 
            <Link to="/subscription" className="ml-2 font-bold underline">
              Upgrade now
            </Link>
          </>
        )}
      </p>
    </div>
  );
};

export default TrialBanner;
