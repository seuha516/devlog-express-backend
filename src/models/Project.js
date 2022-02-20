import mongoose from 'mongoose';

const { Schema } = mongoose;
const ProjectScehma = new Schema({
  title: String,
  subTitle: String,
  body: String,
  thumbnail: String,
  images: [String],
  tags: [
    {
      tag: String,
      color: String,
    },
  ],
  update: [
    {
      contents: String,
      date: String,
    },
  ],
  workingPeriod: {
    start: String,
    end: String,
  },
  moreInfo: {
    developState: String,
    projectClass: String,
  },
  link: {
    website: [{ url: String, info: String }],
    github: [{ url: String, info: String }],
  },
});

ProjectScehma.statics.findByTitle = function (title) {
  return this.findOne({ title });
};

const Project = mongoose.model('project', ProjectScehma);
export default Project;
