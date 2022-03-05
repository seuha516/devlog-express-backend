import Image from '../../models/Image.js';
import fs from 'fs';

export const read = async (req, res) => {
  const { id } = req.params;
  try {
    const target = await Image.findById(id).exec();
    if (!target) return res.status(404).json({ message: '해당 이미지가 존재하지 않습니다.' });
    const imageURL = target.img;
    fs.writeFileSync(`./images/${id}.png`, imageURL);
    fs.readFile(`./images/${id}.png`, function (err, data) {
      res.writeHead(200, { 'Content-Type': 'image/png' });
      res.write(data);
      res.end();
    });
  } catch (e) {
    return res.status(500).json({ message: '오류가 발생했습니다.', error: e });
  }
};
export const write = async (req, res) => {
  try {
    const img = req.file.buffer;
    if (img.truncated) return res.status(413).json({ message: '이미지의 용량이 너무 큽니다.' });
    const image = new Image({ img });
    await image.save();
    return res.json(image._id);
  } catch (e) {
    return res.status(500).json({ message: '오류가 발생했습니다.', error: e });
  }
};
