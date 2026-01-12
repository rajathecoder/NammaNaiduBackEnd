const express = require('express');
const { body } = require('express-validator');
const {
  storeFcmToken,
  getMyTokens,
  removeFcmToken,
} = require('./device.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { validate } = require('../../middleware/validation.middleware');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Store or update FCM token
router.post(
  '/fcm-token',
  [
    body('uuid')
      .optional()
      .isUUID()
      .withMessage('UUID must be a valid UUID format'),
    body('fcmToken')
      .notEmpty()
      .withMessage('FCM token is required')
      .isString()
      .withMessage('FCM token must be a string'),
    body('device')
      .optional()
      .isIn(['mobile', 'web'])
      .withMessage('Device must be either "mobile" or "web"'),
    body('deviceModel')
      .optional()
      .isString()
      .withMessage('Device model must be a string'),
    body('ip')
      .optional()
      .isString()
      .withMessage('IP address must be a string'),
  ],
  validate,
  storeFcmToken
);

// Get all active tokens for current user
router.get('/fcm-tokens', getMyTokens);

// Remove/deactivate FCM token
router.delete('/fcm-token/:tokenId', removeFcmToken);

module.exports = router;

