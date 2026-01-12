const { Op } = require('sequelize');
const SubscriptionPlan = require('../../models/SubscriptionPlan.model');
const SubscriptionTransaction = require('../../models/SubscriptionTransaction.model');
const User = require('../../models/User.model');

// ==================== SUBSCRIPTION PLANS ====================

// Get all subscription plans
const getSubscriptionPlans = async (req, res) => {
  try {
    const { status, planType } = req.query;

    const whereClause = {};
    if (status) {
      whereClause.status = status;
    }
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
};

// Get single subscription plan by ID
const getSubscriptionPlanById = async (req, res) => {
  try {
    const { id } = req.params;

    const plan = await SubscriptionPlan.findByPk(id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Subscription plan not found',
      });
    }

    res.json({
      success: true,
      message: 'Subscription plan retrieved successfully',
      data: plan,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create new subscription plan
const createSubscriptionPlan = async (req, res) => {
  try {
    const { planType, planName, category, amount, offerAmount, maxProfile, contactNoView, validMonth, status } = req.body;

    // Convert string numbers to proper types
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    const numOfferAmount = typeof offerAmount === 'string' ? parseFloat(offerAmount) : offerAmount;
    const numMaxProfile = typeof maxProfile === 'string' ? parseInt(maxProfile, 10) : maxProfile;
    const numContactNoView = typeof contactNoView === 'string' ? parseInt(contactNoView, 10) : contactNoView;
    const numValidMonth = typeof validMonth === 'string' ? parseInt(validMonth, 10) : validMonth;

    // Validate offer amount is not greater than amount
    if (numOfferAmount > numAmount) {
      return res.status(400).json({
        success: false,
        message: 'Offer amount cannot be greater than original amount',
      });
    }

    const plan = await SubscriptionPlan.create({
      planType,
      planName: planName.trim(),
      category: category || 'Both',
      amount: numAmount,
      offerAmount: numOfferAmount,
      maxProfile: numMaxProfile,
      contactNoView: numContactNoView,
      validMonth: numValidMonth,
      status: status || 'active',
    });

    res.status(201).json({
      success: true,
      message: 'Subscription plan created successfully',
      data: plan,
    });
  } catch (error) {
    // Handle Sequelize validation errors
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map((err) => err.message).join(', ');
      return res.status(400).json({
        success: false,
        message: `Validation error: ${messages}`,
      });
    }

    // Handle other errors
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create subscription plan',
    });
  }
};

