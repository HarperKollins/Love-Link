import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { ArrowLeftIcon, PencilIcon } from '@heroicons/react/24/outline';
import { updateProfile } from 'firebase/auth';

const Profile = () => {
  const { currentUser, updateUserProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    displayName: '',
    photoURL: '',
    bio: '',
    interests: [],
    location: '',
    age: '',
    gender: '',
    lookingFor: '',
    height: '',
    education: '',
    occupation: '',
    relationshipStatus: '',
    languages: [],
    photos: [],
    universityCampus: ''
  });
  const [editMode, setEditMode] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  // Available interests
  const availableInterests = [
    'Music', 'Movies', 'Sports', 'Reading', 'Travel', 
    'Cooking', 'Art', 'Photography', 'Dancing', 'Gaming',
    'Fitness', 'Technology', 'Fashion', 'Nature', 'Politics',
    'Science', 'History', 'Languages', 'Writing', 'Volunteering'
  ];

  // Load user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (currentUser) {
        const docRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data());
        }
        setLoading(false);
      }
    };
    fetchProfile();
  }, [currentUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleInterestsChange = (e) => {
    const interests = e.target.value.split(',').map(item => item.trim());
    setProfile(prev => ({
      ...prev,
      interests
    }));
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const storage = getStorage();
      const storageRef = ref(storage, `users/${currentUser.uid}/profile/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      uploadTask.on('state_changed', 
        (snapshot) => {
          // Progress tracking if needed
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload is ' + progress + '% done');
        },
        (error) => {
          console.error('Error uploading photo:', error);
          setUploading(false);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          
          // Update auth profile
          await updateProfile(currentUser, {
            photoURL: downloadURL
          });

          // Update Firestore
          const userRef = doc(db, 'users', currentUser.uid);
          await updateDoc(userRef, {
            photoURL: downloadURL
          });

          // Update local state
          setProfile(prev => ({
            ...prev,
            photoURL: downloadURL
          }));
          
          setUploading(false);
        }
      );
    } catch (error) {
      console.error('Error uploading photo:', error);
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(currentUser, {
        displayName: profile.displayName,
        photoURL: profile.photoURL
      });

      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, profile);
      
      setEditMode(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Profile Header */}
        <div className="relative h-48 bg-gradient-to-r from-pink-500 to-purple-600">
          <div className="absolute -bottom-16 left-8">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-gray-200">
                {uploading ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500"></div>
                  </div>
                ) : (
                  <img
                    src={profile.photoURL || 'https://via.placeholder.com/150'}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/150';
                    }}
                  />
                )}
              </div>
              {editMode && (
                <label className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <svg className="w-6 h-6 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="p-8 pt-20">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">
              {editMode ? (
                <input
                  type="text"
                  name="displayName"
                  value={profile.displayName}
                  onChange={handleInputChange}
                  className="border-b-2 border-pink-500 focus:outline-none px-2 py-1"
                  placeholder="Your Name"
                />
              ) : (
                profile.displayName || 'Your Name'
              )}
            </h1>
            <button
              onClick={() => setEditMode(!editMode)}
              className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
            >
              {editMode ? 'Save Profile' : 'Edit Profile'}
            </button>
          </div>

          {editMode ? (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                    <textarea
                      name="bio"
                      value={profile.bio}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                      rows="4"
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={profile.location}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                      placeholder="Your location"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">University Campus</label>
                    <input
                      type="text"
                      name="universityCampus"
                      value={profile.universityCampus}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                      placeholder="Your university campus"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                    <input
                      type="number"
                      name="age"
                      value={profile.age}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                      placeholder="Your age"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                    <select
                      name="gender"
                      value={profile.gender}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Looking For</label>
                    <select
                      name="lookingFor"
                      value={profile.lookingFor}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                    >
                      <option value="">Select what you're looking for</option>
                      <option value="friendship">Friendship</option>
                      <option value="dating">Dating</option>
                      <option value="relationship">Relationship</option>
                      <option value="marriage">Marriage</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Interests</label>
                    <input
                      type="text"
                      value={profile.interests.join(', ')}
                      onChange={handleInterestsChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                      placeholder="Enter interests, separated by commas"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">About Me</h3>
                  <p className="text-gray-600">{profile.bio || 'No bio added yet'}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
                  <div className="space-y-3">
                    <p className="flex items-center text-gray-600">
                      <span className="font-medium w-32">Location:</span>
                      <span>{profile.location || 'Not specified'}</span>
                    </p>
                    <p className="flex items-center text-gray-600">
                      <span className="font-medium w-32">Age:</span>
                      <span>{profile.age || 'Not specified'}</span>
                    </p>
                    <p className="flex items-center text-gray-600">
                      <span className="font-medium w-32">Gender:</span>
                      <span>{profile.gender || 'Not specified'}</span>
                    </p>
                    <p className="flex items-center text-gray-600">
                      <span className="font-medium w-32">Looking For:</span>
                      <span>{profile.lookingFor || 'Not specified'}</span>
                    </p>
                    <p className="flex items-center text-gray-600">
                      <span className="font-medium w-32">Campus:</span>
                      <span>{profile.universityCampus || 'Not specified'}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.interests && profile.interests.length > 0 ? (
                      profile.interests.map((interest, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-pink-100 text-pink-600 rounded-full text-sm"
                        >
                          {interest}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-600">No interests added yet</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
