const express = require('express');
const router = express.Router();
const notificationController = require('./notification.controller');
const { authenticateAdmin } = require('../../middleware/adminAuth.middleware');

// Get notification statistics (Admin only)
router.get('/stats', authenticateAdmin, notificationController.getNotificationStats);

// Send push notification (Admin only)
router.post('/send-push', authenticateAdmin, notificationController.sendPushNotification);

module.exports = router;

