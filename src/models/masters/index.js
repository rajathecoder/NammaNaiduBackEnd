const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const baseAttributes = {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
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
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active',
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
};

const createMasterModel = (modelName, tableName, { attributes = {}, options = {}, selfReference = false } = {}) => {
  const model = sequelize.define(
    modelName,
    {
      ...baseAttributes,
      ...attributes,
    },
    {
      tableName,
      timestamps: true,
      ...options,
    }
  );

  if (selfReference) {
    model.hasMany(model, { foreignKey: 'parentId', as: 'children' });
    model.belongsTo(model, { foreignKey: 'parentId', as: 'parent' });
  }

  return model;
};

const Religion = createMasterModel('ReligionMaster', 'religions');
const Caste = createMasterModel('CasteMaster', 'castes');
const Occupation = createMasterModel('OccupationMaster', 'occupations');
const Location = createMasterModel('LocationMaster', 'locations', {
  options: {
    indexes: [{ fields: ['parentId'] }],
  },
  selfReference: true,
});
const Education = createMasterModel('EducationMaster', 'educations');
const EmploymentType = createMasterModel('EmploymentTypeMaster', 'employment_types');
const IncomeCurrency = createMasterModel('IncomeCurrencyMaster', 'income_currencies');
const IncomeRange = createMasterModel('IncomeRangeMaster', 'income_ranges');

const masterModels = {
  religion: Religion,
  caste: Caste,
  occupation: Occupation,
  location: Location,
  education: Education,
  'employment-type': EmploymentType,
  'income-currency': IncomeCurrency,
  'income-range': IncomeRange,
};

const getMasterModel = (type) => masterModels[type];

module.exports = {
  masterModels,
  getMasterModel,
};


