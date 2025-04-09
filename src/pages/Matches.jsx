import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import * as matchingService from '../services/matching';
import ProfileCard from '../components/ui/ProfileCard';
import WelcomePopup from '../components/WelcomePopup';
import { HeartIcon, XMarkIcon } from '@heroicons/react/24/outline';

const Matches = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showWelcome, setShowWelcome] = useState(true);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    const fetchMatches = async () => {
      try {
        setLoading(true);
        setError('');

        // Get recommended matches
        const recommendedMatches = await matchingService.getRecommendedMatches(currentUser);
        setMatches(recommendedMatches);
      } catch (error) {
        console.error('Error fetching matches:', error);
        setError('Failed to load matches. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [currentUser, navigate]);

  const handleLike = async (matchId) => {
    // TODO: Implement like functionality
    console.log('Liked:', matchId);
    setCurrentMatchIndex(prev => prev + 1);
  };

  const handleDislike = async (matchId) => {
    // TODO: Implement dislike functionality
    console.log('Disliked:', matchId);
    setCurrentMatchIndex(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const currentMatch = matches[currentMatchIndex];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      {showWelcome && <WelcomePopup />}
      
      <div className="max-w-2xl mx-auto">
        {currentMatch ? (
          <div className="relative">
            <ProfileCard
              name={currentMatch.displayName}
              age={currentMatch.age}
              location={currentMatch.universityCampus || currentMatch.location}
              bio={currentMatch.bio}
              imageUrl={currentMatch.photoURL}
              interests={currentMatch.interests}
              onLike={() => handleLike(currentMatch.id)}
              onMessage={() => console.log('Message clicked')}
            />
            
            <div className="absolute bottom-4 left-4 right-4 flex justify-center space-x-4">
              <button
                onClick={() => handleDislike(currentMatch.id)}
                className="p-4 bg-white rounded-full shadow-lg hover:bg-gray-100"
              >
                <XMarkIcon className="h-8 w-8 text-red-500" />
              </button>
              <button
                onClick={() => handleLike(currentMatch.id)}
                className="p-4 bg-white rounded-full shadow-lg hover:bg-gray-100"
              >
                <HeartIcon className="h-8 w-8 text-pink-500" />
              </button>
            </div>
            
            {currentMatch.compatibilityScore && (
              <div className="absolute top-4 right-4 bg-white bg-opacity-80 px-3 py-1 rounded-full">
                <span className="text-sm font-medium text-gray-700">
                  {currentMatch.compatibilityScore}% Match
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              No more matches for now
            </h2>
            <p className="text-gray-600 mb-6">
              Check back later for new potential matches!
            </p>
            <button
              onClick={() => setCurrentMatchIndex(0)}
              className="px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
            >
              Start Over
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Matches;
