import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { PaperAirplaneIcon, AcademicCapIcon, UserGroupIcon } from '@heroicons/react/24/outline';

const Chat = ({ matchId }) => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [matchData, setMatchData] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchMatchData = async () => {
      try {
        const matchDoc = await getDoc(doc(db, 'users', matchId));
        if (matchDoc.exists()) {
          setMatchData(matchDoc.data());
        }
      } catch (error) {
        console.error('Error fetching match data:', error);
        setError('Failed to load match information');
      }
    };

    fetchMatchData();
  }, [matchId]);

  useEffect(() => {
    if (!currentUser || !matchId) return;

    const chatId = [currentUser.uid, matchId].sort().join('_');
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(newMessages);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser, matchId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const chatId = [currentUser.uid, matchId].sort().join('_');
      const messagesRef = collection(db, 'chats', chatId, 'messages');

      await addDoc(messagesRef, {
        text: newMessage,
        senderId: currentUser.uid,
        timestamp: serverTimestamp(),
        read: false
      });

      // Update last message in chat document
      const chatRef = doc(db, 'chats', chatId);
      await updateDoc(chatRef, {
        lastMessage: newMessage,
        lastMessageTime: serverTimestamp(),
        lastMessageSender: currentUser.uid
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="bg-white p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <img
            src={matchData?.photoURL || '/default-avatar.png'}
            alt={matchData?.displayName}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <h3 className="font-semibold text-gray-800">{matchData?.displayName}</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <AcademicCapIcon className="h-4 w-4" />
              <span>{matchData?.course} - Year {matchData?.yearOfStudy}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(message => (
          <div
            key={message.id}
            className={`flex ${message.senderId === currentUser.uid ? 'justify-end' : 'justify-start'
              }`}
          >
            <div
              className={`max-w-xs md:max-w-md rounded-lg p-3 ${message.senderId === currentUser.uid
                ? 'bg-pink-500 text-white'
                : 'bg-gray-100 text-gray-800'
                }`}
            >
              <p className="text-sm">{message.text}</p>
              <p className="text-xs mt-1 opacity-70">
                {message.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={sendMessage} className="bg-white p-4 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="p-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </div>
      </form>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative m-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
    </div>
  );
};

export default Chat; 