import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const jwtMiddleware = async (req, res, next) => {
  const token = req.cookies['access_token'];
  if (!token) return res.status(401).json({ message: '권한이 없습니다.' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp - now < 1000 * 60 * 60 * 24 * 3.5) {
      const user = await User.findById(decoded._id);
      const token = user.generateToken();
      res.cookie('access_token', token, {
        maxAge: 1000 * 60 * 60 * 24 * 7,
        secure: true,
        sameSite: 'none',
      });
    } else if (decoded.exp - now < 0) {
      return res.status(401).json({ message: '토큰이 만료되었습니다.' });
    }
    return next();
  } catch (e) {
    return res.status(401).json({ message: '토큰이 올바르지 않습니다.' });
  }
};

export default jwtMiddleware;
