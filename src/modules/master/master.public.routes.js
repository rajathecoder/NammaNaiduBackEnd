const express = require('express');
const { param, query } = require('express-validator');
const { getMastersByType } = require('../admin/master.controller');
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

// Public route - Get masters by type (no authentication required, only active by default)
router.get(
  '/masters/:type',
  [
    param('type')
      .isIn(validTypes)
      .withMessage('Invalid master type'),
    query('status').optional().isIn(['active', 'inactive']).withMessage('Status must be active or inactive'),
    validate,
  ],
  (req, res, next) => {
    // Force status to 'active' for public endpoint if not specified
    req.query.status = req.query.status || 'active';
    getMastersByType(req, res, next);
  }
);

module.exports = router;

