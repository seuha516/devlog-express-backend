import Project from '../../models/Project.js';
import mongoose from 'mongoose';
const { ObjectId } = mongoose.Types;

export const catalog = async (req, res) => {
  try {
    const tagData = await Project.find().lean().select('tags').exec();
    let tagList = {};
    for (let i = 0; i < tagData.length; i++) {
      for (let j = 0; j < tagData[i].tags.length; j++) {
        if (!tagList[tagData[i].tags[j].name]) {
          tagList[tagData[i].tags[j].name] = tagData[i].tags[j].color;
        }
      }
    }
    return res.json(tagList);
  } catch (e) {
    return res.status(500).json({ message: '오류가 발생했습니다.', error: e });
  }
};
export const list = async (req, res) => {
  const page = parseInt(req.query.page || '1');
  if (page < 1 || isNaN(page)) return res.status(400).json({ message: '페이지 값이 올바르지 않습니다.' });
  const { tag, sort } = req.query;
  const query = {
    ...(tag ? { 'tags.name': tag } : {}),
  };

  try {
    const projects = await Project.find(query)
      .sort({ _id: sort ? parseInt(sort) : -1 })
      .limit(6)
      .skip((page - 1) * 6)
      .lean()
      .select('-subTitle -body -images -like -comment -update -workingPeriod -link')
      .exec();
    const projectCount = await Project.countDocuments(query);
    const tagData = await Project.find().lean().select('tags').exec();
    let tagList = [];
    for (let i = 0; i < tagData.length; i++) {
      for (let j = 0; j < tagData[i].tags.length; j++) {
        let exist = false;
        for (let k = 0; k < tagList.length; k++) {
          if (tagList[k].name === tagData[i].tags[j].name) {
            exist = true;
            tagList[k].count++;
          }
        }
        if (!exist) {
          tagList.push({
            name: tagData[i].tags[j].name,
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
    return res.status(500).json({ message: '오류가 발생했습니다.', error: e });
  }
};
export const write = async (req, res) => {
  try {
    const exists = await Project.findByTitle(project.title);
    if (exists) return res.status(409).json({ message: '같은 이름의 프로젝트가 존재합니다.' });
    const project = new Project(req.body);
    await project.save();
    return res.json(project);
  } catch (e) {
    return res.status(500).json({ message: '오류가 발생했습니다.', error: e });
  }
};
export const read = async (req, res) => {
  const { id } = req.params;
  try {
    const projectByTitle = await Project.findByTitle(id);
    if (projectByTitle) {
      return res.json(projectByTitle);
    }
    if (!ObjectId.isValid(id)) return res.status(400).json({ message: '올바르지 않은 데이터 ID입니다.' });
    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ message: '존재하지 않는 프로젝트입니다.' });
    return res.json(project);
  } catch (e) {
    return res.status(500).json({ message: '오류가 발생했습니다.', error: e });
  }
};
export const remove = async (req, res) => {
  const { id } = req.params;
  try {
    await Project.findByIdAndRemove(id);
    return res.status(204).json();
  } catch (e) {
    return res.status(500).json({ message: '오류가 발생했습니다.', error: e });
  }
};
export const update = async (req, res) => {
  const { id } = req.params;
  try {
    const project = await Project.findByIdAndUpdate(id, req.body, { new: true });
    if (!project) return res.status(404).json({ message: '존재하지 않는 프로젝트입니다.' });
    return res.json(project);
  } catch (e) {
    return res.status(500).json({ message: '오류가 발생했습니다.', error: e });
  }
};
export const like = async (req, res) => {
  const { id } = req.params;
  try {
    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ message: '존재하지 않는 게시물입니다.' });
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const canLike = await project.pressLike(ip);
    if (canLike) {
      await project.save();
      return res.status(200).json();
    } else {
      return res.status(409).json({ message: '이미 좋아요를 눌렀습니다.' });
    }
  } catch (e) {
    return res.status(500).json({ message: '오류가 발생했습니다.', error: e });
  }
};
export const writeComment = async (req, res) => {
  const { id } = req.params;
  try {
    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ message: '존재하지 않는 게시물입니다.' });
    const { commentId, comment } = req.body;
    await project.writeComment(commentId, comment);
    await project.save();
    return res.status(200).json();
  } catch (e) {
    return res.status(500).json({ message: '오류가 발생했습니다.', error: e });
  }
};
export const removeComment = async (req, res) => {
  const { id } = req.params;
  try {
    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ message: '존재하지 않는 게시물입니다.' });
    const { commentId, password } = req.body;
    const canRemove = await project.removeComment(commentId, password);
    if (canRemove) {
      await project.save();
      return res.status(200).json();
    } else {
      return res.status(401).json({ message: '비밀번호가 틀렸습니다.' });
    }
  } catch (e) {
    return res.status(500).json({ message: '오류가 발생했습니다.', error: e });
  }
};
