const { Op } = require('sequelize');
const Admin = require('../../models/Admin.model');

// Get all admin users
const getAdminUsers = async (req, res) => {
  try {
    const { status, role, search, page = 1, limit = 20 } = req.query;

    const whereClause = {};
    
    if (status) {
      whereClause.status = status;
    }
    
    if (role) {
      whereClause.role = role;
    }
    
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await Admin.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: offset,
    });

    // Format response
    const formattedAdmins = rows.map((admin) => {
      const adminData = admin.toJSON();
      return {
        ...adminData,
        lastLogin: adminData.lastLogin 
          ? new Date(adminData.lastLogin).toLocaleString('en-US', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            })
          : 'Never',
        createdAt: adminData.createdAt 
          ? new Date(adminData.createdAt).toISOString().split('T')[0]
          : null,
      };
    });

    res.json({
      success: true,
      message: 'Admin users retrieved successfully',
      data: formattedAdmins,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / parseInt(limit)),
        totalItems: count,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get single admin user by ID
const getAdminUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await Admin.findByPk(id, {
      attributes: { exclude: ['password'] },
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin user not found',
      });
    }

    const adminData = admin.toJSON();
    res.json({
      success: true,
      message: 'Admin user retrieved successfully',
      data: {
        ...adminData,
        lastLogin: adminData.lastLogin 
          ? new Date(adminData.lastLogin).toLocaleString('en-US', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            })
          : 'Never',
        createdAt: adminData.createdAt 
          ? new Date(adminData.createdAt).toISOString().split('T')[0]
          : null,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create new admin user
const createAdminUser = async (req, res) => {
  try {
    const { name, email, password, role, status } = req.body;

    // Check if email already exists
    const existingAdmin = await Admin.findOne({ where: { email } });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists',
      });
    }

    const admin = await Admin.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role: role || 'Moderator',
      status: status || 'active',
    });

    const adminData = admin.toJSON();
    res.status(201).json({
      success: true,
      message: 'Admin user created successfully',
      data: {
        ...adminData,
        lastLogin: 'Never',
        createdAt: adminData.createdAt 
          ? new Date(adminData.createdAt).toISOString().split('T')[0]
          : null,
      },
    });
  } catch (error) {
    // Handle Sequelize validation errors
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map((err) => err.message).join(', ');
      return res.status(400).json({
        success: false,
        message: `Validation error: ${messages}`,
      });
    }

    // Handle unique constraint violation
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Email already exists',
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create admin user',
    });
  }
};

// Update admin user
const updateAdminUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, role, status } = req.body;

    const admin = await Admin.findByPk(id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin user not found',
      });
    }

    // Check if email is being changed and if it already exists
    if (email && email !== admin.email) {
      const existingAdmin = await Admin.findOne({ where: { email } });
      if (existingAdmin) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists',
        });
      }
    }

    // Update fields
    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (email !== undefined) updateData.email = email.trim().toLowerCase();
    if (password !== undefined) updateData.password = password;
    if (role !== undefined) updateData.role = role;
    if (status !== undefined) updateData.status = status;

    await admin.update(updateData);

    const adminData = admin.toJSON();
    res.json({
      success: true,
      message: 'Admin user updated successfully',
      data: {
        ...adminData,
        lastLogin: adminData.lastLogin 
          ? new Date(adminData.lastLogin).toLocaleString('en-US', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            })
          : 'Never',
        createdAt: adminData.createdAt 
          ? new Date(adminData.createdAt).toISOString().split('T')[0]
          : null,
      },
    });
  } catch (error) {
    // Handle Sequelize validation errors
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map((err) => err.message).join(', ');
      return res.status(400).json({
        success: false,
        message: `Validation error: ${messages}`,
      });
    }

    // Handle unique constraint violation
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Email already exists',
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update admin user',
    });
  }
};

// Delete admin user
const deleteAdminUser = async (req, res) => {
  try {
    const { id } = req.params;
    const currentAdminId = req.userId; // Assuming you have middleware to set req.userId

    // Prevent deleting own account
    if (parseInt(id) === currentAdminId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account',
      });
    }

    const admin = await Admin.findByPk(id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin user not found',
      });
    }

    await admin.destroy();

    res.json({
      success: true,
      message: 'Admin user deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete admin user',
    });
  }
};

// Toggle admin status (activate/deactivate)
const toggleAdminStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const admin = await Admin.findByPk(id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin user not found',
      });
    }

    // Prevent deactivating own account
    const currentAdminId = req.userId;
    if (parseInt(id) === currentAdminId && status === 'inactive') {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own account',
      });
    }

    await admin.update({ status });

    const adminData = admin.toJSON();
    res.json({
      success: true,
      message: `Admin user ${status === 'active' ? 'activated' : 'deactivated'} successfully`,
      data: {
        ...adminData,
        lastLogin: adminData.lastLogin 
          ? new Date(adminData.lastLogin).toLocaleString('en-US', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            })
          : 'Never',
        createdAt: adminData.createdAt 
          ? new Date(adminData.createdAt).toISOString().split('T')[0]
          : null,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update admin status',
    });
  }
};

module.exports = {
  getAdminUsers,
  getAdminUserById,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
  toggleAdminStatus,
};

