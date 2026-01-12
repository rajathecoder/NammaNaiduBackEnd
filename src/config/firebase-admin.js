const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

let firebaseAdmin = null;

/**
 * Initialize Firebase Admin SDK
 * This should be called once when the server starts
 * Supports both environment variable (for production) and file (for local development)
 */
const initializeFirebaseAdmin = () => {
  try {
    // Check if Firebase Admin is already initialized
    if (admin.apps.length > 0) {
      console.log('Firebase Admin already initialized');
      firebaseAdmin = admin.app();
      return firebaseAdmin;
    }

    let serviceAccount;

    // Try to load from environment variable first (for production/cloud deployments)
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      try {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        console.log('✅ Loaded Firebase service account from environment variable');
      } catch (parseError) {
        console.error('❌ Error parsing FIREBASE_SERVICE_ACCOUNT environment variable:', parseError.message);
        throw new Error('Invalid FIREBASE_SERVICE_ACCOUNT JSON in environment variable');
      }
    } else {
      // Fall back to file (for local development)
      const serviceAccountPath = path.join(__dirname, 'firebase-service-account.json');
      
      if (fs.existsSync(serviceAccountPath)) {
        try {
          const serviceAccountFile = fs.readFileSync(serviceAccountPath, 'utf8');
          serviceAccount = JSON.parse(serviceAccountFile);
          console.log('✅ Loaded Firebase service account from file');
        } catch (fileError) {
          console.error('❌ Error reading Firebase service account file:', fileError.message);
          throw new Error(`Failed to read service account file: ${fileError.message}`);
        }
      } else {
        throw new Error(
          'Firebase service account not found. ' +
          'Either set FIREBASE_SERVICE_ACCOUNT environment variable or place firebase-service-account.json in src/config/'
        );
      }
    }

    // Validate service account structure
    if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
      throw new Error('Invalid service account: missing required fields (project_id, private_key, or client_email)');
    }

    // Initialize Firebase Admin
    firebaseAdmin = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id,
    });

    console.log('✅ Firebase Admin SDK initialized successfully');
    return firebaseAdmin;
  } catch (error) {
    console.error('❌ Error initializing Firebase Admin SDK:', error.message);
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

