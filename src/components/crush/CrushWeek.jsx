import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { sendCrush, getRemainingCrushes } from '../../services/crushService';
import Confetti from 'react-confetti';

const CrushWeek = ({ currentUser }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [remainingCrushes, setRemainingCrushes] = useState(3);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMatch, setShowMatch] = useState(false);
  const [matchDetails, setMatchDetails] = useState(null);

  useEffect(() => {
    loadUsers();
    updateRemainingCrushes();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      // Get users from the same university if user is in a tribe
      const userDoc = await getDocs(doc(db, 'users', currentUser.uid));
      const userData = userDoc.data();

      let usersQuery = query(
        collection(db, 'users'),
        where('uid', '!=', currentUser.uid)
      );

      if (userData?.university) {
        usersQuery = query(
          collection(db, 'users'),
          where('uid', '!=', currentUser.uid),
          where('university', '==', userData.university)
        );
      }

      const snapshot = await getDocs(usersQuery);
      const fetchedUsers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setUsers(fetchedUsers);
    } catch (err) {
      setError('Failed to load users');
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateRemainingCrushes = async () => {
    try {
      const remaining = await getRemainingCrushes(currentUser.uid);
      setRemainingCrushes(remaining);
    } catch (err) {
      console.error('Error getting remaining crushes:', err);
    }
  };

  const handleSendCrush = async (recipientId) => {
    try {
      setLoading(true);
      const result = await sendCrush(currentUser.uid, recipientId);
      
      if (result.status === 'matched') {
        setMatchDetails(result.matchDetails);
        setShowMatch(true);
      } else {
        // Show success toast
        alert('Crush sent successfully! They'll be notified if it's mutual.');
      }

      await updateRemainingCrushes();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.department?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {showMatch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Confetti
            width={window.innerWidth}
            height={window.innerHeight}
            recycle={false}
            numberOfPieces={500}
          />
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
            <div className="text-4xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold mb-4">It's a Match!</h2>
            <div className="mb-6">
              <img
                src={matchDetails?.recipientPhoto || '/default-avatar.png'}
                alt={matchDetails?.recipientName}
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
              />
              <p className="text-xl">{matchDetails?.recipientName}</p>
            </div>
            <button
              onClick={() => setShowMatch(false)}
              className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600"
            >
              Start Chatting
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Crush Week</h2>
          <p className="text-gray-600">
            Send anonymous crushes to people you're interested in.
            If they crush on you too, it's a match! 💕
          </p>
          <div className="mt-4 bg-pink-50 rounded-lg p-4 inline-block">
            <p className="text-pink-700">
              Remaining crushes this week: <span className="font-bold">{remainingCrushes}</span>
            </p>
          </div>
        </div>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by name or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map(user => (
            <div
              key={user.id}
              className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center space-x-4">
                <img
                  src={user.photoURL || '/default-avatar.png'}
                  alt={user.displayName}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-semibold">{user.displayName}</h3>
                  <p className="text-sm text-gray-600">{user.department}</p>
                  {user.university && (
                    <p className="text-sm text-gray-600">{user.university}</p>
                  )}
                </div>
              </div>
              
              <button
                onClick={() => handleSendCrush(user.id)}
                disabled={loading || remainingCrushes === 0}
                className={`mt-4 w-full py-2 px-4 rounded-lg text-white font-medium ${
                  loading || remainingCrushes === 0
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-pink-500 hover:bg-pink-600'
                }`}
              >
                {loading ? 'Sending...' : 'Send Crush'}
              </button>
            </div>
          ))}
        </div>

        {loading && filteredUsers.length === 0 && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto"></div>
          </div>
        )}

        {!loading && filteredUsers.length === 0 && (
          <div className="text-center py-8 text-gray-600">
            No users found matching your search
          </div>
        )}
      </div>
    </div>
  );
};

CrushWeek.propTypes = {
  currentUser: PropTypes.shape({
    uid: PropTypes.string.isRequired
  }).isRequired
};

export default CrushWeek;
