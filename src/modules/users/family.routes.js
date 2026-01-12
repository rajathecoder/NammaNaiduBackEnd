const express = require('express');
const { body } = require('express-validator');
const { authenticate } = require('../../middleware/auth.middleware');
const { validate } = require('../../middleware/validation.middleware');
const {
  getFamilyDetails,
  saveFamilyDetails,
  getFamilyDetailsByAccountId,
} = require('./family.controller');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Validation rules
const familyValidation = [
  body('fatherName').optional().isString().trim(),
  body('fatherOccupation').optional().isString().trim(),
  body('fatherStatus').optional().isIn(['alive', 'late']).withMessage('Father status must be "alive" or "late"'),
  body('motherName').optional().isString().trim(),
  body('motherOccupation').optional().isString().trim(),
  body('motherStatus').optional().isIn(['alive', 'late']).withMessage('Mother status must be "alive" or "late"'),
  body('siblings').optional().isArray().withMessage('Siblings must be an array'),
  validate,
];

/**
 * @route   GET /api/users/family/:accountId
 * @desc    Get family details for a user by accountId (for viewing other users' profiles)
 * @access  Private
 * NOTE: This route must come before /family to avoid route conflicts
 */
router.get('/family/:accountId', getFamilyDetailsByAccountId);

/**
 * @route   GET /api/users/family
 * @desc    Get family details for authenticated user
 * @access  Private
 */
router.get('/family', getFamilyDetails);

/**
 * @route   POST /api/users/family
 * @desc    Create or update family details for authenticated user
 * @access  Private
 */
router.post('/family', familyValidation, saveFamilyDetails);

module.exports = router;
