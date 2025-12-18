import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { XMarkIcon } from '@heroicons/react/24/outline';

const AdvancedSearch = ({ onClose }) => {
  const [filters, setFilters] = useState({
    personalityTraits: [],
    location: '',
    searchRadius: '50',
    relationshipGoals: '',
    interests: [],
    ageRange: { min: 18, max: 99 },
    height: { min: 140, max: 220 },
    lifestyle: [],
  });

  const personalityTraits = [
    'Introverted',
    'Extroverted',
    'Creative',
    'Analytical',
    'Adventurous',
    'Reserved',
    'Spontaneous',
    'Organized'
  ];

  const interests = [
    'Reading',
    'Travel',
    'Music',
    'Sports',
    'Art',
    'Technology',
    'Cooking',
    'Photography',
    'Gaming',
    'Fitness',
    'Nature',
    'Movies'
  ];

  const lifestyleChoices = [
    'Active',
    'Relaxed',
    'Nightlife',
    'Homebody',
    'Outdoorsy',
    'City Life',
    'Health-conscious',
    'Social'
  ];

  const relationshipTypes = [
    'Long-term Relationship',
    'Casual Dating',
    'Friendship',
    'Marriage-minded'
  ];

  const handleTraitToggle = (trait) => {
    setFilters(prev => ({
      ...prev,
      personalityTraits: prev.personalityTraits.includes(trait)
        ? prev.personalityTraits.filter(t => t !== trait)
        : [...prev.personalityTraits, trait]
    }));
  };

  const handleInterestToggle = (interest) => {
    setFilters(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleLifestyleToggle = (lifestyle) => {
    setFilters(prev => ({
      ...prev,
      lifestyle: prev.lifestyle.includes(lifestyle)
        ? prev.lifestyle.filter(l => l !== lifestyle)
        : [...prev.lifestyle, lifestyle]
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // TODO: Implement search functionality with the filters
    console.log('Search filters:', filters);
    onClose();
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Advanced Search</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
          aria-label="Close search"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>

      <form onSubmit={handleSearch} className="space-y-6">
        {/* Location and Distance */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <input
            type="text"
            value={filters.location}
            onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
            placeholder="Enter city or location"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
          />
          <div className="mt-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Radius (km)
            </label>
            <input
              type="range"
              min="1"
              max="300"
              value={filters.searchRadius}
              onChange={(e) => setFilters(prev => ({ ...prev, searchRadius: e.target.value }))}
              className="w-full"
            />
            <span className="text-sm text-gray-500">{filters.searchRadius} km</span>
          </div>
        </div>

        {/* Relationship Goals */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Relationship Goals
          </label>
          <select
            value={filters.relationshipGoals}
            onChange={(e) => setFilters(prev => ({ ...prev, relationshipGoals: e.target.value }))}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
          >
            <option value="">Select goal</option>
            {relationshipTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Age Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Age Range
          </label>
          <div className="flex items-center space-x-4">
            <input
              type="number"
              min="18"
              max="99"
              value={filters.ageRange.min}
              onChange={(e) => setFilters(prev => ({
                ...prev,
                ageRange: { ...prev.ageRange, min: parseInt(e.target.value) }
              }))}
              className="block w-20 rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
            />
            <span>to</span>
            <input
              type="number"
              min="18"
              max="99"
              value={filters.ageRange.max}
              onChange={(e) => setFilters(prev => ({
                ...prev,
                ageRange: { ...prev.ageRange, max: parseInt(e.target.value) }
              }))}
              className="block w-20 rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
            />
          </div>
        </div>

        {/* Personality Traits */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Personality Traits
          </label>
          <div className="flex flex-wrap gap-2">
            {personalityTraits.map(trait => (
              <button
                key={trait}
                type="button"
                onClick={() => handleTraitToggle(trait)}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  filters.personalityTraits.includes(trait)
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {trait}
              </button>
            ))}
          </div>
        </div>

        {/* Interests */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Interests
          </label>
          <div className="flex flex-wrap gap-2">
            {interests.map(interest => (
              <button
                key={interest}
                type="button"
                onClick={() => handleInterestToggle(interest)}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  filters.interests.includes(interest)
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {interest}
              </button>
            ))}
          </div>
        </div>

        {/* Lifestyle */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lifestyle
          </label>
          <div className="flex flex-wrap gap-2">
            {lifestyleChoices.map(choice => (
              <button
                key={choice}
                type="button"
                onClick={() => handleLifestyleToggle(choice)}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  filters.lifestyle.includes(choice)
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {choice}
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            Search
          </button>
        </div>
      </form>
    </div>
  );
};

AdvancedSearch.propTypes = {
  onClose: PropTypes.func.isRequired
};

export default AdvancedSearch; 