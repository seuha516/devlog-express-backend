import mongoose from 'mongoose';

const { Schema } = mongoose;
const Comment = new Schema({
  nickname: String,
  hashedPassword: String,
  content: String,
  date: {
    type: Date,
    default: Date.now,
  },
  reply: [
    {
      nickname: String,
      hashedPassword: String,
      content: String,
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});
const PostScehma = new Schema(
  {
    title: String,
    subTitle: String,
    body: String,
    thumbnail: String,
    series: String,
    project: String,
    tags: [
      {
        name: String,
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

    like: {
      type: [String],
      default: [],
    },
    comment: {
      type: [Comment],
      default: [],
    },
  },
  { versionKey: false },
);

const Post = mongoose.model('post', PostScehma);
export default Post;
