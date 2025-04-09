import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { validateImage } from '../../services/uploadService';

const CreatePost = ({ currentUser, onPostCreated }) => {
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      // Use validateImage from uploadService
      validateImage(file);
      setError('');

      // Preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setImageFile(file);
    } catch (err) {
      setError(err.message);
      e.target.value = ''; // Reset file input
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate input
    if (!content.trim() && !imageFile) {
      setError('Please add some text or an image to your post.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onPostCreated(content.trim(), imageFile);
      
      // Clear form on success
      setContent('');
      setImageFile(null);
      setImagePreview(null);
      
      // Show success message
      const successMessage = document.createElement('div');
      successMessage.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg';
      successMessage.textContent = 'Post created successfully! 🎉';
      document.body.appendChild(successMessage);
      setTimeout(() => successMessage.remove(), 3000);
    } catch (err) {
      setError(err.message || 'Failed to create post. Please try again.');
      console.error('Error creating post:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <form onSubmit={handleSubmit}>
        <div className="flex items-start space-x-4">
          <img
            src={currentUser.photoURL || '/default-avatar.png'}
            alt={currentUser.displayName}
            className="w-10 h-10 rounded-full"
          />
          <div className="flex-1">
            {error && (
              <div className="text-red-500 text-sm mb-2">
                {error}
              </div>
            )}

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full px-4 py-2 text-gray-700 bg-gray-100 rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-pink-500"
              rows="3"
            />

            {imagePreview && (
              <div className="relative mt-2">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-h-48 rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                    setError('');
                  }}
                  className="absolute top-2 right-2 bg-gray-800 bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-75 transition-opacity"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            )}

            <div className="mt-4 flex items-center justify-between">
              <div className="flex space-x-2">
                <label className="cursor-pointer text-gray-500 hover:text-gray-700 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <span className="flex items-center space-x-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Add Photo</span>
                  </span>
                </label>
              </div>
              <button
                type="submit"
                disabled={isSubmitting || (!content.trim() && !imageFile)}
                className={`px-4 py-2 rounded-full font-medium ${isSubmitting || (!content.trim() && !imageFile)
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-pink-500 text-white hover:bg-pink-600'} transition-colors`}
              >
                {isSubmitting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

CreatePost.propTypes = {
  currentUser: PropTypes.shape({
    uid: PropTypes.string.isRequired,
    photoURL: PropTypes.string,
    displayName: PropTypes.string,
    university: PropTypes.string
  }).isRequired,
  onPostCreated: PropTypes.func.isRequired
};

export default CreatePost;
