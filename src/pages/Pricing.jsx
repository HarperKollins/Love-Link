import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Pricing = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleSubscribe = (plan) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    // Here you would implement the subscription logic
    console.log(`Subscribing to ${plan}`);
  };

  const plans = [
    {
      name: 'Basic',
      price: '$0',
      features: [
        'Limited matches per day',
        'Basic profile features',
        'Standard messaging',
        'Basic search filters'
      ]
    },
    {
      name: 'Premium',
      price: '$9.99',
      period: '/month',
      features: [
        'Unlimited matches',
        'Advanced profile features',
        'Priority messaging',
        'Advanced search filters',
        'See who liked you',
        'Ad-free experience'
      ],
      popular: true
    },
    {
      name: 'VIP',
      price: '$19.99',
      period: '/month',
      features: [
        'All Premium features',
        'Priority customer support',
        'Profile boost',
        'Exclusive events access',
        'Verified badge',
        'Custom profile theme'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Choose Your Perfect Plan
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Find your perfect match with our flexible subscription plans
          </p>
        </div>

        <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`border rounded-lg shadow-sm divide-y divide-gray-200 ${
                plan.popular ? 'border-pink-500' : 'border-gray-200'
              }`}
            >
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900">{plan.name}</h3>
                <p className="mt-4">
                  <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
                  {plan.period && <span className="text-base font-medium text-gray-500">{plan.period}</span>}
                </p>
                <button
                  onClick={() => handleSubscribe(plan.name)}
                  className={`mt-8 block w-full rounded-md py-2 text-sm font-semibold text-white ${
                    plan.popular
                      ? 'bg-pink-500 hover:bg-pink-600'
                      : 'bg-gray-800 hover:bg-gray-900'
                  }`}
                >
                  {plan.name === 'Basic' ? 'Get Started' : 'Subscribe Now'}
                </button>
              </div>
              <div className="px-6 pt-6 pb-8">
                <h4 className="text-xs font-semibold text-gray-900 tracking-wide uppercase">What's included</h4>
                <ul className="mt-6 space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex space-x-3">
                      <svg
                        className="flex-shrink-0 h-5 w-5 text-green-500"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-sm text-gray-500">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Pricing; 