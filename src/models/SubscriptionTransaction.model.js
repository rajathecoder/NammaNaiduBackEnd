const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User.model');
const SubscriptionPlan = require('./SubscriptionPlan.model');

const SubscriptionTransaction = sequelize.define(
  'SubscriptionTransaction',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    paymentId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: {
          msg: 'Payment ID is required',
        },
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    planId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'subscription_plans',
        key: 'id',
      },
      onDelete: 'RESTRICT',
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: {
          args: [0],
          msg: 'Amount must be greater than or equal to 0',
        },
      },
    },
    status: {
      type: DataTypes.ENUM('success', 'pending', 'failed'),
      defaultValue: 'pending',
    },
    paymentMethod: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Payment method is required',
        },
      },
    },
    paymentGateway: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    transactionId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    failureReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'subscription_transactions',
    timestamps: true,
    indexes: [
      {
        fields: ['userId'],
      },
      {
        fields: ['planId'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['paymentId'],
      },
      {
        fields: ['createdAt'],
      },
    ],
  }
);

// Define associations
SubscriptionTransaction.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

SubscriptionTransaction.belongsTo(SubscriptionPlan, {
  foreignKey: 'planId',
  as: 'plan',
});

module.exports = SubscriptionTransaction;

