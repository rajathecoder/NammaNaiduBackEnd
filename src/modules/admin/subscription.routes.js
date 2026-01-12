const express = require('express');
const { body, param, query } = require('express-validator');
const {
  getSubscriptionPlans,
  getSubscriptionPlanById,
  createSubscriptionPlan,
  updateSubscriptionPlan,
  deleteSubscriptionPlan,
  getSubscriptionTransactions,
  getSubscriptionTransactionById,
  createSubscriptionTransaction,
  updateSubscriptionTransaction,
} = require('./subscription.controller');
const { validate } = require('../../middleware/validation.middleware');
const { authenticateAdmin } = require('../../middleware/adminAuth.middleware');

const router = express.Router();

// All routes require admin authentication
router.use(authenticateAdmin);

// ==================== SUBSCRIPTION PLANS ROUTES ====================

// Get all subscription plans
router.get(
  '/plans',
  [
    query('status').optional().isIn(['active', 'inactive']).withMessage('Status must be active or inactive'),
    query('planType').optional().isIn(['months', 'year']).withMessage('Plan type must be months or year'),
    validate,
  ],
  getSubscriptionPlans
);

// Get single subscription plan by ID
router.get('/plans/:id', getSubscriptionPlanById);

// Create new subscription plan
router.post(
  '/plans',
  [
    body('planType').isIn(['months', 'year']).withMessage('Plan type must be months or year'),
    body('planName').trim().notEmpty().withMessage('Plan name is required'),
    body('category').isIn(['Male', 'Female', 'Both']).withMessage('Category must be Male, Female, or Both'),
    body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
    body('offerAmount').isFloat({ min: 0 }).withMessage('Offer amount must be a positive number'),
    body('maxProfile').isInt({ min: 0 }).withMessage('Max profile must be a non-negative integer'),
    body('contactNoView').isInt({ min: 0 }).withMessage('Contact number view must be a non-negative integer'),
    body('validMonth').isInt({ min: 1, max: 12 }).withMessage('Valid month must be between 1 and 12'),
    body('status').optional().isIn(['active', 'inactive']).withMessage('Status must be active or inactive'),
    validate,
  ],
  createSubscriptionPlan
);

// Update subscription plan
router.put(
  '/plans/:id',
  [
    param('id').isInt().withMessage('Plan ID must be an integer'),
    body('planType').optional().isIn(['months', 'year']).withMessage('Plan type must be months or year'),
    body('planName').optional().trim().notEmpty().withMessage('Plan name cannot be empty'),
    body('category').optional().isIn(['Male', 'Female', 'Both']).withMessage('Category must be Male, Female, or Both'),
    body('amount').optional().isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
    body('offerAmount').optional().isFloat({ min: 0 }).withMessage('Offer amount must be a positive number'),
    body('maxProfile').optional().isInt({ min: 0 }).withMessage('Max profile must be a non-negative integer'),
    body('contactNoView').optional().isInt({ min: 0 }).withMessage('Contact number view must be a non-negative integer'),
    body('validMonth').optional().isInt({ min: 1, max: 12 }).withMessage('Valid month must be between 1 and 12'),
    body('status').optional().isIn(['active', 'inactive']).withMessage('Status must be active or inactive'),
    validate,
  ],
  updateSubscriptionPlan
);

// Delete subscription plan
router.delete('/plans/:id', deleteSubscriptionPlan);

// ==================== SUBSCRIPTION TRANSACTIONS ROUTES ====================

// Get all subscription transactions
router.get(
  '/transactions',
  [
    query('status').optional().isIn(['success', 'pending', 'failed']).withMessage('Invalid status'),
    query('paymentMethod').optional().trim(),
    query('startDate').optional().isISO8601().withMessage('Start date must be a valid date'),
    query('endDate').optional().isISO8601().withMessage('End date must be a valid date'),
    query('search').optional().trim(),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    validate,
  ],
  getSubscriptionTransactions
);

// Get single transaction by ID
router.get('/transactions/:id', getSubscriptionTransactionById);

// Create new transaction
router.post(
  '/transactions',
  [
    body('paymentId').trim().notEmpty().withMessage('Payment ID is required'),
    body('userId').isInt().withMessage('User ID must be an integer'),
    body('planId').isInt().withMessage('Plan ID must be an integer'),
    body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
    body('status').optional().isIn(['success', 'pending', 'failed']).withMessage('Invalid status'),
    body('paymentMethod').trim().notEmpty().withMessage('Payment method is required'),
    body('paymentGateway').optional().trim(),
    body('transactionId').optional().trim(),
    validate,
  ],
  createSubscriptionTransaction
);

// Update transaction status
router.put(
  '/transactions/:id',
  [
    param('id').isInt().withMessage('Transaction ID must be an integer'),
    body('status').optional().isIn(['success', 'pending', 'failed']).withMessage('Invalid status'),
    body('failureReason').optional().trim(),
    validate,
  ],
  updateSubscriptionTransaction
);

module.exports = router;

