import { 
  collection,
  query,
  where,
  getDocs,
  orderBy,
  addDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * Get users with birthdays in the specified range
 */
export const getBirthdayUsers = async (startDate, endDate) => {
  try {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    
    const birthdayUsers = [];
    snapshot.forEach(doc => {
      const userData = doc.data();
      if (!userData.dateOfBirth) return;

      const dob = userData.dateOfBirth.toDate();
      const today = new Date();
      
      // Check if birthday falls within range
      const birthMonth = dob.getMonth();
      const birthDay = dob.getDate();
      const startMonth = startDate.getMonth();
      const startDay = startDate.getDate();
      const endMonth = endDate.getMonth();
      const endDay = endDate.getDate();

      const isInRange = (
        (birthMonth > startMonth || (birthMonth === startMonth && birthDay >= startDay)) &&
        (birthMonth < endMonth || (birthMonth === endMonth && birthDay <= endDay))
      );

      if (isInRange) {
        const age = today.getFullYear() - dob.getFullYear();
        birthdayUsers.push({
          id: doc.id,
          ...userData,
          upcomingAge: age + 1
        });
      }
    });

    return birthdayUsers.sort((a, b) => {
      const aDate = new Date(a.dateOfBirth.toDate());
      const bDate = new Date(b.dateOfBirth.toDate());
      aDate.setFullYear(2000);
      bDate.setFullYear(2000);
      return aDate - bDate;
    });
  } catch (error) {
    console.error('Error getting birthday users:', error);
    throw error;
  }
};

/**
 * Get today's birthdays
 */
export const getTodaysBirthdays = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return getBirthdayUsers(today, tomorrow);
};

/**
 * Get upcoming birthdays (next 7 days)
 */
export const getUpcomingBirthdays = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);
  
  return getBirthdayUsers(today, nextWeek);
};

/**
 * Send birthday wish to a user
 */
export const sendBirthdayWish = async (senderId, recipientId, message) => {
  try {
    const wishData = {
      senderId,
      recipientId,
      message,
      createdAt: serverTimestamp()
    };

    await addDoc(collection(db, 'birthdayWishes'), wishData);
  } catch (error) {
    console.error('Error sending birthday wish:', error);
    throw error;
  }
};

/**
 * Get birthday wishes for a user
 */
export const getBirthdayWishes = async (userId) => {
  try {
    const wishesRef = collection(db, 'birthdayWishes');
    const q = query(
      wishesRef,
      where('recipientId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting birthday wishes:', error);
    throw error;
  }
};

/**
 * Format birthday date to relative time
 */
export const formatBirthdayDate = (dateOfBirth) => {
  if (!dateOfBirth) return '';

  const today = new Date();
  const birthday = new Date(dateOfBirth.toDate());
  birthday.setFullYear(today.getFullYear());

  // If birthday has passed this year, look at next year
  if (birthday < today) {
    birthday.setFullYear(today.getFullYear() + 1);
  }

  const diffTime = Math.abs(birthday - today);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays <= 7) return `In ${diffDays} days`;
  return birthday.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
};
