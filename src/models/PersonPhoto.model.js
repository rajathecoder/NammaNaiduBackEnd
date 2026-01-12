const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User.model');

const PersonPhoto = sequelize.define(
  'PersonPhoto',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    personId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'accountId',
      },
      onDelete: 'CASCADE',
    },
    photo1: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Cloudinary URL for photo placement 1',
    },
    photo2: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Cloudinary URL for photo placement 2',
    },
    photo3: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Cloudinary URL for photo placement 3',
    },
    photo4: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Cloudinary URL for photo placement 4',
    },
    photo5: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Cloudinary URL for photo placement 5',
    },
    proofImage: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Cloudinary URL for proof image',
    },
  },
  {
    tableName: 'person_photos',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['personId'],
      },
    ],
  }
);

// Define associations
User.hasOne(PersonPhoto, { foreignKey: 'personId', sourceKey: 'accountId', as: 'personPhoto' });
PersonPhoto.belongsTo(User, { foreignKey: 'personId', targetKey: 'accountId', as: 'person' });

module.exports = PersonPhoto;
