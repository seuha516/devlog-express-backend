import mongoose from 'mongoose';

const { Schema } = mongoose;
const ImageScehma = new Schema(
  {
    img: Buffer,
  },
  { versionKey: false },
);

const Image = mongoose.model('image', ImageScehma);
export default Image;
