import User from '../../models/User.js';

export const register = async (req, res) => {
  const { username, password } = req.body;
  try {
    const exists = await User.findByUsername(username);
    if (exists) return res.status(409).json({ message: '이미 존재하는 ID입니다.' });
    const user = new User({ username });
    await user.setPassword(password);
    await user.save();
    const token = user.generateToken();
    res.cookie('access_token', token, {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      secure: true,
      sameSite: 'none',
    });
    return res.json(user.serialize());
  } catch (e) {
    return res.status(500).json({ message: '오류가 발생했습니다.', error: e });
  }
};
export const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findByUsername(username);
    if (!user) return res.status(404).json({ message: '해당 ID를 사용하는 계정이 존재하지 않습니다.' });
    const valid = await user.checkPassword(password);
    if (!valid) return res.status(401).json({ message: '비밀번호가 틀렸습니다.' });
    const token = user.generateToken();
    res.cookie('access_token', token, {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      secure: true,
      sameSite: 'none',
    });
    return res.json(user.serialize());
  } catch (e) {
    return res.status(500).json({ message: '오류가 발생했습니다.', error: e });
  }
};
export const check = async (req, res) => {
  return res.status(204).json();
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
    return res.status(500).json({ message: '오류가 발생했습니다.', error: e });
  }
};
