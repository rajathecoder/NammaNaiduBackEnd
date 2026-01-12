const express = require('express');
const { body, param } = require('express-validator');
const {
  getMastersByType,
  getMasterById,
  createMaster,
  updateMaster,
  deleteMaster,
} = require('./master.controller');
const { validate } = require('../../middleware/validation.middleware');

const router = express.Router();

// Valid master types
const validTypes = [
  'religion',
  'caste',
  'occupation',
  'location',
  'education',
  'employment-type',
  'income-currency',
  'income-range',
];

// Get all masters by type
router.get(
  '/:type',
  [
    param('type')
      .isIn(validTypes)
      .withMessage('Invalid master type'),
    validate,
  ],
  getMastersByType
);

// Get single master by ID
router.get('/:type/:id', getMasterById);

// Create new master
router.post(
  '/:type',
  [
    param('type')
      .isIn(validTypes)
      .withMessage('Invalid master type'),
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('code').optional().trim(),
    body('parentId').optional().isInt().withMessage('Parent ID must be an integer'),
    body('status')
      .optional()
      .isIn(['active', 'inactive'])
      .withMessage('Status must be active or inactive'),
    body('order').optional().isInt().withMessage('Order must be an integer'),
    validate,
  ],
  createMaster
);

// Update master
router.put(
  '/:type/:id',
  [
    param('type')
      .isIn(validTypes)
      .withMessage('Invalid master type'),
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('code').optional().trim(),
    body('parentId').optional().isInt().withMessage('Parent ID must be an integer'),
    body('status')
      .optional()
      .isIn(['active', 'inactive'])
      .withMessage('Status must be active or inactive'),
    body('order').optional().isInt().withMessage('Order must be an integer'),
    validate,
  ],
  updateMaster
);

// Delete master
router.delete('/:type/:id', deleteMaster);

module.exports = router;





















