import React from 'react';

const PlanCard = ({ plan, selected, onSelect }) => {
  return (
    <div 
      className={`border rounded-lg p-4 cursor-pointer transition-all ${
        selected 
          ? 'border-primary-500 bg-primary-50 shadow-md' 
          : 'border-gray-200 hover:border-primary-300'
      } ${plan.popular ? 'relative' : ''}`}
      onClick={() => onSelect(plan.id)}
    >
      {plan.popular && (
        <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
          <span className="bg-primary-500 text-white text-xs px-2 py-1 rounded-full">
            Popular
          </span>
        </div>
      )}
      
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-medium text-gray-900">{plan.name}</h3>
        {selected && (
          <svg className="h-5 w-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        )}
      </div>
      
      <div className="mb-4">
        <span className="text-2xl font-bold text-gray-900">₦{plan.price.toLocaleString()}</span>
        <span className="text-gray-500 ml-1">/ {plan.duration}</span>
      </div>
      
      <p className="text-sm text-gray-500 mb-4">{plan.description}</p>
      
      <ul className="space-y-2">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm text-gray-600">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PlanCard;
