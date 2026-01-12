const User = require('../../models/User.model');
const SubscriptionTransaction = require('../../models/SubscriptionTransaction.model');
const Notification = require('../../models/Notification.model');
const { sendPushNotificationToUser, sendPushNotificationToUsers } = require('../../services/push-notification.service');
const { Op } = require('sequelize');

/**
 * Send push notification to users based on target audience
 * POST /api/admin/notifications/send-push
 */
const sendPushNotification = async (req, res) => {
  try {
    const { title, message, target } = req.body;

    // Validation
    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Title and message are required',
      });
    }

    if (!target || !['all', 'premium', 'active'].includes(target)) {
      return res.status(400).json({
        success: false,
        message: 'Target must be one of: all, premium, active',
      });
    }

    let targetUsers = [];

    // Get users based on target audience
    if (target === 'all') {
      // Get all active users
      targetUsers = await User.findAll({
        where: {
          isActive: true,
          role: 'user',
        },
        attributes: ['accountId', 'id'],
      });
    } else if (target === 'premium') {
      // Get users with active premium subscriptions
      const premiumUsers = await SubscriptionTransaction.findAll({
        where: {
          status: 'success',
        },
        include: [
          {
            model: User,
            as: 'user',
            where: {
              isActive: true,
              role: 'user',
            },
            attributes: ['accountId', 'id'],
          },
        ],
        attributes: ['userId'],
      });

      // Extract unique user accountIds
      const uniqueUserIds = [...new Set(premiumUsers.map((t) => t.userId))];
      targetUsers = await User.findAll({
        where: {
          id: uniqueUserIds,
          isActive: true,
        },
        attributes: ['accountId', 'id'],
      });
    } else if (target === 'active') {
      // Get users who have logged in recently (within last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      targetUsers = await User.findAll({
        where: {
          isActive: true,
          role: 'user',
          updatedAt: {
            [Op.gte]: thirtyDaysAgo,
          },
        },
        attributes: ['accountId', 'id'],
      });
    }

    if (targetUsers.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No users found for target audience: ${target}`,
      });
    }

    const accountIds = targetUsers.map((user) => user.accountId);

    // Send push notifications
    const result = await sendPushNotificationToUsers(
      accountIds,
      { title, body: message },
      {
        type: 'admin_notification',
        target: target,
        timestamp: new Date().toISOString(),
      }
    );

    // Create notification records in database for all users
    try {
      const notificationRecords = targetUsers.map((user) => ({
        userId: user.accountId,
        senderId: null, // Admin notification
        type: 'system',
        title,
        message,
        isRead: false,
      }));

      await Notification.bulkCreate(notificationRecords);
    } catch (notifError) {
      console.error('Error creating notification records:', notifError);
      // Non-blocking, continue response
    }

    res.json({
      success: true,
      message: `Push notification sent to ${result.sentCount} users`,
      data: {
        target,
        totalUsers: targetUsers.length,
        sentCount: result.sentCount,
        failedCount: result.failedCount || 0,
      },
    });
  } catch (error) {
    console.error('Error sending push notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send push notification',
      error: error.message,
    });
  }
};

module.exports = {
  sendPushNotification,
};

