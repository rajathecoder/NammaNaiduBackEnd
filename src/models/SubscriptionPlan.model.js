const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SubscriptionPlan = sequelize.define(
  'SubscriptionPlan',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    planType: {
      type: DataTypes.ENUM('months', 'year'),
      allowNull: false,
      validate: {
        isIn: {
          args: [['months', 'year']],
          msg: 'Plan type must be either months or year',
        },
      },
    },
    planName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Plan name is required',
        },
      },
    },
    category: {
      type: DataTypes.ENUM('Male', 'Female', 'Both'),
      allowNull: false,
      defaultValue: 'Both',
      validate: {
        isIn: {
          args: [['Male', 'Female', 'Both']],
          msg: 'Category must be Male, Female, or Both',
        },
      },
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
    offerAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: {
          args: [0],
          msg: 'Offer amount must be greater than or equal to 0',
        },
      },
    },
    maxProfile: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: {
          args: [0],
          msg: 'Max profile must be greater than or equal to 0',
        },
      },
    },
    contactNoView: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: {
          args: [0],
          msg: 'Contact number view must be greater than or equal to 0',
        },
      },
    },
    validMonth: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: {
          args: [1],
          msg: 'Valid month must be at least 1',
        },
        max: {
          args: [12],
          msg: 'Valid month must be at most 12',
        },
      },
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active',
    },
  },
  {
    tableName: 'subscription_plans',
    timestamps: true,
    indexes: [
      {
        fields: ['planType'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['category'],
      },
    ],
  }
);

module.exports = SubscriptionPlan;

