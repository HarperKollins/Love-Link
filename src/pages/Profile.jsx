import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

const Profile = () => {
  const { currentUser, updateUserProfile } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [interests, setInterests] = useState([]);
  const [photoURL, setPhotoURL] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
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
    const fetchUserProfile = async () => {
      try {
        if (!currentUser) return;
        
        const userDoc = await db.collection('users').doc(currentUser.uid).get();
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setDisplayName(userData.displayName || '');
          setBio(userData.bio || '');
          setAge(userData.age || '');
          setGender(userData.gender || '');
          setInterests(userData.interests || []);
          setPhotoURL(userData.photoURL || '');
        }
        
        setLoadingProfile(false);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setError('Failed to load profile data. Please try again later.');
        setLoadingProfile(false);
      }
    };
    
    fetchUserProfile();
  }, [currentUser]);

  // Handle photo file selection
  const handlePhotoChange = (e) => {
    if (e.target.files[0]) {
      setPhotoFile(e.target.files[0]);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoURL(reader.result);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  // Handle interest toggle
  const handleInterestToggle = (interest) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter(item => item !== interest));
    } else {
      setInterests([...interests, interest]);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      // Validate inputs
      if (!displayName.trim()) {
        throw new Error('Name is required');
      }
      
      if (age && (isNaN(age) || parseInt(age) < 18 || parseInt(age) > 100)) {
        throw new Error('Please enter a valid age between 18 and 100');
      }
      
      // Upload photo if a new one is selected
      let photoURLToUpdate = photoURL;
      
      if (photoFile) {
        const storage = getStorage();
        const storageRef = ref(storage, `profile_photos/${currentUser.uid}/${Date.now()}_${photoFile.name}`);
        
        const uploadTask = uploadBytesResumable(storageRef, photoFile);
        
        // Monitor upload progress
        uploadTask.on('state_changed', 
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(progress);
          },
          (error) => {
            throw new Error('Failed to upload photo. Please try again.');
          }
        );
        
        // Wait for upload to complete
        await uploadTask;
        
        // Get download URL
        photoURLToUpdate = await getDownloadURL(storageRef);
      }
      
      // Update user profile in Firestore
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        displayName,
        bio,
        age: age ? parseInt(age) : null,
        gender,
        interests,
        photoURL: photoURLToUpdate,
        updatedAt: new Date()
      });
      
      setSuccess('Profile updated successfully!');
      setUploadProgress(0);
      setPhotoFile(null);
    } catch (error) {
      setError(error.message);
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loadingProfile) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Your Profile
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Complete your profile to find better matches
          </p>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mx-4 mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mx-4 mb-4" role="alert">
            <span className="block sm:inline">{success}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Profile Photo */}
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 mb-4">
                {photoURL ? (
                  <img 
                    src={photoURL} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <svg className="h-16 w-16 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                )}
              </div>
              
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Photo
              </label>
              
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-primary-50 file:text-primary-700
                  hover:file:bg-primary-100"
              />
              
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="w-full mt-2">
                  <div className="bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-primary-600 h-2.5 rounded-full" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Uploading: {Math.round(uploadProgress)}%
                  </p>
                </div>
              )}
            </div>
            
            {/* Display Name */}
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                required
              />
            </div>
            
            {/* Age */}
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700">
                Age
              </label>
              <input
                type="number"
                id="age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                min="18"
                max="100"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
            
            {/* Gender */}
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                Gender
              </label>
              <select
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="non-binary">Non-binary</option>
                <option value="other">Other</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            </div>
            
            {/* Bio */}
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                Bio
              </label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows="4"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Tell others about yourself..."
              ></textarea>
            </div>
            
            {/* Interests */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interests
              </label>
              <div className="grid grid-cols-2 gap-2">
                {availableInterests.map((interest) => (
                  <div 
                    key={interest}
                    onClick={() => handleInterestToggle(interest)}
                    className={`px-3 py-2 rounded-md text-sm cursor-pointer transition-colors ${
                      interests.includes(interest)
                        ? 'bg-primary-100 text-primary-800 border border-primary-300'
                        : 'bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    {interest}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
                }`}
              >
                {loading ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
