const express = require('express');
const { body } = require('express-validator');
const {
  uploadPersonPhotos,
  getPersonPhotos,
} = require('./photo.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { validate } = require('../../middleware/validation.middleware');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Upload person photos and proof image
router.post(
  '/photos',
  [
    body('personid')
      .notEmpty()
      .withMessage('personid is required')
      .isUUID()
      .withMessage('personid must be a valid UUID'),
    body('personphoto')
      .isArray({ max: 5 })
      .withMessage('personphoto must be an array with maximum 5 items'),
    body('personphoto.*.photoplacement')
      .isInt({ min: 1, max: 5 })
      .withMessage('photoplacement must be between 1 and 5'),
    body('personphoto.*.photobase64')
      .notEmpty()
      .withMessage('photobase64 is required for each photo')
      .isString()
      .withMessage('photobase64 must be a string'),
    body('proofbase64')
      .notEmpty()
      .withMessage('proofbase64 is required')
      .isString()
      .withMessage('proofbase64 must be a string'),
    validate,
  ],
  uploadPersonPhotos
);

// Get person photos
router.get('/photos/:personId', getPersonPhotos);

module.exports = router;
