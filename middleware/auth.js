const jwt = require('jsonwebtoken');
const User = require('../models/userModel')




const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
    next();
  } catch (err) {
    res.status(400).json({ message: 'Invalid token.' });
  }
};


const verifyAdmin = async (req, res, next) => {
  try {
    await verifyToken(req, res, async () => {
      if (req.user) {
        const user = await User.findById(req.user.id);
        if (user && user.isAdmin) {
          return next(); 
        } else {
          return res.status(403).json({ message: 'Access denied. Admins only.' });
        }
      } else {
        return res.status(403).json({ message: 'Access denied. User not found.' });
      }
    });
  } catch (err) {
    console.error('Error in verifyAdmin middleware:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};




module.exports = { verifyToken, verifyAdmin };