// Update subscription plan
const updateSubscriptionPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { planType, planName, category, amount, offerAmount, maxProfile, contactNoView, validMonth, status } = req.body;

    const plan = await SubscriptionPlan.findByPk(id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Subscription plan not found',
      });
    }

    // Validate offer amount is not greater than amount
    const finalAmount = amount !== undefined ? amount : plan.amount;
    const finalOfferAmount = offerAmount !== undefined ? offerAmount : plan.offerAmount;
    
    if (finalOfferAmount > finalAmount) {
      return res.status(400).json({
        success: false,
        message: 'Offer amount cannot be greater than original amount',
      });
    }

    await plan.update({
      planType: planType !== undefined ? planType : plan.planType,
      planName: planName !== undefined ? planName : plan.planName,
      category: category !== undefined ? category : plan.category,
      amount: amount !== undefined ? amount : plan.amount,
      offerAmount: offerAmount !== undefined ? offerAmount : plan.offerAmount,
      maxProfile: maxProfile !== undefined ? maxProfile : plan.maxProfile,
      contactNoView: contactNoView !== undefined ? contactNoView : plan.contactNoView,
      validMonth: validMonth !== undefined ? validMonth : plan.validMonth,
      status: status !== undefined ? status : plan.status,
    });

    res.json({
      success: true,
      message: 'Subscription plan updated successfully',
      data: plan,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete subscription plan
const deleteSubscriptionPlan = async (req, res) => {
  try {
    const { id } = req.params;

    const plan = await SubscriptionPlan.findByPk(id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Subscription plan not found',
      });
    }

    // Check if plan has any transactions
    const transactionCount = await SubscriptionTransaction.count({
      where: { planId: id },
    });

    if (transactionCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete plan with existing transactions. Please deactivate it instead.',
      });
    }

    await plan.destroy();

    res.json({
      success: true,
      message: 'Subscription plan deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==================== SUBSCRIPTION TRANSACTIONS ====================

// Get all subscription transactions
const getSubscriptionTransactions = async (req, res) => {
  try {
    const { status, paymentMethod, startDate, endDate, search, page = 1, limit = 20 } = req.query;

    const whereClause = {};
    if (status) {
      whereClause.status = status;
    }
    if (paymentMethod) {
      whereClause.paymentMethod = paymentMethod;
    }
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) {
        whereClause.createdAt[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        whereClause.createdAt[Op.lte] = new Date(endDate);
      }
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    let includeOptions = [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'userCode', 'email', 'phone'],
      },
      {
        model: SubscriptionPlan,
        as: 'plan',
        attributes: ['id', 'planName', 'planType', 'validMonth'],
      },
    ];

    let transactions;
    let totalCount;

    if (search) {
      // Search in paymentId, user name, or user code
      transactions = await SubscriptionTransaction.findAndCountAll({
        where: whereClause,
        include: includeOptions,
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: offset,
      });

      // Filter by search term
      const searchLower = search.toLowerCase();
      transactions.rows = transactions.rows.filter((t) => {
        const paymentId = t.paymentId?.toLowerCase() || '';
        const userName = t.user?.name?.toLowerCase() || '';
        const userCode = t.user?.userCode?.toLowerCase() || '';
        return paymentId.includes(searchLower) || userName.includes(searchLower) || userCode.includes(searchLower);
      });
      totalCount = transactions.rows.length;
    } else {
      transactions = await SubscriptionTransaction.findAndCountAll({
        where: whereClause,
        include: includeOptions,
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: offset,
      });
      totalCount = transactions.count;
    }

    // Format response
    const formattedTransactions = transactions.rows.map((transaction) => {
      const t = transaction.toJSON();
      return {
        id: t.id,
        paymentId: t.paymentId,
        userId: t.userId,
        userName: t.user?.name || 'N/A',
        userCode: t.user?.userCode || 'N/A',
        amount: parseFloat(t.amount),
        planType: t.plan?.planName || 'N/A',
        planName: `${t.plan?.validMonth || 0} ${t.plan?.planType === 'year' ? 'Months' : 'Month'} ${t.plan?.planName || ''}`,
        date: t.createdAt,
        status: t.status,
        paymentMethod: t.paymentMethod,
        paymentGateway: t.paymentGateway,
        transactionId: t.transactionId,
      };
    });

    res.json({
      success: true,
      message: 'Subscription transactions retrieved successfully',
      data: formattedTransactions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalItems: totalCount,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get single transaction by ID
const getSubscriptionTransactionById = async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await SubscriptionTransaction.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'userCode', 'email', 'phone'],
        },
        {
          model: SubscriptionPlan,
          as: 'plan',
        },
      ],
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Subscription transaction not found',
      });
    }

    res.json({
      success: true,
      message: 'Subscription transaction retrieved successfully',
      data: transaction,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create new transaction (usually done by payment gateway webhook)
const createSubscriptionTransaction = async (req, res) => {
  try {
    const { paymentId, userId, planId, amount, status, paymentMethod, paymentGateway, transactionId } = req.body;

    const transaction = await SubscriptionTransaction.create({
      paymentId,
      userId,
      planId,
      amount,
      status: status || 'pending',
      paymentMethod,
      paymentGateway,
      transactionId,
    });

    res.status(201).json({
      success: true,
      message: 'Subscription transaction created successfully',
      data: transaction,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update transaction status
const updateSubscriptionTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, failureReason } = req.body;

    const transaction = await SubscriptionTransaction.findByPk(id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Subscription transaction not found',
      });
    }

    await transaction.update({
      status: status !== undefined ? status : transaction.status,
      failureReason: failureReason !== undefined ? failureReason : transaction.failureReason,
    });

    res.json({
      success: true,
      message: 'Subscription transaction updated successfully',
      data: transaction,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  // Plans
  getSubscriptionPlans,
  getSubscriptionPlanById,
  createSubscriptionPlan,
  updateSubscriptionPlan,
  deleteSubscriptionPlan,
  // Transactions
  getSubscriptionTransactions,
  getSubscriptionTransactionById,
  createSubscriptionTransaction,
  updateSubscriptionTransaction,
};

