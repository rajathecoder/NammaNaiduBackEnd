const { getMasterModel } = require('../../models/masters');

const resolveMasterModel = (typeParam) => {
  const normalizedType = (typeParam || '').toLowerCase();
  const MasterModel = getMasterModel(normalizedType);

  if (!MasterModel) {
    const error = new Error(`Invalid master type: ${typeParam}`);
    error.statusCode = 400;
    throw error;
  }

  return { MasterModel, normalizedType };
};

const formatMaster = (record, type) => {
  if (!record) return null;
  const payload = record.toJSON ? record.toJSON() : record;
  return { ...payload, type };
};

// Get all masters by type
const getMastersByType = async (req, res) => {
  try {
    const { type } = req.params;
    const { status } = req.query;

    const { MasterModel, normalizedType } = resolveMasterModel(type);

    const whereClause = {};
    if (status) {
      whereClause.status = status;
    }

    const masters = await MasterModel.findAll({
      where: whereClause,
      order: [['order', 'ASC'], ['name', 'ASC']],
    });

    res.json({
      success: true,
      message: 'Masters retrieved successfully',
      data: masters.map((item) => formatMaster(item, normalizedType)),
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get single master by ID
const getMasterById = async (req, res) => {
  try {
    const { type, id } = req.params;

    const { MasterModel, normalizedType } = resolveMasterModel(type);
    const master = await MasterModel.findByPk(id);

    if (!master) {
      return res.status(404).json({
        success: false,
        message: 'Master not found',
      });
    }

    res.json({
      success: true,
      message: 'Master retrieved successfully',
      data: formatMaster(master, normalizedType),
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create new master
const createMaster = async (req, res) => {
  try {
    const { type } = req.params;
    const { name, code, parentId, status, order } = req.body;

    const { MasterModel, normalizedType } = resolveMasterModel(type);

    const master = await MasterModel.create({
      name,
      code: code || null,
      parentId: parentId || null,
      status: status || 'active',
      order: order || 0,
    });

    res.status(201).json({
      success: true,
      message: 'Master created successfully',
      data: formatMaster(master, normalizedType),
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update master
const updateMaster = async (req, res) => {
  try {
    const { type, id } = req.params;
    const { name, code, parentId, status, order } = req.body;

    const { MasterModel, normalizedType } = resolveMasterModel(type);
    const master = await MasterModel.findByPk(id);

    if (!master) {
      return res.status(404).json({
        success: false,
        message: 'Master not found',
      });
    }

    await master.update({
      name: name !== undefined ? name : master.name,
      code: code !== undefined ? code : master.code,
      parentId: parentId !== undefined ? parentId : master.parentId,
      status: status || master.status,
      order: order !== undefined ? order : master.order,
    });

    res.json({
      success: true,
      message: 'Master updated successfully',
      data: formatMaster(master, normalizedType),
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete master
const deleteMaster = async (req, res) => {
  try {
    const { type, id } = req.params;

    const { MasterModel } = resolveMasterModel(type);
    const master = await MasterModel.findByPk(id);

    if (!master) {
      return res.status(404).json({
        success: false,
        message: 'Master not found',
      });
    }

    await master.destroy();

    res.json({
      success: true,
      message: 'Master deleted successfully',
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getMastersByType,
  getMasterById,
  createMaster,
  updateMaster,
  deleteMaster,
};


