import Project from '../../models/Project.js';
import mongoose from 'mongoose';

const { ObjectId } = mongoose.Types;
export const checkObjectId = (req, res, next) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) return res.status(400).json();
  return next();
};

export const write = async (req, res) => {
  const project = new Project(req.body);
  const exists = await Project.findByTitle(project.title);
  if (exists) return res.status(409).json();
  try {
    await project.save();
    return res.json(project);
  } catch (e) {
    return res.status(500).json();
  }
};
export const list = async (req, res) => {
  const page = parseInt(req.query.page || '1', 10);
  if (page < 1 || isNaN(page)) return res.status(400).json();
  const { tag, sort } = req.query;
  const query = {
    ...(tag ? { 'tags.tag': tag } : {}),
  };
  try {
    const projects = await Project.find(query)
      .sort({ _id: sort ? parseInt(sort, 10) : -1 })
      .limit(6)
      .skip((page - 1) * 6)
      .lean()
      .select('-subTitle -body -images -update -workingPeriod -link')
      .exec();
    const projectCount = await Project.countDocuments(query).exec();
    const tagData = await Project.find()
      .sort({ _id: -1 })
      .lean()
      .select('tags')
      .exec();
    let tagList = [];
    for (let i = 0; i < tagData.length; i++) {
      for (let j = 0; j < tagData[i].tags.length; j++) {
        let exist = false;
        for (let k = 0; k < tagList.length; k++) {
          if (tagList[k].name === tagData[i].tags[j].tag) {
            exist = true;
            tagList[k].count++;
          }
        }
        if (!exist) {
          tagList.push({
            name: tagData[i].tags[j].tag,
            color: tagData[i].tags[j].color,
            count: 1,
          });
        }
      }
    }
    tagList.sort(function (a, b) {
      return b.count - a.count;
    });
    return res.json({
      projects: projects,
      projectCount: projectCount,
      tags: tagList,
    });
  } catch (e) {
    return res.status(500).json();
  }
};
export const read = async (req, res) => {
  const { id } = req.params;
  try {
    const project = await Project.findById(id).exec();
    if (!project) return res.status(404).json();
    return res.json(project);
  } catch (e) {
    return res.status(500).json();
  }
};
export const remove = async (req, res) => {
  const { id } = req.params;
  try {
    await Project.findByIdAndRemove(id).exec();
    return res.status(204).json();
  } catch (e) {
    return res.status(500).json();
  }
};
export const update = async (req, res) => {
  const { id } = req.params;
  try {
    const project = await Project.findByIdAndUpdate(id, req.body, {
      new: true,
    }).exec();
    if (!project) return res.status(404).json();
    return res.json(project);
  } catch (e) {
    return res.status(500).json();
  }
};
export const getlist = async (req, res) => {
  try {
    const tagData = await Project.find()
      .sort({ _id: -1 })
      .lean()
      .select('tags')
      .exec();
    let tagList = {};
    for (let i = 0; i < tagData.length; i++) {
      for (let j = 0; j < tagData[i].tags.length; j++) {
        if (!tagList[tagData[i].tags[j].tag]) {
          tagList[tagData[i].tags[j].tag] = tagData[i].tags[j].color;
        }
      }
    }
    return res.json({
      tags: tagList,
    });
  } catch (e) {
    return res.status(500).json();
  }
};
export const backup = async (req, res) => {
  try {
    const data = await Project.find().exec();
    return res.json(data);
  } catch (e) {
    return res.status(500).json();
  }
};
