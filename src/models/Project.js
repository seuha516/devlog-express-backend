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
const ProjectScehma = new Schema(
  {
    title: String,
    subTitle: String,
    body: String,
    thumbnail: String,
    images: [String],
    tags: [{ name: String, color: String }],
    update: [
      {
        content: String,
        date: String,
      },
    ],
    workingPeriod: {
      start: String,
      end: String,
    },
    moreInfo: {
      projectClass: String,
      developState: String,
    },
    link: {
      website: [{ url: String, info: String }],
      github: [{ url: String, info: String }],
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

ProjectScehma.statics.findByTitle = function (title) {
  return this.findOne({ title });
};

const Project = mongoose.model('project', ProjectScehma);
export default Project;
