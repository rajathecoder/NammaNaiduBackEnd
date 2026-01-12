const { sendNotification, sendMulticastNotification } = require('../config/firebase-admin');
const DeviceToken = require('../models/DeviceToken.model');

/**
 * Send push notification to a user by their accountId
 * @param {string} accountId - User's account ID
 * @param {Object} notification - Notification object with title and body
 * @param {Object} data - Additional data to send with notification
 * @returns {Promise<Object>} Result object with success status
 */
const sendPushNotificationToUser = async (accountId, notification, data = {}) => {
  try {
    // Get all active FCM tokens for the user
    const deviceTokens = await DeviceToken.findAll({
      where: {
        accountId: accountId,
        isActive: true,
      },
      attributes: ['fcmToken'],
    });

    if (deviceTokens.length === 0) {
      console.log(`No active FCM tokens found for user ${accountId}`);
      return {
        success: false,
        message: 'No active FCM tokens found for user',
        sentCount: 0,
      };
    }

    const fcmTokens = deviceTokens
      .map((token) => token.fcmToken)
      .filter((token) => {
        // Filter out placeholder tokens
        if (!token || token.trim() === '') return false;
        if (token.includes('fcm_token_placeholder') || token.includes('web_fcm_token')) return false;
        return true;
      });

    if (fcmTokens.length === 0) {
      console.log(`No valid FCM tokens found for user ${accountId}`);
      console.log(`Found ${deviceTokens.length} device tokens, but all are invalid or placeholders`);
      return {
        success: false,
        message: 'No valid FCM tokens found for user',
        sentCount: 0,
      };
    }

    console.log(`Found ${fcmTokens.length} valid FCM token(s) for user ${accountId}`);

    // If only one token, use single send
    if (fcmTokens.length === 1) {
      try {
        await sendNotification(fcmTokens[0], notification, data);
        return {
          success: true,
          message: 'Push notification sent successfully',
          sentCount: 1,
        };
      } catch (error) {
        console.error(`Error sending notification to token ${fcmTokens[0]}:`, error);
        return {
          success: false,
          message: 'Failed to send push notification',
          error: error.message,
          sentCount: 0,
        };
      }
    }

    // If multiple tokens, use multicast
    try {
      const response = await sendMulticastNotification(fcmTokens, notification, data);
      return {
        success: true,
        message: 'Push notifications sent successfully',
        sentCount: response.successCount,
        failedCount: response.failureCount,
      };
    } catch (error) {
      console.error(`Error sending multicast notification:`, error);
      return {
        success: false,
        message: 'Failed to send push notifications',
        error: error.message,
        sentCount: 0,
      };
    }
  } catch (error) {
    console.error('Error in sendPushNotificationToUser:', error);
    return {
      success: false,
      message: 'Failed to send push notification',
      error: error.message,
      sentCount: 0,
    };
  }
};

/**
 * Send push notification to multiple users
 * @param {string[]} accountIds - Array of user account IDs
 * @param {Object} notification - Notification object with title and body
 * @param {Object} data - Additional data to send with notification
 * @returns {Promise<Object>} Result object with success status
 */
const sendPushNotificationToUsers = async (accountIds, notification, data = {}) => {
  try {
    // Get all active FCM tokens for all users
    const deviceTokens = await DeviceToken.findAll({
      where: {
        accountId: accountIds,
        isActive: true,
      },
      attributes: ['fcmToken'],
    });

    if (deviceTokens.length === 0) {
      console.log(`No active FCM tokens found for users`);
      return {
        success: false,
        message: 'No active FCM tokens found for users',
        sentCount: 0,
      };
    }

    const fcmTokens = deviceTokens
      .map((token) => token.fcmToken)
      .filter((token) => {
        // Filter out placeholder tokens
        if (!token || token.trim() === '') return false;
        if (token.includes('fcm_token_placeholder') || token.includes('web_fcm_token')) return false;
        return true;
      });

    if (fcmTokens.length === 0) {
      console.log(`No valid FCM tokens found for users`);
      console.log(`Found ${deviceTokens.length} device tokens, but all are invalid or placeholders`);
      return {
        success: false,
        message: 'No valid FCM tokens found for users',
        sentCount: 0,
      };
    }

    console.log(`Found ${fcmTokens.length} valid FCM token(s) for ${accountIds.length} user(s)`);
    console.log(`Sending notification: "${notification.title}" - "${notification.body}"`);

    // Use multicast for multiple tokens
    try {
      const response = await sendMulticastNotification(fcmTokens, notification, data);
      console.log(`Notification send result: ${response.successCount} successful, ${response.failureCount} failed`);
      return {
        success: true,
        message: 'Push notifications sent successfully',
        sentCount: response.successCount,
        failedCount: response.failureCount,
      };
    } catch (error) {
      console.error(`Error sending multicast notification:`, error);
      return {
        success: false,
        message: 'Failed to send push notifications',
        error: error.message,
        sentCount: 0,
      };
    }
  } catch (error) {
    console.error('Error in sendPushNotificationToUsers:', error);
    return {
      success: false,
      message: 'Failed to send push notifications',
      error: error.message,
      sentCount: 0,
    };
  }
};

module.exports = {
  sendPushNotificationToUser,
  sendPushNotificationToUsers,
};

