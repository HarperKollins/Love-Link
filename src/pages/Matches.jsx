import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../services/firebase';

const Matches = () => {
  const { currentUser } = useAuth();
  const { hasAccess } = useSubscription();
  const [potentialMatches, setPotentialMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userActions, setUserActions] = useState({ likes: [], dislikes: [] });
  const [matches, setMatches] = useState([]);

  // Fetch potential matches
  useEffect(() => {
    const fetchPotentialMatches = async () => {
      try {
        if (!currentUser) return;
        
        // Get current user data to match based on interests
        const userDoc = await getDocs(query(collection(db, 'users'), where('uid', '==', currentUser.uid)));
        const userData = userDoc.docs[0]?.data();
        
        if (!userData) {
          setLoading(false);
          return;
        }
        
        // Get user actions (likes, dislikes)
        const userActionsDoc = await getDocs(query(collection(db, 'userActions'), where('uid', '==', currentUser.uid)));
        const userActionsData = userActionsDoc.docs[0]?.data() || { likes: [], dislikes: [], matches: [] };
        setUserActions(userActionsData);
        setMatches(userActionsData.matches || []);
        
        // Get all users
        const usersSnapshot = await getDocs(collection(db, 'users'));
        
        // Filter out current user, already liked/disliked users, and users with no common interests
        const filteredUsers = usersSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(user => 
            user.id !== currentUser.uid && 
            !userActionsData.likes.includes(user.id) && 
            !userActionsData.dislikes.includes(user.id) &&
            user.interests && userData.interests && 
            user.interests.some(interest => userData.interests.includes(interest))
          );
        
        setPotentialMatches(filteredUsers);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching potential matches:', error);
        setError('Failed to load potential matches. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchPotentialMatches();
  }, [currentUser]);

  // Handle like action
  const handleLike = async () => {
    if (!hasAccess) {
      setError('Your trial has ended. Please subscribe to continue using Love Link.');
      return;
    }
    
    try {
      if (currentIndex >= potentialMatches.length) return;
      
      const likedUserId = potentialMatches[currentIndex].id;
      
      // Update user actions in Firestore
      const userActionsRef = doc(db, 'userActions', currentUser.uid);
      await updateDoc(userActionsRef, {
        likes: arrayUnion(likedUserId)
      });
      
      // Check if the liked user has also liked the current user (match)
      const likedUserActionsSnapshot = await getDocs(
        query(collection(db, 'userActions'), where('uid', '==', likedUserId))
      );
      
      const likedUserActions = likedUserActionsSnapshot.docs[0]?.data();
      
      if (likedUserActions && likedUserActions.likes && likedUserActions.likes.includes(currentUser.uid)) {
        // It's a match! Update both users' matches array
        await updateDoc(userActionsRef, {
          matches: arrayUnion(likedUserId)
        });
        
        const likedUserActionsRef = doc(db, 'userActions', likedUserId);
        await updateDoc(likedUserActionsRef, {
          matches: arrayUnion(currentUser.uid)
        });
        
        // Update local state
        setMatches([...matches, likedUserId]);
        
        // Show match notification
        alert('It\'s a match! You can now chat with this person.');
      }
      
      // Move to next potential match
      setCurrentIndex(currentIndex + 1);
    } catch (error) {
      console.error('Error handling like action:', error);
      setError('Failed to process your action. Please try again.');
    }
  };

  // Handle dislike action
  const handleDislike = async () => {
    if (!hasAccess) {
      setError('Your trial has ended. Please subscribe to continue using Love Link.');
      return;
    }
    
    try {
      if (currentIndex >= potentialMatches.length) return;
      
      const dislikedUserId = potentialMatches[currentIndex].id;
      
      // Update user actions in Firestore
      const userActionsRef = doc(db, 'userActions', currentUser.uid);
      await updateDoc(userActionsRef, {
        dislikes: arrayUnion(dislikedUserId)
      });
      
      // Move to next potential match
      setCurrentIndex(currentIndex + 1);
    } catch (error) {
      console.error('Error handling dislike action:', error);
      setError('Failed to process your action. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading potential matches...</p>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Subscription Required
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Your free trial has ended. Please subscribe to continue using Love Link.
            </p>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <button
              onClick={() => navigate('/subscription')}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              View Subscription Plans
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (potentialMatches.length === 0 || currentIndex >= potentialMatches.length) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              No More Matches
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              You've gone through all potential matches. Check back later for new users!
            </p>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <button
              onClick={() => navigate('/chat')}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Go to Chats
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentMatch = potentialMatches[currentIndex];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 pb-20">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        {/* Profile Photo */}
        <div className="w-full h-80 bg-gray-200 relative">
          {currentMatch.photoURL ? (
            <img 
              src={currentMatch.photoURL} 
              alt={currentMatch.displayName} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <svg className="h-24 w-24 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          )}
          
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
            <h2 className="text-white text-xl font-semibold">
              {currentMatch.displayName}, {currentMatch.age || '?'}
            </h2>
          </div>
        </div>
        
        {/* Profile Details */}
        <div className="px-4 py-5 sm:p-6">
          {currentMatch.bio && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Bio</h3>
              <p className="text-gray-900">{currentMatch.bio}</p>
            </div>
          )}
          
          {currentMatch.interests && currentMatch.interests.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {currentMatch.interests.map((interest) => (
                  <span 
                    key={interest}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="px-4 py-4 sm:px-6 flex justify-center space-x-4">
          <button
            onClick={handleDislike}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <button
            onClick={handleLike}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-full shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Matches;
