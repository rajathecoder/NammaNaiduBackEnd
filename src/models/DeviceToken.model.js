const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User.model');

const DeviceToken = sequelize.define(
  'DeviceToken',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    accountId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'accountId',
      },
      onDelete: 'CASCADE',
      comment: 'UUID of the user (references users.accountId)',
    },
    fcmToken: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'FCM token is required',
        },
      },
      comment: 'Firebase Cloud Messaging token',
    },
    device: {
      type: DataTypes.ENUM('mobile', 'web'),
      allowNull: false,
      defaultValue: 'mobile',
      validate: {
        isIn: {
          args: [['mobile', 'web']],
          msg: 'Device must be either "mobile" or "web"',
        },
      },
      comment: 'Device type: mobile or web',
    },
    deviceModel: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Device model information (e.g., "Samsung Galaxy S21", "iPhone 13", "Chrome Browser")',
    },
    ip: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'IP address of the device',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Whether the token is currently active',
    },
  },
  {
    tableName: 'device_tokens',
    timestamps: true,
    underscored: false,
    indexes: [
      {
        fields: ['accountId'],
      },
      {
        fields: ['fcmToken'],
      },
      {
        fields: ['accountId', 'device'],
      },
      {
        fields: ['isActive'],
      },
    ],
  }
);

// Define association
DeviceToken.belongsTo(User, {
  foreignKey: 'accountId',
  targetKey: 'accountId',
  as: 'user',
});

User.hasMany(DeviceToken, {
  foreignKey: 'accountId',
  sourceKey: 'accountId',
  as: 'deviceTokens',
});

module.exports = DeviceToken;

