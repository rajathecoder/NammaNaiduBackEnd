const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User.model');

const HoroscopeDetail = sequelize.define(
  'HoroscopeDetail',
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
    rasi: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Rasi (Zodiac sign)',
    },
    natchathiram: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Natchathiram (Star)',
    },
    birthPlace: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Birth Place',
    },
    birthTime: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Birth Time',
    },
  },
  {
    tableName: 'horoscopedetails',
    timestamps: true,
    underscored: false,
  }
);

// Define association
HoroscopeDetail.belongsTo(User, {
  foreignKey: 'accountId',
  targetKey: 'accountId',
  as: 'user',
});

User.hasOne(HoroscopeDetail, {
  foreignKey: 'accountId',
  sourceKey: 'accountId',
  as: 'horoscopeDetail',
});

module.exports = HoroscopeDetail;
