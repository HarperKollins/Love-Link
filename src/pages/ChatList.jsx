import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

const ChatList = () => {
  const { currentUser } = useAuth();
  const { hasAccess } = useSubscription();
  const [matches, setMatches] = useState([]);
  const [matchProfiles, setMatchProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        if (!currentUser) return;
        
        // Get user's matches
        const userActionsRef = doc(db, 'userActions', currentUser.uid);
        const userActionsDoc = await getDoc(userActionsRef);
        
        if (userActionsDoc.exists()) {
          const userActionsData = userActionsDoc.data();
          setMatches(userActionsData.matches || []);
          
          // Fetch profile data for each match
          const matchProfilesData = [];
          
          for (const matchId of userActionsData.matches || []) {
            const matchUserRef = doc(db, 'users', matchId);
            const matchUserDoc = await getDoc(matchUserRef);
            
            if (matchUserDoc.exists()) {
              matchProfilesData.push({
                id: matchId,
                ...matchUserDoc.data()
              });
            }
          }
          
          setMatchProfiles(matchProfilesData);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching matches:', error);
        setError('Failed to load your matches. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchMatches();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading your matches...</p>
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

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Your Matches</h1>
        </div>
      </div>
      
      {error && (
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {matchProfiles.length === 0 ? (
          <div className="bg-white shadow overflow-hidden sm:rounded-md p-6 text-center">
            <p className="text-gray-500 mb-4">You don't have any matches yet.</p>
            <button
              onClick={() => navigate('/matches')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Find Matches
            </button>
          </div>
        ) : (
          <ul className="bg-white shadow overflow-hidden sm:rounded-md">
            {matchProfiles.map((match) => (
              <li key={match.id} className="border-b border-gray-200 last:border-b-0">
                <Link 
                  to={`/chat/${match.id}`}
                  className="block hover:bg-gray-50"
                >
                  <div className="px-4 py-4 sm:px-6 flex items-center">
                    <div className="flex-shrink-0 h-12 w-12 rounded-full overflow-hidden bg-gray-200">
                      {match.photoURL ? (
                        <img 
                          src={match.photoURL} 
                          alt={match.displayName} 
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <svg className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      )}
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-primary-600 truncate">
                          {match.displayName}
                        </p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                      <div className="mt-1 flex items-center text-sm text-gray-500">
                        <p className="truncate">
                          {match.bio ? (
                            match.bio.length > 60 ? match.bio.substring(0, 60) + '...' : match.bio
                          ) : (
                            'No bio available'
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ChatList;
