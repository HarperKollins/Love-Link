export const getSubscriptionPlans = () => {
  return [
    {
      id: 'monthly',
      name: 'Monthly',
      price: 1500,
      duration: 'month',
      description: 'Perfect for trying out Love Link',
      features: [
        'Unlimited matches',
        'Unlimited messages',
        'See who likes you',
        'Advanced filters',
        'Priority support'
      ],
      popular: false
    },
    {
      id: 'quarterly',
      name: 'Quarterly',
      price: 4000,
      duration: '3 months',
      description: 'Our most popular plan',
      features: [
        'Unlimited matches',
        'Unlimited messages',
        'See who likes you',
        'Advanced filters',
        'Priority support',
        'Profile boost once a month'
      ],
      popular: true
    },
    {
      id: 'yearly',
      name: 'Yearly',
      price: 12000,
      duration: 'year',
      description: 'Best value for serious users',
      features: [
        'Unlimited matches',
        'Unlimited messages',
        'See who likes you',
        'Advanced filters',
        'Priority support',
        'Profile boost twice a month',
        'Read receipts',
        'Exclusive events'
      ],
      popular: false
    }
  ];
};

export const calculateTrialEndDate = (signupDate) => {
  const trialEndDate = new Date(signupDate);
  trialEndDate.setDate(trialEndDate.getDate() + 3); // 3-day trial
  return trialEndDate;
};

export const isTrialActive = (signupDate) => {
  if (!signupDate) return false;
  
  const trialEndDate = calculateTrialEndDate(signupDate);
  const currentDate = new Date();
  
  return currentDate < trialEndDate;
};

export const getTrialDaysLeft = (signupDate) => {
  if (!signupDate) return 0;
  
  const trialEndDate = calculateTrialEndDate(signupDate);
  const currentDate = new Date();
  
  if (currentDate > trialEndDate) return 0;
  
  const diffTime = Math.abs(trialEndDate - currentDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};
