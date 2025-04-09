import { 
  collection,
  doc,
  getDoc,
  updateDoc,
  query,
  where,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * Verify and apply a school tribe code
 */
export const verifyTribeCode = async (code, userId) => {
  try {
    // Check if code exists and is valid
    const tribeCodesRef = collection(db, 'tribeCodes');
    const q = query(tribeCodesRef, where('code', '==', code));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      throw new Error('Invalid tribe code');
    }

    const tribeData = snapshot.docs[0].data();
    const now = new Date();
    const expiryDate = tribeData.expiryDate?.toDate();

    // Validate code
    if (expiryDate && now > expiryDate) {
      throw new Error('This tribe code has expired');
    }

    if (tribeData.maxUses && tribeData.usedCount >= tribeData.maxUses) {
      throw new Error('This tribe code has reached its usage limit');
    }

    // Check if user already has a tribe
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();

    if (userData.tribeCode) {
      throw new Error('You are already part of a school tribe');
    }

    // Update user with tribe information
    await updateDoc(userRef, {
      tribeCode: code,
      university: tribeData.university,
      tribeBadge: tribeData.badge,
      tribeJoinedAt: serverTimestamp()
    });

    // Increment code usage count
    const tribeCodeRef = doc(tribeCodesRef, snapshot.docs[0].id);
    await updateDoc(tribeCodeRef, {
      usedCount: (tribeData.usedCount || 0) + 1
    });

    return {
      university: tribeData.university,
      badge: tribeData.badge
    };
  } catch (error) {
    console.error('Error verifying tribe code:', error);
    throw error;
  }
};

/**
 * Get tribe information for a user
 */
export const getUserTribe = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    const userData = userDoc.data();
    return userData.tribeCode ? {
      code: userData.tribeCode,
      university: userData.university,
      badge: userData.tribeBadge,
      joinedAt: userData.tribeJoinedAt
    } : null;
  } catch (error) {
    console.error('Error getting user tribe:', error);
    throw error;
  }
};

/**
 * Get tribe leaderboard
 */
export const getTribeLeaderboard = async (university) => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(
      usersRef,
      where('university', '==', university),
      where('tribeCode', '!=', null)
    );
    
    const snapshot = await getDocs(q);
    const users = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      users.push({
        id: doc.id,
        displayName: data.displayName,
        photoURL: data.photoURL,
        activityScore: calculateActivityScore(data),
        joinedAt: data.tribeJoinedAt
      });
    });

    // Sort by activity score
    return users.sort((a, b) => b.activityScore - a.activityScore);
  } catch (error) {
    console.error('Error getting tribe leaderboard:', error);
    throw error;
  }
};

/**
 * Calculate user's activity score based on various factors
 */
const calculateActivityScore = (userData) => {
  let score = 0;

  // Profile completeness
  if (userData.photoURL) score += 10;
  if (userData.bio) score += 5;
  if (userData.interests?.length) score += userData.interests.length * 2;

  // Engagement (posts, comments, reactions)
  score += (userData.postCount || 0) * 5;
  score += (userData.commentCount || 0) * 2;
  score += (userData.reactionCount || 0);

  // Active days streak
  score += (userData.activeStreak || 0) * 3;

  return score;
};
