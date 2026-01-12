const jwt = require('jsonwebtoken');

const generateToken = (accountId) => {
  return jwt.sign({ accountId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '2d',
  });
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = {
  generateToken,
  verifyToken,
};


