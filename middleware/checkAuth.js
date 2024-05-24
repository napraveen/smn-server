const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = async (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) {
    res.status(401).json({
      errors: [
        {
          msg: 'No token found',
        },
      ],
    });
  }

  try {
    const user = await jwt.verify(token, process.env.JWT_SECRET);
    req.user = user.email;
    next();
  } catch (error) {
    res.status(400).json({
      errors: [
        {
          msg: 'Invalid Token',
        },
      ],
    });
  }
};
