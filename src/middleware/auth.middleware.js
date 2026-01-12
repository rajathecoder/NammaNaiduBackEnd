const { verifyToken } = require('../config/jwt');

const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = verifyToken(token);
    req.accountId = decoded.accountId;
    
    // Find user by accountId to get the actual userId for database queries
    const User = require('../models/User.model');
    const user = await User.findOne({ where: { accountId: decoded.accountId } });
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    req.userId = user.id; // Keep userId for backward compatibility with existing queries
    req.userAccountId = decoded.accountId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = { authenticate };


