import mongoose from 'mongoose';

const { Schema } = mongoose;
const ImageSchema = new Schema(
  {
    img: Buffer,
  },
  { versionKey: false },
);

const Image = mongoose.model('image', ImageSchema);
export default Image;
