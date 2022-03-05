import mongoose from 'mongoose';

const { ObjectId } = mongoose.Types;

const checkObjectId = (req, res, next) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) return res.status(400).json({ message: '올바르지 않은 데이터 ID입니다.' });
  return next();
};

export default checkObjectId;
