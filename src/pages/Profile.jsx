import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
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
    displayName: currentUser?.displayName || '',
    photoURL: currentUser?.photoURL || '',
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
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const defaultAvatar = '/default-avatar.png';

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
        try {
          const docRef = doc(db, 'users', currentUser.uid);
          const docSnap = await getDoc(docRef);
          
          if (!docSnap.exists()) {
            // Create user document if it doesn't exist
            await setDoc(docRef, {
              email: currentUser.email,
              displayName: currentUser.displayName,
              photoURL: currentUser.photoURL,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            });
          }
          
          setProfile(prev => ({
            ...prev,
            ...docSnap.data()
          }));
        } catch (error) {
          console.error('Error fetching profile:', error);
        } finally {
          setLoading(false);
        }
      } else {
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

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      setError('');

      // Check file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please upload an image file');
      }

      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        throw new Error('Image size should be less than 2MB');
      }

      // Create a canvas to compress the image
      const compressImage = (file) => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              
              // Set canvas dimensions (max 500px width/height)
              const maxSize = 500;
              let width = img.width;
              let height = img.height;
              
              if (width > height) {
                if (width > maxSize) {
                  height *= maxSize / width;
                  width = maxSize;
                }
              } else {
                if (height > maxSize) {
                  width *= maxSize / height;
                  height = maxSize;
                }
              }
              
              canvas.width = width;
              canvas.height = height;
              
              // Draw and compress image
              ctx.drawImage(img, 0, 0, width, height);
              const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
              resolve(compressedDataUrl);
            };
            img.src = event.target.result;
          };
          reader.readAsDataURL(file);
        });
      };

      // Compress and upload the image
      const compressedImage = await compressImage(file);
      
      // Create or update user document
      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(userRef, {
        email: currentUser.email,
        displayName: currentUser.displayName,
        photoURL: compressedImage,
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      // Update the profile state
      setProfile(prev => ({
        ...prev,
        photoURL: compressedImage
      }));
      
      // Update Firebase Auth profile
      await updateProfile(currentUser, {
        photoURL: compressedImage
      });
      
      setUploading(false);
    } catch (error) {
      console.error('Error uploading image:', error);
      setError(error.message || 'Failed to upload image. Please try again.');
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Create or update user document
      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(userRef, {
        ...profile,
        updatedAt: serverTimestamp()
      }, { merge: true });

      // Update Firebase Auth profile
      await updateProfile(currentUser, {
        displayName: profile.displayName,
        photoURL: profile.photoURL
      });
      
      setEditMode(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Please log in to view your profile</h2>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <input
        type="file"
        id="photo-upload"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Profile Header */}
        <div className="relative h-48 bg-gradient-to-r from-pink-500 to-purple-600">
          <div className="absolute -bottom-16 left-8">
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200">
                {profile.photoURL ? (
                  <img
                    src={profile.photoURL.startsWith('data:image') ? profile.photoURL : defaultAvatar}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = defaultAvatar;
                    }}
                  />
                ) : (
                  <img
                    src={defaultAvatar}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <button
                onClick={() => document.getElementById('photo-upload').click()}
                className="absolute bottom-0 right-0 bg-white rounded-full p-1 border-2 border-primary-600"
              >
                <svg className="h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
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
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      {uploading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg">
            <p className="text-gray-700">Uploading image...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
