/**
 * Cloudinary Configuration and Upload Service - EXAMPLE FILE
 *
 * IMPORTANT: This is an example configuration file.
 *
 * To use this app:
 * 1. Create a Cloudinary account at https://cloudinary.com
 * 2. Go to Dashboard to find your credentials
 * 3. Create an upload preset:
 *    - Go to Settings > Upload
 *    - Scroll to "Upload presets"
 *    - Click "Add upload preset"
 *    - Set signing mode to "Unsigned"
 *    - Save the preset name
 * 4. Replace the values below with your actual credentials
 * 5. Rename this file to cloudinaryConfig.js (remove .example)
 *
 * SECURITY WARNING:
 * - Never commit actual credentials to public repositories
 * - Add cloudinaryConfig.js to .gitignore
 * - For production, consider using signed uploads with backend
 */

const CLOUDINARY_CLOUD_NAME = 'your-cloud-name';
const CLOUDINARY_API_KEY = 'your-api-key'; // Optional for unsigned uploads
const CLOUDINARY_API_SECRET = 'your-api-secret'; // Keep this secret! Use backend for signed uploads
const CLOUDINARY_UPLOAD_PRESET = 'your-upload-preset'; // Create this in Cloudinary dashboard

/**
 * Upload an image to Cloudinary
 * @param {string} imageUri - Local URI of the image to upload
 * @param {string} folder - Folder name in Cloudinary (e.g., 'horses', 'announcements')
 * @returns {Promise<object>} - Upload result with secure_url
 */
export const uploadImageToCloudinary = async (imageUri, folder = 'general') => {
  try {
    if (!imageUri) {
      throw new Error('No image URI provided');
    }

    // Prepare the image for upload
    const formData = new FormData();

    // Extract file info from URI
    const filename = imageUri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('file', {
      uri: imageUri,
      type: type,
      name: filename,
    });

    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', folder);

    // Upload to Cloudinary
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error?.message || 'Upload failed');
    }

    return result;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};

/**
 * Get optimized image URL from Cloudinary
 * @param {string} publicId - The public ID of the image
 * @param {object} transformations - Optional transformations (width, height, crop, etc.)
 * @returns {string} - Optimized image URL
 */
export const getOptimizedImageUrl = (publicId, transformations = {}) => {
  const baseUrl = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload`;

  const transformStr = Object.entries(transformations)
    .map(([key, value]) => `${key}_${value}`)
    .join(',');

  return transformStr
    ? `${baseUrl}/${transformStr}/${publicId}`
    : `${baseUrl}/${publicId}`;
};

export { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET };

