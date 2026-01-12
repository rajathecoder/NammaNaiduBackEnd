const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User.model');

const ProfileAction = sequelize.define(
  'ProfileAction',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    actionType: {
      type: DataTypes.ENUM('interest', 'shortlist', 'reject', 'accept'),
      allowNull: false,
      validate: {
        isIn: {
          args: [['interest', 'shortlist', 'reject', 'accept']],
          msg: 'Action type must be interest, shortlist, reject, or accept',
        },
      },
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'accountId',
      },
      onDelete: 'CASCADE',
      comment: 'UUID of the user who performed the action',
    },
    targetUserId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'accountId',
      },
      onDelete: 'CASCADE',
      comment: 'UUID of the user who was acted upon',
    },
  },
  {
    tableName: 'profile_actions',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['userId', 'targetUserId', 'actionType'],
        name: 'unique_user_target_action',
      },
      {
        fields: ['userId'],
      },
      {
        fields: ['targetUserId'],
      },
      {
        fields: ['actionType'],
      },
    ],
  }
);

// Define associations
ProfileAction.belongsTo(User, {
  foreignKey: 'userId',
  targetKey: 'accountId',
  as: 'user',
});

ProfileAction.belongsTo(User, {
  foreignKey: 'targetUserId',
  targetKey: 'accountId',
  as: 'targetUser',
});

module.exports = ProfileAction;

















