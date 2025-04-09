import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from './firebase';

// Calculate compatibility score between two users (0-100)
const calculateCompatibilityScore = (user1, user2) => {
  let score = 0;
  let totalFactors = 0;

  // 1. Campus Match (25 points)
  if (user1.universityCampus && user2.universityCampus) {
    if (user1.universityCampus === user2.universityCampus) {
      score += 25;
    }
  }
  totalFactors += 25;

  // 2. Course/Department Match (20 points)
  if (user1.course && user2.course) {
    if (user1.course === user2.course) {
      score += 20;
    } else if (user1.department === user2.department) {
      score += 15;
    }
  }
  totalFactors += 20;

  // 3. Year of Study Match (15 points)
  if (user1.yearOfStudy && user2.yearOfStudy) {
    const yearDiff = Math.abs(user1.yearOfStudy - user2.yearOfStudy);
    if (yearDiff === 0) {
      score += 15;
    } else if (yearDiff === 1) {
      score += 10;
    } else if (yearDiff === 2) {
      score += 5;
    }
  }
  totalFactors += 15;

  // 4. Interests Match (20 points)
  if (user1.interests && user2.interests) {
    const commonInterests = user1.interests.filter(interest => 
      user2.interests.includes(interest)
    );
    const interestScore = (commonInterests.length / Math.max(user1.interests.length, user2.interests.length)) * 20;
    score += interestScore;
  }
  totalFactors += 20;

  // 5. Study Habits Match (10 points)
  if (user1.studyHabits && user2.studyHabits) {
    const commonHabits = user1.studyHabits.filter(habit => 
      user2.studyHabits.includes(habit)
    );
    const habitScore = (commonHabits.length / Math.max(user1.studyHabits.length, user2.studyHabits.length)) * 10;
    score += habitScore;
  }
  totalFactors += 10;

  // 6. Extracurricular Activities Match (10 points)
  if (user1.extracurriculars && user2.extracurriculars) {
    const commonActivities = user1.extracurriculars.filter(activity => 
      user2.extracurriculars.includes(activity)
    );
    const activityScore = (commonActivities.length / Math.max(user1.extracurriculars.length, user2.extracurriculars.length)) * 10;
    score += activityScore;
  }
  totalFactors += 10;

  // Calculate final score
  return Math.round((score / totalFactors) * 100);
};

// Get recommended matches for a user
export const getRecommendedMatches = async (currentUser, limit = 10) => {
  try {
    // Get all users except current user
    const usersRef = collection(db, 'users');
    const q = query(
      usersRef,
      where('uid', '!=', currentUser.uid),
      orderBy('uid'),
      limit(50) // Get more users to filter from
    );

    const snapshot = await getDocs(q);
    const users = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Calculate compatibility scores
    const matches = users.map(user => ({
      ...user,
      compatibilityScore: calculateCompatibilityScore(currentUser, user)
    }));

    // Sort by compatibility score and return top matches
    return matches
      .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
      .slice(0, limit);
  } catch (error) {
    console.error('Error getting recommended matches:', error);
    return [];
  }
};

// Get potential matches based on specific criteria
export const getPotentialMatches = async (currentUser, criteria = {}) => {
  try {
    const { 
      universityCampus,
      course,
      department,
      yearOfStudy,
      interests,
      studyHabits,
      extracurriculars,
      limit = 10
    } = criteria;

    let q = collection(db, 'users');

    // Add filters based on criteria
    const filters = [];
    
    if (universityCampus) {
      filters.push(where('universityCampus', '==', universityCampus));
    }
    
    if (course) {
      filters.push(where('course', '==', course));
    }
    
    if (department) {
      filters.push(where('department', '==', department));
    }

    if (yearOfStudy) {
      filters.push(where('yearOfStudy', '==', yearOfStudy));
    }

    // Add all filters to the query
    q = query(q, ...filters, where('uid', '!=', currentUser.uid), limit(50));

    const snapshot = await getDocs(q);
    const users = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Filter by interests if specified
    let filteredUsers = users;
    if (interests && interests.length > 0) {
      filteredUsers = users.filter(user => 
        user.interests && user.interests.some(interest => interests.includes(interest))
      );
    }

    // Filter by study habits if specified
    if (studyHabits && studyHabits.length > 0) {
      filteredUsers = filteredUsers.filter(user => 
        user.studyHabits && user.studyHabits.some(habit => studyHabits.includes(habit))
      );
    }

    // Filter by extracurriculars if specified
    if (extracurriculars && extracurriculars.length > 0) {
      filteredUsers = filteredUsers.filter(user => 
        user.extracurriculars && user.extracurriculars.some(activity => extracurriculars.includes(activity))
      );
    }

    // Calculate compatibility scores
    const matches = filteredUsers.map(user => ({
      ...user,
      compatibilityScore: calculateCompatibilityScore(currentUser, user)
    }));

    // Sort by compatibility score and return top matches
    return matches
      .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
      .slice(0, limit);
  } catch (error) {
    console.error('Error getting potential matches:', error);
    return [];
  }
}; 