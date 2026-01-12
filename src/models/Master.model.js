const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Master = sequelize.define(
  'Master',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    type: {
      type: DataTypes.ENUM(
        'religion',
        'caste',
        'occupation',
        'location',
        'education',
        'employment-type',
        'income-currency',
        'income-range'
      ),
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Name is required',
        },
      },
    },
    code: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'masters',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active',
    },
    order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    tableName: 'masters',
    timestamps: true,
    indexes: [
      {
        fields: ['type'],
      },
      {
        fields: ['type', 'status'],
      },
    ],
  }
);

// Self-referential relationship for hierarchical data (e.g., location: country -> state -> city)
Master.hasMany(Master, { foreignKey: 'parentId', as: 'children' });
Master.belongsTo(Master, { foreignKey: 'parentId', as: 'parent' });

module.exports = Master;





















