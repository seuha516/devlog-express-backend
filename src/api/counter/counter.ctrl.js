import Counter from '../../models/Counter.js';

export const add = async (req, res) => {
  try {
    const date = new Date();
    const ip = (
      req.header['x-forwarded-for'] || req.connection.remoteAddress
    ).substr(7);
    if (!req.cookies.count) {
      res.cookie('count', '방문자 집계', {
        maxAge: 1000 * 60 * 30,
        httpOnly: true,
        secure: true,
        sameSite: 'none',
      });
      const counter = new Counter({ date, ip });
      await counter.save();
    }
    return res.json();
  } catch (e) {
    return res.status(500).json();
  }
};
export const list = async (req, res) => {
  try {
    const log = await Counter.find().sort({ _id: -1 }).exec();
    return res.json(log);
  } catch (e) {
    return res.status(500).json();
  }
};
export const backup = async (req, res) => {
  try {
    const data = await Counter.find().exec();
    return res.json(data);
  } catch (e) {
    return res.status(500).json();
  }
};
