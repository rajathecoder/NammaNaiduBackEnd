const express = require('express');
const { query } = require('express-validator');
const SubscriptionPlan = require('../../models/SubscriptionPlan.model');
const { validate } = require('../../middleware/validation.middleware');

const router = express.Router();

// Public route - Get active subscription plans (no authentication required)
router.get(
  '/plans',
  [
    query('status').optional().isIn(['active', 'inactive']).withMessage('Status must be active or inactive'),
    query('planType').optional().isIn(['months', 'year']).withMessage('Plan type must be months or year'),
    validate,
  ],
  async (req, res) => {
    try {
      const { status = 'active', planType } = req.query;

      const whereClause = {
        status: status, // Default to active plans only for public access
      };
      
      if (planType) {
        whereClause.planType = planType;
      }

      const plans = await SubscriptionPlan.findAll({
        where: whereClause,
        order: [['createdAt', 'DESC']],
      });

      res.json({
        success: true,
        message: 'Subscription plans retrieved successfully',
        data: plans,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

module.exports = router;

