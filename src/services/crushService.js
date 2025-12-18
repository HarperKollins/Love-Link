import { 
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  query,
  where,
  and,
  serverTimestamp,
  deleteDoc,
  updateDoc
} from 'firebase/firestore';
import { db } from './firebase';

const CRUSHES_PER_WEEK = 3;

/**
 * Get the current crush week's start and end dates
 */
const getCrushWeekDates = () => {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setHours(0, 0, 0, 0);
  startOfWeek.setDate(now.getDate() - now.getDay()); // Start from Sunday

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  return { startOfWeek, endOfWeek };
};

/**
 * Send an anonymous crush to another user
 */
export const sendCrush = async (senderId, recipientId) => {
  try {
    // Check if users exist
    const recipientDoc = await getDoc(doc(db, 'users', recipientId));
    if (!recipientDoc.exists()) {
      throw new Error('Recipient not found');
    }

    // Get current week's crushes
    const { startOfWeek, endOfWeek } = getCrushWeekDates();
    const crushesRef = collection(db, 'crushes');
    const weekCrushesQuery = query(
      crushesRef,
      where('senderId', '==', senderId),
      where('createdAt', '>=', startOfWeek),
      where('createdAt', '<=', endOfWeek)
    );
    
    const weekCrushes = await getDocs(weekCrushesQuery);
    if (weekCrushes.size >= CRUSHES_PER_WEEK) {
      throw new Error(`You can only send ${CRUSHES_PER_WEEK} crushes per week`);
    }

    // Check if already sent to this user this week
    const existingCrushQuery = query(
      crushesRef,
      where('senderId', '==', senderId),
      where('recipientId', '==', recipientId),
      where('createdAt', '>=', startOfWeek),
      where('createdAt', '<=', endOfWeek)
    );
    const existingCrush = await getDocs(existingCrushQuery);
    if (!existingCrush.empty) {
      throw new Error('You already sent a crush to this user this week');
    }

    // Create the crush
    const crushData = {
      senderId,
      recipientId,
      createdAt: serverTimestamp(),
      status: 'pending' // pending, matched, expired
    };

    const crushDoc = await addDoc(crushesRef, crushData);

    // Check for mutual crush
    const mutualCrushQuery = query(
      crushesRef,
      where('senderId', '==', recipientId),
      where('recipientId', '==', senderId),
      where('status', '==', 'pending')
    );
    const mutualCrush = await getDocs(mutualCrushQuery);

    if (!mutualCrush.empty) {
      // It's a match!
      const mutualCrushDoc = mutualCrush.docs[0];
      await updateDoc(doc(crushesRef, crushDoc.id), { status: 'matched' });
      await updateDoc(doc(crushesRef, mutualCrushDoc.id), { status: 'matched' });

      // Create a match record
      await addDoc(collection(db, 'matches'), {
        users: [senderId, recipientId],
        crushIds: [crushDoc.id, mutualCrushDoc.id],
        createdAt: serverTimestamp()
      });

      return {
        status: 'matched',
        recipientId,
        matchDetails: {
          matchId: crushDoc.id,
          recipientName: recipientDoc.data().displayName,
          recipientPhoto: recipientDoc.data().photoURL
        }
      };
    }

    return { status: 'sent' };
  } catch (error) {
    console.error('Error sending crush:', error);
    throw error;
  }
};

/**
 * Get user's sent crushes for the current week
 */
export const getSentCrushes = async (userId) => {
  try {
    const { startOfWeek, endOfWeek } = getCrushWeekDates();
    const crushesRef = collection(db, 'crushes');
    const sentCrushesQuery = query(
      crushesRef,
      where('senderId', '==', userId),
      where('createdAt', '>=', startOfWeek),
      where('createdAt', '<=', endOfWeek)
    );

    const snapshot = await getDocs(sentCrushesQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting sent crushes:', error);
    throw error;
  }
};

/**
 * Get user's matches
 */
export const getUserMatches = async (userId) => {
  try {
    // Get all users except current user
    const usersRef = collection(db, 'users');
    const usersQuery = query(
      usersRef,
      where('uid', '!=', userId)
    );

    const usersSnapshot = await getDocs(usersQuery);
    const matches = [];

    // For demo, show some sample matches
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      
      // Add as a match with 50% probability
      if (Math.random() > 0.5) {
        matches.push({
          ...userData,
          matchId: userDoc.id,
          createdAt: serverTimestamp(),
          matchPercentage: Math.floor(Math.random() * 30) + 70, // 70-100%
          commonInterests: ['Music', 'Travel', 'Food'].slice(0, Math.floor(Math.random() * 3) + 1)
        });
      }
    }

    return matches;
  } catch (error) {
    console.error('Error getting matches:', error);
    throw error;
  }
};

/**
 * Get remaining crushes for the week
 */
export const getRemainingCrushes = async (userId) => {
  const sentCrushes = await getSentCrushes(userId);
  return CRUSHES_PER_WEEK - sentCrushes.length;
};
