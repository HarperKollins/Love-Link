import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import ProfileCard from '../components/ui/ProfileCard';

const Matches = () => {
  const { currentUser } = useAuth();
  const { hasAccess } = useSubscription();
  const [potentialMatches, setPotentialMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userActions, setUserActions] = useState({ likes: [], dislikes: [] });
  const [matches, setMatches] = useState([]);
  const [currentProfile, setCurrentProfile] = useState(null);

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
  const handleLike = async (profileId) => {
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
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header */}
      <div className="bg-white p-4 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800">Discover</h1>
      </div>

      {/* Horizontal Avatar Scroll */}
      <div className="px-4 py-4">
        <Swiper
          slidesPerView="auto"
          spaceBetween={12}
          navigation
          modules={[Navigation]}
          className="avatar-swiper"
        >
          {potentialMatches.map((profile) => (
            <SwiperSlide key={profile.id} className="w-20">
              <button
                onClick={() => setCurrentProfile(profile)}
                className={`w-20 h-20 rounded-full overflow-hidden border-2 ${
                  currentProfile?.id === profile.id
                    ? 'border-pink-500'
                    : 'border-gray-200'
                }`}
              >
                <img
                  src={profile.photoURL}
                  alt={profile.displayName}
                  className="w-full h-full object-cover"
                />
              </button>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Main Profile Card */}
      <div className="px-4">
        <ProfileCard
          {...currentMatch}
          onLike={() => handleLike(currentMatch.id)}
          onMessage={() => handleLike(currentMatch.id)}
        />
      </div>

      {/* Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex justify-center space-x-4">
        <button
          onClick={handleDislike}
          className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center"
        >
          <svg
            className="w-6 h-6 text-pink-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <button
          onClick={() => handleLike(currentMatch.id)}
          className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center"
        >
          <svg
            className="w-6 h-6 text-purple-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Matches;
