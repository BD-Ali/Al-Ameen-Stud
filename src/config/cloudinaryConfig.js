/**
 * Cloudinary Configuration and Upload Service
 * Handles image uploads to Cloudinary
 */

const CLOUDINARY_CLOUD_NAME = 'dtbynupyx';
const CLOUDINARY_API_KEY = '696232838498944';
const CLOUDINARY_UPLOAD_PRESET = 'al-ameen-stable'; // You'll need to create this in Cloudinary dashboard

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

    // Create form data
    const formData = new FormData();

    // Extract file info from URI
    const filename = imageUri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    // Append image file
    formData.append('file', {
      uri: imageUri,
      type: type,
      name: filename,
    });

    // Add upload parameters
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', folder);
    formData.append('cloud_name', CLOUDINARY_CLOUD_NAME);

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

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Upload failed');
    }

    return {
      success: true,
      url: data.secure_url,
      publicId: data.public_id,
      width: data.width,
      height: data.height,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Delete an image from Cloudinary
 * @param {string} publicId - The public ID of the image to delete
 * @returns {Promise<object>} - Delete result
 */
export const deleteImageFromCloudinary = async (publicId) => {
  try {
    if (!publicId) {
      throw new Error('No public ID provided');
    }

    // Generate timestamp
    const timestamp = Math.round(new Date().getTime() / 1000);

    // Create signature (Note: This should ideally be done server-side)
    // For production, implement a backend endpoint to handle deletions securely
    const signature = generateSignature(publicId, timestamp);

    const formData = new FormData();
    formData.append('public_id', publicId);
    formData.append('signature', signature);
    formData.append('api_key', CLOUDINARY_API_KEY);
    formData.append('timestamp', timestamp);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/destroy`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Delete failed');
    }

    return {
      success: true,
      result: data.result,
    };
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Generate a signature for authenticated requests
 * Note: In production, this should be done server-side
 */
const generateSignature = (publicId, timestamp) => {
  // This is a simplified version. In production, use crypto-js or a backend endpoint
  // For now, we'll use unsigned uploads with upload presets
  return '';
};

/**
 * Get optimized image URL with transformations
 * @param {string} url - Original Cloudinary URL
 * @param {object} options - Transformation options
 * @returns {string} - Transformed URL
 */
export const getOptimizedImageUrl = (url, options = {}) => {
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }

  const {
    width = 800,
    height = null,
    quality = 'auto',
    format = 'auto',
  } = options;

  // Build transformation string
  let transformation = `w_${width},q_${quality},f_${format}`;
  if (height) {
    transformation += `,h_${height},c_fill`;
  }

  // Insert transformation into URL
  const parts = url.split('/upload/');
  if (parts.length === 2) {
    return `${parts[0]}/upload/${transformation}/${parts[1]}`;
  }

  return url;
};

export const cloudinaryConfig = {
  cloudName: CLOUDINARY_CLOUD_NAME,
  apiKey: CLOUDINARY_API_KEY,
};

export default {
  uploadImageToCloudinary,
  deleteImageFromCloudinary,
  getOptimizedImageUrl,
  cloudinaryConfig,
};

