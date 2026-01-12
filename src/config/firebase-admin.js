const admin = require('firebase-admin');
const path = require('path');

// Path to the service account key file
const serviceAccountPath = path.join(__dirname, 'firebase-service-account.json');

let firebaseAdmin = null;

/**
 * Initialize Firebase Admin SDK
 * This should be called once when the server starts
 */
const initializeFirebaseAdmin = () => {
  try {
    // Check if Firebase Admin is already initialized
    if (admin.apps.length > 0) {
      console.log('Firebase Admin already initialized');
      firebaseAdmin = admin.app();
      return firebaseAdmin;
    }

    // Load service account key
    const serviceAccount = require(serviceAccountPath);

    // Initialize Firebase Admin
    firebaseAdmin = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id,
    });

    console.log('✅ Firebase Admin SDK initialized successfully');
    return firebaseAdmin;
  } catch (error) {
    console.error('❌ Error initializing Firebase Admin SDK:', error.message);
    console.error('Make sure the service account JSON file exists at:', serviceAccountPath);
    throw error;
  }
};

/**
 * Get Firebase Admin instance
 * @returns {admin.app.App} Firebase Admin app instance
 */
const getFirebaseAdmin = () => {
  if (!firebaseAdmin) {
    throw new Error('Firebase Admin not initialized. Call initializeFirebaseAdmin() first.');
  }
  return firebaseAdmin;
};

/**
 * Get Firebase Messaging instance for sending push notifications
 * @returns {admin.messaging.Messaging} Firebase Messaging instance
 */
const getMessaging = () => {
  const adminInstance = getFirebaseAdmin();
  return adminInstance.messaging();
};

/**
 * Send push notification to a single device
 * @param {string} fcmToken - FCM token of the target device
 * @param {Object} notification - Notification payload
 * @param {Object} data - Additional data payload
 * @returns {Promise<string>} Message ID
 */
const sendNotification = async (fcmToken, notification, data = {}) => {
  try {
    const messaging = getMessaging();
    
    const message = {
      token: fcmToken,
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: {
        ...data,
        // Convert all data values to strings (FCM requirement)
        ...Object.keys(data).reduce((acc, key) => {
          acc[key] = String(data[key]);
          return acc;
        }, {}),
      },
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'high_importance_channel',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
    };

    const response = await messaging.send(message);
    console.log('✅ Successfully sent notification:', response);
    return response;
  } catch (error) {
    console.error('❌ Error sending notification:', error);
    throw error;
  }
};

/**
 * Send push notification to multiple devices
 * @param {string[]} fcmTokens - Array of FCM tokens
 * @param {Object} notification - Notification payload
 * @param {Object} data - Additional data payload
 * @returns {Promise<admin.messaging.BatchResponse>} Batch response
 */
const sendMulticastNotification = async (fcmTokens, notification, data = {}) => {
  try {
    const messaging = getMessaging();
    
    const message = {
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: {
        ...data,
        // Convert all data values to strings (FCM requirement)
        ...Object.keys(data).reduce((acc, key) => {
          acc[key] = String(data[key]);
          return acc;
        }, {}),
      },
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'high_importance_channel',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
      tokens: fcmTokens,
    };

    const response = await messaging.sendEachForMulticast(message);
    console.log(`✅ Successfully sent ${response.successCount} notifications`);
    console.log(`❌ Failed to send ${response.failureCount} notifications`);
    
    if (response.failureCount > 0) {
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          console.error(`Failed to send to token ${fcmTokens[idx]}:`, resp.error);
        }
      });
    }
    
    return response;
  } catch (error) {
    console.error('❌ Error sending multicast notification:', error);
    throw error;
  }
};

/**
 * Send push notification to a topic
 * @param {string} topic - Topic name
 * @param {Object} notification - Notification payload
 * @param {Object} data - Additional data payload
 * @returns {Promise<string>} Message ID
 */
const sendTopicNotification = async (topic, notification, data = {}) => {
  try {
    const messaging = getMessaging();
    
    const message = {
      topic: topic,
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: {
        ...data,
        // Convert all data values to strings (FCM requirement)
        ...Object.keys(data).reduce((acc, key) => {
          acc[key] = String(data[key]);
          return acc;
        }, {}),
      },
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'high_importance_channel',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
    };

    const response = await messaging.send(message);
    console.log('✅ Successfully sent topic notification:', response);
    return response;
  } catch (error) {
    console.error('❌ Error sending topic notification:', error);
    throw error;
  }
};

module.exports = {
  initializeFirebaseAdmin,
  getFirebaseAdmin,
  getMessaging,
  sendNotification,
  sendMulticastNotification,
  sendTopicNotification,
};

