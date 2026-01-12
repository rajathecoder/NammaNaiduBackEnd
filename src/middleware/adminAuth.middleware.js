const { verifyToken } = require('../config/jwt');

const authenticateAdmin = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = verifyToken(token);
    
    // Check if this is an admin token (admin.id is stored as accountId in token)
    const Admin = require('../models/Admin.model');
    const admin = await Admin.findByPk(decoded.accountId);
    
    if (!admin) {
      return res.status(401).json({ message: 'Admin not found' });
    }

    // Check if admin is active
    if (admin.status !== 'active') {
      return res.status(403).json({ message: 'Admin account is inactive' });
    }

    req.adminId = admin.id;
    req.adminRole = admin.role;
    req.isAdmin = true;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = { authenticateAdmin };

