/**
 * Service for handling image uploads to the external drive server
 */

const UPLOAD_ENDPOINT = 'https://drive-upload-server.onrender.com/upload';
const FALLBACK_ENDPOINT = 'https://api.cloudinary.com/v1_1/demo/image/upload';

/**
 * Upload an image file to the external drive server
 * @param {File} file - The image file to upload
 * @param {string} type - Type of upload (profile, post, etc.)
 * @returns {Promise<string>} The URL of the uploaded image
 */
export const uploadImage = async (file, type = 'general') => {
  try {
    // Try primary endpoint
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('type', type);

      const response = await fetch(UPLOAD_ENDPOINT, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status: ${response.status}`);
      }

      const data = await response.json();
      return data.url;
    } catch (primaryError) {
      console.warn('Primary upload failed, trying fallback:', primaryError);
      
      // Try fallback endpoint (Cloudinary demo)
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'docs_upload_example_us_preset');

      const response = await fetch(FALLBACK_ENDPOINT, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Fallback upload failed with status: ${response.status}`);
      }

      const data = await response.json();
      return data.secure_url;
    }
  } catch (error) {
    console.error('All image upload attempts failed:', error);
    throw new Error('Failed to upload image. Please try again.');
  }
};

/**
 * Validate image file before upload
 * @param {File} file - The image file to validate
 * @returns {boolean} Whether the file is valid
 */
export const validateImage = (file) => {
  const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid file type. Please upload a JPG, PNG, or GIF.');
  }

  if (file.size > maxSize) {
    throw new Error('File too large. Maximum size is 5MB.');
  }

  return true;
};
