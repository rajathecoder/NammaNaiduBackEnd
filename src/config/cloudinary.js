const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
// Priority: CLOUDINARY_URL env variable > individual config
if (process.env.CLOUDINARY_URL) {
  // Cloudinary automatically configures from CLOUDINARY_URL environment variable
  // Just ensure it's set
  cloudinary.config();
} else {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'drm83qju3',
    api_key: process.env.CLOUDINARY_API_KEY || '549928934436971',
    api_secret: process.env.CLOUDINARY_API_SECRET || '7vJUIYMyqZHwpdPzhlImIoRj6os',
  });
}

module.exports = cloudinary;
