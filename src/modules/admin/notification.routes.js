const express = require('express');
const router = express.Router();
const notificationController = require('./notification.controller');
const { authenticateAdmin } = require('../../middleware/adminAuth.middleware');

// Send push notification (Admin only)
router.post('/send-push', authenticateAdmin, notificationController.sendPushNotification);

module.exports = router;

