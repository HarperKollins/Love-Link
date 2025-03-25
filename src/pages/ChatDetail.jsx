import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { doc, getDoc, collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';

const ChatDetail = () => {
  const { matchId } = useParams();
  const { currentUser } = useAuth();
  const { hasAccess } = useSubscription();
  const [matchProfile, setMatchProfile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Fetch match profile and messages
  useEffect(() => {
    const fetchMatchProfile = async () => {
      try {
        if (!currentUser || !matchId) return;
        
        // Get match profile
        const matchUserRef = doc(db, 'users', matchId);
        const matchUserDoc = await getDoc(matchUserRef);
        
        if (matchUserDoc.exists()) {
          setMatchProfile({
            id: matchId,
            ...matchUserDoc.data()
          });
        } else {
          setError('User not found.');
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching match profile:', error);
        setError('Failed to load user profile. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchMatchProfile();
  }, [currentUser, matchId]);

  // Listen for messages
  useEffect(() => {
    if (!currentUser || !matchId) return;
    
    // Create a chat ID that's the same regardless of who initiated the chat
    const chatId = [currentUser.uid, matchId].sort().join('_');
    
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const messagesQuery = query(messagesRef, orderBy('timestamp', 'asc'));
    
    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messageList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setMessages(messageList);
    }, (error) => {
      console.error('Error fetching messages:', error);
      setError('Failed to load messages. Please try again later.');
    });
    
    return () => unsubscribe();
  }, [currentUser, matchId]);

  // Send a new message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!hasAccess) {
      setError('Your trial has ended. Please subscribe to continue using Love Link.');
      return;
    }
    
    if (!newMessage.trim()) return;
    
    try {
      // Create a chat ID that's the same regardless of who initiated the chat
      const chatId = [currentUser.uid, matchId].sort().join('_');
      
      // Add message to Firestore
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        text: newMessage,
        senderId: currentUser.uid,
        receiverId: matchId,
        timestamp: serverTimestamp()
      });
      
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading chat...</p>
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

  if (!matchProfile) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              User Not Found
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              The user you're trying to chat with could not be found.
            </p>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <button
              onClick={() => navigate('/chat')}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Back to Chats
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Chat Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <button
              onClick={() => navigate('/chat')}
              className="mr-4 text-gray-500 hover:text-gray-700"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            
            <div className="flex items-center">
              <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden bg-gray-200">
                {matchProfile.photoURL ? (
                  <img 
                    src={matchProfile.photoURL} 
                    alt={matchProfile.displayName} 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <svg className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  {matchProfile.displayName}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="max-w-7xl mx-auto py-2 px-4 sm:px-6 lg:px-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        </div>
      )}
      
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 mb-16">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No messages yet. Say hello!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div 
              key={message.id}
              className={`flex ${message.senderId === currentUser.uid ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-xs sm:max-w-md px-4 py-2 rounded-lg ${
                  message.senderId === currentUser.uid 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-gray-200 text-gray-900'
                }`}
              >
                <p>{message.text}</p>
                <p className={`text-xs mt-1 ${
                  message.senderId === currentUser.uid 
                    ? 'text-primary-100' 
                    : 'text-gray-500'
                }`}>
                  {message.timestamp ? new Date(message.timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Sending...'}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 fixed bottom-16 left-0 right-0">
        <form onSubmit={handleSendMessage} className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex rounded-md shadow-sm">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="focus:ring-primary-500 focus:border-primary-500 flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300"
              placeholder="Type a message..."
            />
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-r-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatDetail;
