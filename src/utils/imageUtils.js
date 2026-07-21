// Image utility functions for profile picture handling

/**
 * Compress an image file to reduce size while maintaining quality
 * @param {File} file - The image file to compress
 * @param {number} maxWidth - Maximum width for the compressed image
 * @param {number} maxHeight - Maximum height for the compressed image
 * @param {number} quality - Compression quality (0-1)
 * @returns {Promise<string>} - Base64 encoded compressed image
 */
export const compressImage = (file, maxWidth = 400, maxHeight = 400, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to base64 with compression
      const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedBase64);
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    // Create object URL for the image
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Validate image file
 * @param {File} file - The file to validate
 * @param {number} maxSizeInMB - Maximum file size in MB
 * @returns {Object} - Validation result
 */
export const validateImageFile = (file, maxSizeInMB = 5) => {
  const errors = [];
  
  // Check if file exists
  if (!file) {
    errors.push('No file selected');
    return { isValid: false, errors };
  }
  
  // Check file type
  if (!file.type.startsWith('image/')) {
    errors.push('File must be an image');
  }
  
  // Check supported formats
  const supportedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!supportedFormats.includes(file.type)) {
    errors.push('Supported formats: JPG, PNG, GIF, WebP');
  }
  
  // Check file size
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  if (file.size > maxSizeInBytes) {
    errors.push(`File size must be less than ${maxSizeInMB}MB`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Create a preview URL for an image file
 * @param {File} file - The image file
 * @returns {Promise<string>} - Preview URL
 */
export const createImagePreview = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      resolve(e.target.result);
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to create preview'));
    };
    
    reader.readAsDataURL(file);
  });
};

/**
 * Get image dimensions
 * @param {File} file - The image file
 * @returns {Promise<Object>} - Image dimensions {width, height}
 */
export const getImageDimensions = (file) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      });
    };
    
    img.onerror = () => {
      reject(new Error('Failed to get image dimensions'));
    };
    
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Convert file size to human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} - Human readable size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Clean up object URLs to prevent memory leaks
 * @param {string} url - Object URL to revoke
 */
export const cleanupObjectURL = (url) => {
  if (url && url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
};