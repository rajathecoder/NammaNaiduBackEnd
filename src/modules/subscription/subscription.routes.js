const express = require('express');
const { body } = require('express-validator');
const { authenticate } = require('../../middleware/auth.middleware');
const { validate } = require('../../middleware/validation.middleware');
const { mockPurchaseSubscription } = require('./subscription.controller');

const router = express.Router();

// All routes here require authentication
router.use(authenticate);

// Mock Purchase Route
router.post(
    '/purchase',
    [
        body('planId').isInt().withMessage('Plan ID must be an integer'),
        validate,
    ],
    mockPurchaseSubscription
);

module.exports = router;
