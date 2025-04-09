import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { getSubscriptionPlans } from '../services/subscription';
import PlanCard from '../components/payment/PlanCard';
import PaymentModal from '../components/payment/PaymentModal';
import { initializePayment } from '../services/paystack';

const Subscription = () => {
  const { currentUser } = useAuth();
  const { subscription, isPremium, premiumEndDate, trialDaysLeft } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Load subscription plans
    const subscriptionPlans = getSubscriptionPlans();
    setPlans(subscriptionPlans);
  }, []);

  const handleSelectPlan = (planId) => {
    const plan = plans.find(p => p.id === planId);
    setSelectedPlan(plan);
  };

  const handleSubscribe = () => {
    if (!selectedPlan) {
      setError('Please select a subscription plan');
      return;
    }
    
    setShowPaymentModal(true);
  };

  const handlePaymentComplete = async (response) => {
    try {
      setLoading(true);
      setError('');
      
      if (response.success) {
        // Calculate premium end date based on plan duration
        const now = new Date();
        let endDate = new Date();
        
        switch (selectedPlan.id) {
          case 'monthly':
            endDate.setMonth(now.getMonth() + 1);
            break;
          case 'quarterly':
            endDate.setMonth(now.getMonth() + 3);
            break;
          case 'yearly':
            endDate.setFullYear(now.getFullYear() + 1);
            break;
          default:
            endDate.setMonth(now.getMonth() + 1);
        }
        
        // Update subscription in user document
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, {
          subscription: {
            status: 'active',
            plan: selectedPlan.id,
            startDate: now,
            endDate: endDate,
            paymentReference: response.reference
          },
          updatedAt: serverTimestamp()
        });
        
        setSuccess('Subscription successful! You now have premium access.');
        setShowPaymentModal(false);
        
        // Redirect to matches after a short delay
        setTimeout(() => {
          navigate('/matches');
        }, 3000);
      } else {
        setError(response.message || 'Payment failed. Please try again.');
      }
    } catch (error) {
      console.error('Error updating subscription:', error);
      setError('Failed to update subscription. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 pb-20">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Subscription Plans
          </h1>
          
          {isPremium ? (
            <p className="mt-4 text-lg text-gray-500">
              You have premium access until {premiumEndDate?.toLocaleDateString()}
            </p>
          ) : (
            <p className="mt-4 text-lg text-gray-500">
              {trialDaysLeft > 0 ? (
                `You have ${trialDaysLeft} days left in your free trial`
              ) : (
                'Your free trial has ended. Subscribe to continue using Love Link'
              )}
            </p>
          )}
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6" role="alert">
            <span className="block sm:inline">{success}</span>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              selected={selectedPlan?.id === plan.id}
              onSelect={handleSelectPlan}
            />
          ))}
        </div>
        
        <div className="text-center">
          <button
            onClick={handleSubscribe}
            disabled={!selectedPlan || loading}
            className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white ${
              !selectedPlan || loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
            }`}
          >
            {loading ? 'Processing...' : 'Subscribe Now'}
          </button>
        </div>
      </div>
      
      {showPaymentModal && selectedPlan && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          plan={selectedPlan}
          onPaymentComplete={handlePaymentComplete}
        />
      )}
    </div>
  );
};

export default Subscription;
