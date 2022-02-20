import User from '../../models/User.js';
import jwt from 'jsonwebtoken';

export const register = async (req, res) => {
  const { username, password } = req.body;
  try {
    const exists = await User.findByUsername(username);
    if (exists) return res.status(409).json();
    const user = new User({ username });
    await user.setPassword(password);
    await user.save();
    const token = user.generateToken();
    res.cookie('access_token', token, {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });
    return res.json(user.serialize());
  } catch (e) {
    return res.status(500).json();
  }
};
export const login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(401).json();
  try {
    const user = await User.findByUsername(username);
    if (!user) return res.status(401).json();
    const valid = await user.checkPassword(password);
    if (!valid) return res.status(401).json();
    const token = user.generateToken();
    res.cookie('access_token', token, {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });
    return res.json(user.serialize());
  } catch (e) {
    return res.status(500).json();
  }
};
export const check = async (req, res) => {
  const token = req.cookies['access_token'];
  if (!token) return res.status(401).json();
  jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
    if (error) return res.status(401).json();
    else return res.json(decoded.username);
  });
};
export const logout = async (req, res) => {
  res.cookie('access_token');
  return res.status(204).json();
};
export const checkid = async (req, res) => {
  const { username } = req.body;
  try {
    const exists = await User.findByUsername(username);
    return res.json(exists ? true : false);
  } catch (e) {
    return res.status(500).json();
  }
};
