import React from 'react';
import { CheckIcon } from '@heroicons/react/24/outline';

const plans = [
  {
    name: 'Monthly',
    price: '₦500',
    description: 'Perfect for those who want to try out the service',
    features: [
      'Unlimited matches',
      'Advanced search filters',
      'Message anyone',
      'See who liked you',
      'Priority customer support'
    ],
    duration: 'month'
  },
  {
    name: '3 Months',
    price: '₦1,500',
    description: 'Best value for short-term commitment',
    features: [
      'All Monthly features',
      'Profile boost every week',
      'Read receipts',
      'See who viewed your profile',
      'Priority in search results'
    ],
    duration: '3 months',
    popular: true
  },
  {
    name: 'Yearly',
    price: '₦6,000',
    description: 'The best value for long-term commitment',
    features: [
      'All 3 Months features',
      'Profile boost every day',
      'Incognito mode',
      'Advanced analytics',
      'Priority in all features'
    ],
    duration: 'year'
  }
];

export default function Pricing() {
  return (
    <div className="bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Choose the plan that's right for you
          </p>
        </div>

        <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-auto xl:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200 ${
                plan.popular ? 'border-primary-500 ring-2 ring-primary-500' : ''
              }`}
            >
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900">{plan.name}</h3>
                <p className="mt-4 text-sm text-gray-500">{plan.description}</p>
                <p className="mt-8">
                  <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
                  <span className="text-base font-medium text-gray-500">/{plan.duration}</span>
                </p>
                <button
                  className={`mt-8 block w-full rounded-md py-2 text-sm font-semibold text-white text-center ${
                    plan.popular
                      ? 'bg-primary-600 hover:bg-primary-700'
                      : 'bg-gray-800 hover:bg-gray-900'
                  }`}
                >
                  Get started
                </button>
              </div>
              <div className="px-6 pt-6 pb-8">
                <h4 className="text-xs font-semibold text-gray-900 tracking-wide uppercase">
                  What's included
                </h4>
                <ul className="mt-6 space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex space-x-3">
                      <CheckIcon className="flex-shrink-0 h-5 w-5 text-green-500" aria-hidden="true" />
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
} 