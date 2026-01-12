const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

let firebaseAdmin = null;

/**
 * Initialize Firebase Admin SDK
 * Reads from .env file (FIREBASE_SERVICE_ACCOUNT) or firebase-service-account.json file
 * Priority: Environment variable > JSON file
 */
const initializeFirebaseAdmin = () => {
  try {
    if (admin.apps.length > 0) {
      firebaseAdmin = admin.app();
      return firebaseAdmin;
    }

    let serviceAccount;

    // Load from .env file (FIREBASE_SERVICE_ACCOUNT) or JSON file
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      try {
        let jsonString = process.env.FIREBASE_SERVICE_ACCOUNT.trim();
        
        // Handle newlines in JSON string (Railway may store with actual newlines)
        if (jsonString.includes('\n') && !jsonString.includes('\\n')) {
          jsonString = jsonString.replace(/\n/g, '\\n');
        }
        
        serviceAccount = JSON.parse(jsonString);
      } catch (parseError) {
        throw new Error(`Invalid FIREBASE_SERVICE_ACCOUNT JSON: ${parseError.message}`);
      }
    } else {
      // Try standard paths for local development
      const possiblePaths = [
        path.join(__dirname, 'firebase-service-account.json'),
        path.resolve(process.cwd(), 'src/config/firebase-service-account.json'),
      ];
      
      let serviceAccountPath = null;
      for (const possiblePath of possiblePaths) {
        if (fs.existsSync(possiblePath)) {
          serviceAccountPath = possiblePath;
          break;
        }
      }
      
      if (serviceAccountPath) {
        try {
          const serviceAccountFile = fs.readFileSync(serviceAccountPath, 'utf8');
          serviceAccount = JSON.parse(serviceAccountFile);
        } catch (fileError) {
          throw new Error(`Failed to read service account file: ${fileError.message}`);
        }
      } else {
        throw new Error(
          'Firebase service account not found. ' +
          'Set FIREBASE_SERVICE_ACCOUNT environment variable or place firebase-service-account.json in src/config/'
        );
      }
    }

    // Validate required fields
    if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
      throw new Error('Invalid service account: missing required fields');
    }

    // Initialize Firebase Admin
    firebaseAdmin = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id,
    });

    console.log('Firebase Admin SDK initialized successfully');
    return firebaseAdmin;
  } catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error.message);
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
    return response;
  } catch (error) {
    console.error('Error sending notification:', error.message);
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
    
    if (response.failureCount > 0) {
      console.warn(`Failed to send ${response.failureCount} of ${fcmTokens.length} notifications`);
    }
    
    return response;
  } catch (error) {
    console.error('Error sending multicast notification:', error.message);
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
    return response;
  } catch (error) {
    console.error('Error sending topic notification:', error.message);
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

