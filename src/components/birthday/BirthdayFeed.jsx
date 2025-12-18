import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getTodaysBirthdays, getUpcomingBirthdays } from '../../services/birthdayService';
import BirthdayCard from './BirthdayCard';

const BirthdayFeed = ({ currentUser }) => {
  const [todaysBirthdays, setTodaysBirthdays] = useState([]);
  const [upcomingBirthdays, setUpcomingBirthdays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadBirthdays = async () => {
    try {
      setLoading(true);
      const [today, upcoming] = await Promise.all([
        getTodaysBirthdays(),
        getUpcomingBirthdays()
      ]);

      setTodaysBirthdays(today);
      // Filter out today's birthdays from upcoming
      setUpcomingBirthdays(
        upcoming.filter(user => !today.some(t => t.id === user.id))
      );
    } catch (err) {
      setError('Failed to load birthdays');
      console.error('Error loading birthdays:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBirthdays();
  }, []);

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

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Today's Birthdays */}
      {todaysBirthdays.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              🎉 Today's Birthdays
            </h2>
            <span className="text-pink-500 font-medium">
              {todaysBirthdays.length} celebration{todaysBirthdays.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {todaysBirthdays.map(user => (
              <BirthdayCard
                key={user.id}
                user={user}
                currentUser={currentUser}
                onWishSent={loadBirthdays}
              />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Birthdays */}
      {upcomingBirthdays.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              📅 Upcoming Birthdays
            </h2>
            <span className="text-gray-600">
              Next 7 days
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingBirthdays.map(user => (
              <BirthdayCard
                key={user.id}
                user={user}
                currentUser={currentUser}
                onWishSent={loadBirthdays}
              />
            ))}
          </div>
        </div>
      )}

      {todaysBirthdays.length === 0 && upcomingBirthdays.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎂</div>
          <h3 className="text-xl font-semibold mb-2">No Upcoming Birthdays</h3>
          <p className="text-gray-600">
            Check back later for birthday celebrations in your network!
          </p>
        </div>
      )}

      {/* Birthday Tips */}
      <div className="mt-12 bg-pink-50 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Birthday Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="flex items-start space-x-3">
            <span className="text-2xl">🎉</span>
            <div>
              <h4 className="font-medium">Birthday Highlights</h4>
              <p className="text-sm text-gray-600">
                Special profile highlights on your birthday
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-2xl">💝</span>
            <div>
              <h4 className="font-medium">Birthday Wishes</h4>
              <p className="text-sm text-gray-600">
                Send personalized wishes to friends
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-2xl">🔔</span>
            <div>
              <h4 className="font-medium">Birthday Reminders</h4>
              <p className="text-sm text-gray-600">
                Never miss a friend's special day
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

BirthdayFeed.propTypes = {
  currentUser: PropTypes.shape({
    uid: PropTypes.string.isRequired
  }).isRequired
};

export default BirthdayFeed;
