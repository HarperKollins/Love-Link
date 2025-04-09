import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { sendBirthdayWish, formatBirthdayDate } from '../../services/birthdayService';

const BirthdayCard = ({ user, currentUser, onWishSent }) => {
  const [showWishForm, setShowWishForm] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSendWish = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      setSending(true);
      await sendBirthdayWish(currentUser.uid, user.id, message.trim());
      setMessage('');
      setShowWishForm(false);
      onWishSent?.();
    } catch (error) {
      console.error('Error sending wish:', error);
    } finally {
      setSending(false);
    }
  };

  const birthdayDate = formatBirthdayDate(user.dateOfBirth);
  const isToday = birthdayDate === 'Today';

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${
      isToday ? 'border-2 border-pink-500' : ''
    }`}>
      <div className="relative">
        <img
          src={user.photoURL || '/default-avatar.png'}
          alt={user.displayName}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-2 right-2">
          <span className={`px-3 py-1 rounded-full text-sm ${
            isToday
              ? 'bg-pink-500 text-white'
              : 'bg-white text-gray-800'
          }`}>
            {birthdayDate}
          </span>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-lg">{user.displayName}</h3>
          <span className="text-2xl">🎂</span>
        </div>

        {user.university && (
          <p className="text-gray-600 text-sm">
            📚 {user.university}
          </p>
        )}

        <p className="text-gray-600 text-sm mt-1">
          Turning {user.upcomingAge} years old
        </p>

        {!showWishForm ? (
          <button
            onClick={() => setShowWishForm(true)}
            className="mt-4 w-full bg-pink-500 text-white py-2 px-4 rounded-lg hover:bg-pink-600 transition-colors"
          >
            Send Birthday Wish
          </button>
        ) : (
          <form onSubmit={handleSendWish} className="mt-4">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your birthday wish..."
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
              rows="3"
              maxLength="200"
            />
            <div className="flex justify-end space-x-2 mt-2">
              <button
                type="button"
                onClick={() => setShowWishForm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={sending || !message.trim()}
                className={`px-4 py-2 rounded-lg text-white ${
                  sending || !message.trim()
                    ? 'bg-pink-300 cursor-not-allowed'
                    : 'bg-pink-500 hover:bg-pink-600'
                }`}
              >
                {sending ? 'Sending...' : 'Send'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

BirthdayCard.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    displayName: PropTypes.string.isRequired,
    photoURL: PropTypes.string,
    university: PropTypes.string,
    dateOfBirth: PropTypes.object.isRequired,
    upcomingAge: PropTypes.number.isRequired
  }).isRequired,
  currentUser: PropTypes.shape({
    uid: PropTypes.string.isRequired
  }).isRequired,
  onWishSent: PropTypes.func
};

export default BirthdayCard;
