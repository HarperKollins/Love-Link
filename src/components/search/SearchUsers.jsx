import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, startAfter, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useInView } from 'react-intersection-observer';

const USERS_PER_PAGE = 20;

const SearchUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastVisible, setLastVisible] = useState(null);
  const [filters, setFilters] = useState({
    name: '',
    department: '',
    university: '',
    interests: '',
    zodiacSign: ''
  });

  const { ref, inView } = useInView({
    threshold: 0.5
  });

  const buildQuery = (isInitial = true) => {
    let baseQuery = collection(db, 'users');
    let constraints = [];

    if (filters.name) {
      constraints.push(where('nameKeywords', 'array-contains', filters.name.toLowerCase()));
    }
    if (filters.department) {
      constraints.push(where('department', '==', filters.department));
    }
    if (filters.university) {
      constraints.push(where('university', '==', filters.university));
    }
    if (filters.interests) {
      constraints.push(where('interests', 'array-contains', filters.interests.toLowerCase()));
    }
    if (filters.zodiacSign) {
      constraints.push(where('zodiacSign', '==', filters.zodiacSign));
    }

    let finalQuery = query(
      baseQuery,
      ...constraints,
      orderBy('createdAt', 'desc'),
      limit(USERS_PER_PAGE)
    );

    if (!isInitial && lastVisible) {
      finalQuery = query(
        baseQuery,
        ...constraints,
        orderBy('createdAt', 'desc'),
        startAfter(lastVisible),
        limit(USERS_PER_PAGE)
      );
    }

    return finalQuery;
  };

  const fetchUsers = async (isInitial = true) => {
    try {
      setLoading(true);
      const q = buildQuery(isInitial);
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setHasMore(false);
        return;
      }

      const fetchedUsers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setUsers(prev => isInitial ? fetchedUsers : [...prev, ...fetchedUsers]);
      setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === USERS_PER_PAGE);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(true);
  }, [filters]);

  useEffect(() => {
    if (inView && hasMore && !loading) {
      fetchUsers(false);
    }
  }, [inView]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Search Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <input
          type="text"
          placeholder="Search by name..."
          value={filters.name}
          onChange={(e) => handleFilterChange('name', e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500"
        />
        <input
          type="text"
          placeholder="Department/Course..."
          value={filters.department}
          onChange={(e) => handleFilterChange('department', e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500"
        />
        <input
          type="text"
          placeholder="University..."
          value={filters.university}
          onChange={(e) => handleFilterChange('university', e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500"
        />
        <input
          type="text"
          placeholder="Interests/Hobbies..."
          value={filters.interests}
          onChange={(e) => handleFilterChange('interests', e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500"
        />
        <select
          value={filters.zodiacSign}
          onChange={(e) => handleFilterChange('zodiacSign', e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500"
        >
          <option value="">Select Zodiac Sign</option>
          <option value="Aries">Aries</option>
          <option value="Taurus">Taurus</option>
          <option value="Gemini">Gemini</option>
          <option value="Cancer">Cancer</option>
          <option value="Leo">Leo</option>
          <option value="Virgo">Virgo</option>
          <option value="Libra">Libra</option>
          <option value="Scorpio">Scorpio</option>
          <option value="Sagittarius">Sagittarius</option>
          <option value="Capricorn">Capricorn</option>
          <option value="Aquarius">Aquarius</option>
          <option value="Pisces">Pisces</option>
        </select>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map(user => (
          <div key={user.id} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-center space-x-4">
              <img
                src={user.photoURL || '/default-avatar.png'}
                alt={user.displayName}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <h3 className="font-semibold text-lg">{user.displayName}</h3>
                <p className="text-sm text-gray-600">{user.university}</p>
                <p className="text-sm text-gray-600">{user.department}</p>
                {user.zodiacSign && (
                  <p className="text-sm text-pink-600">{user.zodiacSign}</p>
                )}
              </div>
            </div>
            {user.interests && user.interests.length > 0 && (
              <div className="mt-3">
                <div className="flex flex-wrap gap-2">
                  {user.interests.map((interest, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-pink-100 text-pink-800 text-xs rounded-full"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Loading & Load More */}
      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto"></div>
        </div>
      )}
      
      {!loading && hasMore && (
        <div ref={ref} className="h-20"></div>
      )}

      {!loading && !hasMore && users.length > 0 && (
        <p className="text-center text-gray-600 mt-4">No more results</p>
      )}

      {!loading && users.length === 0 && (
        <p className="text-center text-gray-600 mt-4">No users found matching your criteria</p>
      )}
    </div>
  );
};

export default SearchUsers;
