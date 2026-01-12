const express = require('express');
const { getDashboardStats } = require('./dashboard.controller');
const { authenticateAdmin } = require('../../middleware/adminAuth.middleware');

const router = express.Router();

// All routes require admin authentication
router.use(authenticateAdmin);

// Get dashboard statistics
router.get('/dashboard', getDashboardStats);

module.exports = router;
