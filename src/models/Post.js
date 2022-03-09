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
    const cmp = await bcryptjs.compare(ip, this.like[i]);
    if (cmp) return false;
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
      const cmp = await bcryptjs.compare(password, this.comment[i].hashedPassword);
      if (!cmp) return false;
      this.comment[i].die = true;
      this.comment[i].nickname = '(알 수 없음)';
      this.comment[i].content = '삭제된 댓글입니다.';
      sendMail('댓글 삭제', '게시물', this.title, '???', '');
      return true;
    } else {
      for (let j = 0; j < this.comment[i].reply.length; j++) {
        if (String(this.comment[i].reply[j]._id) === commentId) {
          const cmp = await bcryptjs.compare(password, this.comment[i].reply[j].hashedPassword);
          if (!cmp) return false;
          this.comment[i].reply[j].die = true;
          this.comment[i].reply[j].nickname = '(알 수 없음)';
          this.comment[i].reply[j].content = '삭제된 댓글입니다.';
          sendMail('답글 삭제', '게시물', this.title, '???', '');
          return true;
        }
      }
    }
  }
  return false;
};
PostSchema.methods.serialize = function () {
  const data = this.toJSON();
  for (let i = 0; i < data.comment.length; i++) {
    const mainComment = data.comment[i];
    for (let j = -1; j < mainComment.reply.length; j++) {
      const comment = j < 0 ? mainComment : mainComment.reply[j];
      delete comment.hashedPassword;
    }
  }
  return data;
};

const Post = mongoose.model('post', PostSchema);
export default Post;
