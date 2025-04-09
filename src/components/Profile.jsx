import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { updateProfile } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

export default function Profile() {
  const { currentUser } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentUser) {
      setDisplayName(currentUser.displayName || '');
      setPhotoURL(currentUser.photoURL || '');
      // Fetch additional user data from Firestore
      const fetchUserData = async () => {
        try {
          const userDoc = doc(db, 'users', currentUser.uid);
          const userData = await userDoc.get();
          if (userData.exists()) {
            setBio(userData.data().bio || '');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      };
      fetchUserData();
    }
  }, [currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setMessage('');
      setLoading(true);

      // Update Firebase Auth profile
      await updateProfile(currentUser, {
        displayName,
        photoURL: photoURL || null,
      });

      // Update Firestore user document
      const userDoc = doc(db, 'users', currentUser.uid);
      await updateDoc(userDoc, {
        displayName,
        photoURL: photoURL || null,
        bio,
        updatedAt: new Date(),
      });

      setMessage('Profile updated successfully');
    } catch (error) {
      setError('Failed to update profile');
      console.error('Error updating profile:', error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Profile Settings</h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>Update your profile information and preferences.</p>
            </div>
            <form onSubmit={handleSubmit} className="mt-5 space-y-6">
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                  <span className="block sm:inline">{error}</span>
                </div>
              )}
              {message && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                  <span className="block sm:inline">{message}</span>
                </div>
              )}
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
                  Display Name
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="displayName"
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="photoURL" className="block text-sm font-medium text-gray-700">
                  Photo URL
                </label>
                <div className="mt-1">
                  <input
                    type="url"
                    name="photoURL"
                    id="photoURL"
                    value={photoURL}
                    onChange={(e) => setPhotoURL(e.target.value)}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                  Bio
                </label>
                <div className="mt-1">
                  <textarea
                    id="bio"
                    name="bio"
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 