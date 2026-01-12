const DeviceToken = require('../../models/DeviceToken.model');
const { Op } = require('sequelize');

// Store or update FCM token
const storeFcmToken = async (req, res) => {
  try {
    const { uuid, fcmToken, device, deviceModel, ip } = req.body;
    // Use authenticated accountId (uuid in body is optional and will be validated)
    const accountId = req.accountId;

    // Validation
    if (!fcmToken || fcmToken.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'FCM token is required',
      });
    }

    // If uuid is provided, validate it matches the authenticated accountId
    if (uuid && uuid !== accountId) {
      return res.status(403).json({
        success: false,
        message: 'UUID does not match authenticated user',
      });
    }

    if (device && !['mobile', 'web'].includes(device)) {
      return res.status(400).json({
        success: false,
        message: 'Device must be either "mobile" or "web"',
      });
    }

    // Get client IP if not provided
    const clientIp = ip || req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for']?.split(',')[0] || 'Unknown';

    // Check if token already exists for this account and device
    const existingToken = await DeviceToken.findOne({
      where: {
        accountId: accountId,
        device: device || 'mobile',
        fcmToken: fcmToken,
      },
    });

    if (existingToken) {
      // Update existing token
      existingToken.deviceModel = deviceModel || existingToken.deviceModel;
      existingToken.ip = clientIp;
      existingToken.isActive = true;
      await existingToken.save();

      return res.json({
        success: true,
        message: 'FCM token updated successfully',
        data: {
          id: existingToken.id,
          accountId: existingToken.accountId,
          device: existingToken.device,
          deviceModel: existingToken.deviceModel,
          ip: existingToken.ip,
          isActive: existingToken.isActive,
          updatedAt: existingToken.updatedAt,
        },
      });
    }

    // Check if there's an existing token for this account and device type (different token)
    // If so, deactivate the old one
    await DeviceToken.update(
      { isActive: false },
      {
        where: {
          accountId: accountId,
          device: device || 'mobile',
          isActive: true,
        },
      }
    );

    // Create new token
    const newToken = await DeviceToken.create({
      accountId: accountId,
      fcmToken: fcmToken,
      device: device || 'mobile',
      deviceModel: deviceModel || null,
      ip: clientIp,
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: 'FCM token stored successfully',
      data: {
        id: newToken.id,
        accountId: newToken.accountId,
        device: newToken.device,
        deviceModel: newToken.deviceModel,
        ip: newToken.ip,
        isActive: newToken.isActive,
        createdAt: newToken.createdAt,
        updatedAt: newToken.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error storing FCM token:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to store FCM token',
    });
  }
};

// Get all active tokens for current user
const getMyTokens = async (req, res) => {
  try {
    const accountId = req.accountId;

    const tokens = await DeviceToken.findAll({
      where: {
        accountId: accountId,
        isActive: true,
      },
      order: [['updatedAt', 'DESC']],
      attributes: ['id', 'device', 'deviceModel', 'ip', 'isActive', 'createdAt', 'updatedAt'],
    });

    return res.json({
      success: true,
      data: tokens,
      count: tokens.length,
    });
  } catch (error) {
    console.error('Error fetching FCM tokens:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch FCM tokens',
    });
  }
};

// Remove/deactivate FCM token
const removeFcmToken = async (req, res) => {
  try {
    const { tokenId } = req.params;
    const accountId = req.accountId;

    const token = await DeviceToken.findOne({
      where: {
        id: tokenId,
        accountId: accountId,
      },
    });

    if (!token) {
      return res.status(404).json({
        success: false,
        message: 'Token not found',
      });
    }

    token.isActive = false;
    await token.save();

    return res.json({
      success: true,
      message: 'FCM token removed successfully',
    });
  } catch (error) {
    console.error('Error removing FCM token:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to remove FCM token',
    });
  }
};

module.exports = {
  storeFcmToken,
  getMyTokens,
  removeFcmToken,
};

