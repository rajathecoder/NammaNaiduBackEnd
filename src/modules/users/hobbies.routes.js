const express = require('express');
const { body } = require('express-validator');
const { authenticate } = require('../../middleware/auth.middleware');
const { validate } = require('../../middleware/validation.middleware');
const {
  getHobbies,
  saveHobbies,
  getHobbiesByAccountId,
} = require('./hobbies.controller');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Validation rules
const hobbiesValidation = [
  body('hobbies').optional().isArray().withMessage('Hobbies must be an array'),
  body('musicGenres').optional().isArray().withMessage('Music genres must be an array'),
  body('bookTypes').optional().isArray().withMessage('Book types must be an array'),
  body('movieTypes').optional().isArray().withMessage('Movie types must be an array'),
  body('sports').optional().isArray().withMessage('Sports must be an array'),
  body('cuisines').optional().isArray().withMessage('Cuisines must be an array'),
  body('languages').optional().isArray().withMessage('Languages must be an array'),
  validate,
];

/**
 * @route   GET /api/users/hobbies/:accountId
 * @desc    Get hobbies/interests for a user by accountId (for viewing other users' profiles)
 * @access  Private
 * NOTE: This route must come before /hobbies to avoid route conflicts
 */
router.get('/hobbies/:accountId', getHobbiesByAccountId);

/**
 * @route   GET /api/users/hobbies
 * @desc    Get hobbies/interests for authenticated user
 * @access  Private
 */
router.get('/hobbies', getHobbies);

/**
 * @route   POST /api/users/hobbies
 * @desc    Create or update hobbies/interests for authenticated user
 * @access  Private
 */
router.post('/hobbies', hobbiesValidation, saveHobbies);

module.exports = router;
