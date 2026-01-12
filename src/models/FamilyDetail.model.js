const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User.model');

const FamilyDetail = sequelize.define(
  'FamilyDetail',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    accountId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: 'users',
        key: 'accountId',
      },
      onDelete: 'CASCADE',
      comment: 'UUID of the person (references users.accountId)',
    },
    fatherName: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Father\'s name',
    },
    fatherOccupation: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Father\'s occupation',
    },
    fatherStatus: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'alive',
      comment: 'Father\'s status: alive or late',
    },
    motherName: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Mother\'s name',
    },
    motherOccupation: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Mother\'s occupation',
    },
    motherStatus: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'alive',
      comment: 'Mother\'s status: alive or late',
    },
    siblings: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
      comment: 'List of siblings (array of objects with name, gender, etc.)',
    },
  },
  {
    tableName: 'familydetails',
    timestamps: true,
    underscored: false,
  }
);

// Define association
FamilyDetail.belongsTo(User, {
  foreignKey: 'accountId',
  targetKey: 'accountId',
  as: 'user',
});

User.hasOne(FamilyDetail, {
  foreignKey: 'accountId',
  sourceKey: 'accountId',
  as: 'familyDetail',
});

module.exports = FamilyDetail;
