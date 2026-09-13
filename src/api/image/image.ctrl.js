import Image from '../../models/Image.js';

export const read = async (req, res) => {
  const { id } = req.params;
  try {
    const target = await Image.findById(id).exec();
    if (!target) return res.status(404).json({ message: '해당 이미지가 존재하지 않습니다.' });
    return res.type('png').send(target.img);
  } catch (e) {
    return res.status(500).json({ message: '오류가 발생했습니다.', error: e });
  }
};
export const write = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: '이미지 파일이 필요합니다.' });
    const img = req.file.buffer;
    const image = new Image({ img });
    await image.save();
    return res.json(image._id);
  } catch (e) {
    return res.status(500).json({ message: '오류가 발생했습니다.', error: e });
  }
};
