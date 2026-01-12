const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User.model');

const Hobby = sequelize.define(
  'Hobby',
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
    hobbies: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
      comment: 'List of hobbies and interests',
    },
    musicGenres: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
      comment: 'List of music genres',
    },
    bookTypes: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
      comment: 'List of book types',
    },
    movieTypes: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
      comment: 'List of movie types',
    },
    sports: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
      comment: 'List of sports and fitness activities',
    },
    cuisines: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
      comment: 'List of favorite cuisines',
    },
    languages: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
      comment: 'List of spoken languages',
    },
  },
  {
    tableName: 'hobbies',
    timestamps: true,
    underscored: false,
  }
);

// Define association
Hobby.belongsTo(User, {
  foreignKey: 'accountId',
  targetKey: 'accountId',
  as: 'user',
});

User.hasOne(Hobby, {
  foreignKey: 'accountId',
  sourceKey: 'accountId',
  as: 'hobby',
});

module.exports = Hobby;
