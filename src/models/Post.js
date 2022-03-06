import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import sendMail from '../lib/sendMail.js';

const { Schema } = mongoose;
const CommentSchema = new Schema({
  nickname: String,
  hashedPassword: String,
  content: String,
  date: {
    type: Date,
    default: Date.now,
  },
  die: {
    type: Boolean,
    default: false,
  },
  reply: {
    type: [
      {
        nickname: String,
        hashedPassword: String,
        content: String,
        date: {
          type: Date,
          default: Date.now,
        },
        die: {
          type: Boolean,
          default: false,
        },
      },
    ],
    default: [],
  },
});
const PostSchema = new Schema(
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
      type: [CommentSchema],
      default: [],
    },
  },
  { versionKey: false },
);

PostSchema.methods.pressLike = async function (ip) {
  for (let i = 0; i < this.like.length; i++) {
    if (bcryptjs.compare(ip, this.like[i])) return false;
  }
  const hash = await bcryptjs.hash(ip, 10);
  this.like.push(hash);
  sendMail('좋아요', '게시물', this.title, '???', '');
  return true;
};
PostSchema.methods.writeComment = async function (commentId, comment) {
  const hash = await bcryptjs.hash(comment.password, 10);
  delete comment.password;
  comment.hashedPassword = hash;
  if (commentId === '') {
    this.comment.push(comment);
    sendMail('댓글', '게시물', this.title, comment.nickname, comment.content);
  } else {
    for (let i = 0; i < this.comment.length; i++) {
      if (String(this.comment[i]._id) === commentId) {
        this.comment[i].reply.push(comment);
        sendMail('답글', '게시물', this.title, comment.nickname, comment.content);
        break;
      }
    }
  }
};
PostSchema.methods.removeComment = async function (commentId, password) {
  for (let i = 0; i < this.comment.length; i++) {
    if (String(this.comment[i]._id) === commentId) {
      if (!bcryptjs.compare(password, this.comment[i].hashedPassword)) return false;
      this.comment[i].die = true;
      this.comment[i].nickname = '???';
      this.comment[i].content = '???';
      sendMail('댓글 삭제', '게시물', this.title, '???', '');
      return true;
    } else {
      for (let j = 0; j < this.comment[i].reply.length; j++) {
        if (String(this.comment[i].reply[j]._id) === commentId) {
          if (!bcryptjs.compare(password, this.comment[i].reply[j].hashedPassword)) return false;
          this.comment[i].reply[j].die = true;
          this.comment[i].reply[j].nickname = '???';
          this.comment[i].reply[j].content = '???';
          sendMail('답글 삭제', '게시물', this.title, '???', '');
          return true;
        }
      }
    }
  }
  return true;
};

const Post = mongoose.model('post', PostSchema);
export default Post;
