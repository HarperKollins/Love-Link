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
      const storageRef = ref(getStorage(), `users/${currentUser.uid}/photos/${Date.now()}`);
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      uploadTask.on('state_changed', 
        (snapshot) => {
          // Progress tracking if needed
        },
        (error) => {
          console.error('Error uploading photo:', error);
          setUploading(false);
        },
        async () => {
          const photoURL = await getDownloadURL(uploadTask.snapshot.ref);
          
          // Update profile photo
          await updateProfile(currentUser, {
            photoURL: photoURL
          });

          // Update Firestore
          const userRef = doc(db, 'users', currentUser.uid);
          await updateDoc(userRef, {
            photoURL: photoURL,
            photos: [...(profile.photos || []), photoURL]
          });

          setProfile(prev => ({
            ...prev,
            photoURL: photoURL,
            photos: [...(prev.photos || []), photoURL]
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
            <div className="relative">
              <img
                src={profile.photoURL || 'https://via.placeholder.com/150'}
                alt="Profile"
                className="w-32 h-32 rounded-full border-4 border-white object-cover"
              />
              {editMode && (
                <label className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg cursor-pointer">
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
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">
              {editMode ? (
                <input
                  type="text"
                  name="displayName"
                  value={profile.displayName}
                  onChange={handleInputChange}
                  className="border-b-2 border-pink-500 focus:outline-none"
                />
              ) : (
                profile.displayName || 'Your Name'
              )}
            </h1>
            <button
              onClick={() => setEditMode(!editMode)}
              className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
            >
              {editMode ? 'Save Profile' : 'Edit Profile'}
            </button>
          </div>

          {editMode ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bio</label>
                  <textarea
                    name="bio"
                    value={profile.bio}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                    rows="3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Interests (comma separated)</label>
                  <input
                    type="text"
                    value={profile.interests.join(', ')}
                    onChange={handleInterestsChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={profile.location}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Age</label>
                  <input
                    type="number"
                    name="age"
                    value={profile.age}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Gender</label>
                  <select
                    name="gender"
                    value={profile.gender}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Looking For</label>
                  <select
                    name="lookingFor"
                    value={profile.lookingFor}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                  >
                    <option value="">Select</option>
                    <option value="friendship">Friendship</option>
                    <option value="dating">Dating</option>
                    <option value="relationship">Relationship</option>
                    <option value="marriage">Marriage</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">University Campus</label>
                  <input
                    type="text"
                    name="universityCampus"
                    value={profile.universityCampus}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                    placeholder="Enter your university campus"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
              >
                Save Changes
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">About Me</h3>
                  <p className="mt-2 text-gray-600">{profile.bio || 'No bio added yet'}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Interests</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {profile.interests.map((interest, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-sm"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Basic Information</h3>
                  <div className="mt-2 space-y-2">
                    <p><span className="font-medium">Location:</span> {profile.location || 'Not specified'}</p>
                    <p><span className="font-medium">Age:</span> {profile.age || 'Not specified'}</p>
                    <p><span className="font-medium">Gender:</span> {profile.gender || 'Not specified'}</p>
                    <p><span className="font-medium">Looking For:</span> {profile.lookingFor || 'Not specified'}</p>
                    <p><span className="font-medium">University Campus:</span> {profile.universityCampus || 'Not specified'}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Additional Information</h3>
                  <div className="mt-2 space-y-2">
                    <p><span className="font-medium">Height:</span> {profile.height || 'Not specified'}</p>
                    <p><span className="font-medium">Education:</span> {profile.education || 'Not specified'}</p>
                    <p><span className="font-medium">Occupation:</span> {profile.occupation || 'Not specified'}</p>
                    <p><span className="font-medium">Relationship Status:</span> {profile.relationshipStatus || 'Not specified'}</p>
                  </div>
                </div>
              </div>

              {profile.photos && profile.photos.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Photos</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {profile.photos.map((photo, index) => (
                      <div key={index} className="relative">
                        <img
                          src={photo}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
