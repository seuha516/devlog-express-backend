import mongoose from 'mongoose';

const { Schema } = mongoose;
const PostScehma = new Schema({
  title: String,
  subTitle: String,
  body: String,
  thumbnail: String,
  series: {
    name: String,
    project: {
      name: String,
      id: String,
    },
  },
  tags: [
    {
      tag: String,
      color: String,
    },
  ],
  date: {
    publishedDate: {
      type: Date,
      default: Date.now,
    },
    lastModifiedDate: {
      type: Date,
      default: Date.now,
    },
  },
});

const Post = mongoose.model('post', PostScehma);
export default Post;
