const express = require('express');
const { body } = require('express-validator');
const { authenticate } = require('../../middleware/auth.middleware');
const { validate } = require('../../middleware/validation.middleware');
const {
  getHoroscopeDetails,
  saveHoroscopeDetails,
  getHoroscopeDetailsByAccountId,
} = require('./horoscope.controller');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Validation rules
const horoscopeValidation = [
  body('rasi').optional().isString().trim(),
  body('natchathiram').optional().isString().trim(),
  body('birthPlace').optional().isString().trim(),
  body('birthTime').optional().isString().trim(),
  validate,
];

/**
 * @route   GET /api/users/horoscope/:accountId
 * @desc    Get horoscope details for a user by accountId (for viewing other users' profiles)
 * @access  Private
 * NOTE: This route must come before /horoscope to avoid route conflicts
 */
router.get('/horoscope/:accountId', getHoroscopeDetailsByAccountId);

/**
 * @route   GET /api/users/horoscope
 * @desc    Get horoscope details for authenticated user
 * @access  Private
 */
router.get('/horoscope', getHoroscopeDetails);

/**
 * @route   POST /api/users/horoscope
 * @desc    Create or update horoscope details for authenticated user
 * @access  Private
 */
router.post('/horoscope', horoscopeValidation, saveHoroscopeDetails);

module.exports = router;
