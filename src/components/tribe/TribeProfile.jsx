import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getUserTribe, getTribeLeaderboard } from '../../services/tribeService';

const TribeProfile = ({ userId }) => {
  const [tribeInfo, setTribeInfo] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadTribeInfo = async () => {
      try {
        setLoading(true);
        const info = await getUserTribe(userId);
        setTribeInfo(info);

        if (info) {
          const leaderboardData = await getTribeLeaderboard(info.university);
          setLeaderboard(leaderboardData);
        }
      } catch (err) {
        setError('Failed to load tribe information');
        console.error('Error loading tribe info:', err);
      } finally {
        setLoading(false);
      }
    };

    loadTribeInfo();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        {error}
      </div>
    );
  }

  if (!tribeInfo) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Not part of any school tribe yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Tribe Badge and Info */}
      <div className="text-center mb-8">
        <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
          <span className="text-4xl">{tribeInfo.badge}</span>
        </div>
        <h2 className="text-2xl font-bold mb-2">{tribeInfo.university} Tribe</h2>
        <p className="text-gray-600">
          Member since {tribeInfo.joinedAt?.toDate().toLocaleDateString()}
        </p>
      </div>

      {/* Tribe Leaderboard */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Tribe Leaderboard</h3>
        <div className="space-y-4">
          {leaderboard.slice(0, 5).map((member, index) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100"
            >
              <div className="flex items-center space-x-3">
                <span className="font-bold text-lg text-gray-500 w-6">
                  {index + 1}
                </span>
                <img
                  src={member.photoURL || '/default-avatar.png'}
                  alt={member.displayName}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium">{member.displayName}</p>
                  <p className="text-sm text-gray-500">
                    {member.activityScore} points
                  </p>
                </div>
              </div>
              {index === 0 && (
                <span className="text-2xl" title="Tribe Leader">
                  👑
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tribe Benefits */}
      <div className="mt-8 p-4 bg-pink-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Tribe Benefits</h3>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-center">
            <span className="mr-2">🎯</span>
            Early access to Crush Week
          </li>
          <li className="flex items-center">
            <span className="mr-2">✨</span>
            Custom emoji reactions
          </li>
          <li className="flex items-center">
            <span className="mr-2">🏆</span>
            Tribe leaderboard visibility
          </li>
          <li className="flex items-center">
            <span className="mr-2">🎉</span>
            Exclusive tribe events
          </li>
        </ul>
      </div>
    </div>
  );
};

TribeProfile.propTypes = {
  userId: PropTypes.string.isRequired
};

export default TribeProfile;
