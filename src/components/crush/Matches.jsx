import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getUserMatches } from '../../services/crushService';

const Matches = ({ currentUser }) => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadMatches();
  }, [currentUser.uid]);

  const loadMatches = async () => {
    try {
      setLoading(true);
      const userMatches = await getUserMatches(currentUser.uid);
      setMatches(userMatches.sort((a, b) => b.createdAt - a.createdAt));
    } catch (err) {
      setError('Failed to load matches');
      console.error('Error loading matches:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatMatchDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
      Math.floor((date - new Date()) / (1000 * 60 * 60 * 24)),
      'day'
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-3xl font-bold text-center mb-8">Your Matches</h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
          </div>
        ) : matches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((match) => (
              <div
                key={match.matchId}
                className="bg-white rounded-lg shadow-md overflow-hidden transform transition-transform hover:scale-105"
              >
                <div className="relative">
                  <img
                    src={match.photoURL || '/default-avatar.png'}
                    alt={match.displayName}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-pink-500 text-white px-2 py-1 rounded-full text-sm">
                    {match.matchPercentage}% Match
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-semibold mb-2">{match.displayName}</h3>
                  <p className="text-gray-600 mb-2">
                    {match.university || 'University not set'}
                  </p>
                  {match.commonInterests && match.commonInterests.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-500 mb-1">Common Interests:</p>
                      <div className="flex flex-wrap gap-2">
                        {match.commonInterests.map((interest, index) => (
                          <span
                            key={index}
                            className="bg-pink-100 text-pink-800 text-xs px-2 py-1 rounded-full"
                          >
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <button
                    className="w-full bg-pink-500 text-white py-2 rounded-md hover:bg-pink-600 transition-colors"
                    onClick={() => window.alert('Chat feature coming soon!')}
                  >
                    Start Chat
                  </button>
                  {match.matchedUser.department && (
                    <p className="text-gray-600 text-sm mb-1">
                      🎓 {match.matchedUser.department}
                    </p>
                  )}

                  {match.matchedUser.zodiacSign && (
                    <p className="text-gray-600 text-sm mb-3">
                      ⭐ {match.matchedUser.zodiacSign}
                    </p>
                  )}

                  <div className="mt-4 space-y-2">
                    <button
                      onClick={() => {/* Navigate to chat */}}
                      className="w-full bg-pink-500 text-white py-2 px-4 rounded-lg hover:bg-pink-600 transition-colors"
                    >
                      Start Chatting
                    </button>
                    
                    <button
                      onClick={() => {/* Navigate to profile */}}
                      className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💝</div>
            <h3 className="text-xl font-semibold mb-2">No matches yet</h3>
            <p className="text-gray-600">
              Keep sending crushes! When someone you've crushed on also crushes on you,
              you'll see them here.
            </p>
          </div>
        )}
      </div>

      {/* Tips Section */}
      <div className="mt-8 bg-pink-50 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Tips for More Matches</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start space-x-3">
            <span className="text-2xl">📸</span>
            <div>
              <h4 className="font-medium">Add Your Best Photos</h4>
              <p className="text-sm text-gray-600">
                Profiles with clear, friendly photos get more attention
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-2xl">✍️</span>
            <div>
              <h4 className="font-medium">Complete Your Profile</h4>
              <p className="text-sm text-gray-600">
                Share your interests and what makes you unique
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-2xl">🎯</span>
            <div>
              <h4 className="font-medium">Be Active</h4>
              <p className="text-sm text-gray-600">
                Regular participation increases your visibility
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-2xl">💫</span>
            <div>
              <h4 className="font-medium">Join Your School Tribe</h4>
              <p className="text-sm text-gray-600">
                Connect with students from your university
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

Matches.propTypes = {
  currentUser: PropTypes.shape({
    uid: PropTypes.string.isRequired
  }).isRequired
};

export default Matches;
