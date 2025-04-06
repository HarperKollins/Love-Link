import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../services/firebase';
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion } from 'firebase/firestore';

export default function Matches() {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('uid', '!=', currentUser.uid));
        const querySnapshot = await getDocs(q);
        const usersList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUsers(usersList);
      } catch (error) {
        setError('Failed to fetch users');
        console.error('Error fetching users:', error);
      }
      setLoading(false);
    };

    fetchUsers();
  }, [currentUser]);

  const handleLike = async (userId) => {
    try {
      const currentUserDoc = doc(db, 'users', currentUser.uid);
      await updateDoc(currentUserDoc, {
        likedUsers: arrayUnion(userId)
      });

      // Check if the other user has liked the current user
      const otherUserDoc = doc(db, 'users', userId);
      const otherUserData = await getDocs(otherUserDoc);
      const otherUserLikes = otherUserData.data()?.likedUsers || [];

      if (otherUserLikes.includes(currentUser.uid)) {
        // It's a match!
        await updateDoc(currentUserDoc, {
          matches: arrayUnion(userId)
        });
        await updateDoc(otherUserDoc, {
          matches: arrayUnion(currentUser.uid)
        });
        alert('It\'s a match!');
      }
    } catch (error) {
      console.error('Error liking user:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading matches...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Find Your Match</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {users.map((user) => (
            <div key={user.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="aspect-w-16 aspect-h-9">
                <img
                  src={user.photoURL || 'https://via.placeholder.com/150'}
                  alt={user.displayName}
                  className="object-cover w-full h-64"
                />
              </div>
              <div className="p-4">
                <h2 className="text-xl font-semibold text-gray-900">{user.displayName}</h2>
                <p className="mt-2 text-gray-600">{user.bio || 'No bio yet'}</p>
                <button
                  onClick={() => handleLike(user.id)}
                  className="mt-4 w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Like
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 