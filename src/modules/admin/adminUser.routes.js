const express = require('express');
const { body, param, query } = require('express-validator');
const {
  getAdminUsers,
  getAdminUserById,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
  toggleAdminStatus,
} = require('./adminUser.controller');
const { validate } = require('../../middleware/validation.middleware');

const router = express.Router();

// Get all admin users
router.get(
  '/admin-users',
  [
    query('status').optional().isIn(['active', 'inactive']).withMessage('Status must be active or inactive'),
    query('role').optional().isIn(['Super Admin', 'Moderator', 'Customer Support']).withMessage('Invalid role'),
    query('search').optional().trim(),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    validate,
  ],
  getAdminUsers
);

// Get single admin user by ID
router.get('/admin-users/:id', getAdminUserById);

// Create new admin user
router.post(
  '/admin-users',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').trim().isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').optional().isIn(['Super Admin', 'Moderator', 'Customer Support']).withMessage('Invalid role'),
    body('status').optional().isIn(['active', 'inactive']).withMessage('Status must be active or inactive'),
    validate,
  ],
  createAdminUser
);

// Update admin user
router.put(
  '/admin-users/:id',
  [
    param('id').isInt().withMessage('Admin ID must be an integer'),
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('email').optional().trim().isEmail().withMessage('Valid email is required'),
    body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').optional().isIn(['Super Admin', 'Moderator', 'Customer Support']).withMessage('Invalid role'),
    body('status').optional().isIn(['active', 'inactive']).withMessage('Status must be active or inactive'),
    validate,
  ],
  updateAdminUser
);

// Delete admin user
router.delete('/admin-users/:id', deleteAdminUser);

// Toggle admin status
router.patch(
  '/admin-users/:id/status',
  [
    param('id').isInt().withMessage('Admin ID must be an integer'),
    body('status').isIn(['active', 'inactive']).withMessage('Status must be active or inactive'),
    validate,
  ],
  toggleAdminStatus
);

module.exports = router;

