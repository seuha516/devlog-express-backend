import Post from '../../models/Post.js';
import Project from '../../models/Project.js';
import mongoose from 'mongoose';

const { ObjectId } = mongoose.Types;
export const checkObjectId = (req, res, next) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) return res.status(400).json();
  return next();
};

export const write = async (req, res) => {
  try {
    const post = new Post(req.body);
    await post.save();
    return res.json(post);
  } catch (e) {
    return res.status(500).json();
  }
};
export const list = async (req, res) => {
  const page = parseInt(req.query.page || '1', 10);
  if (page < 1 || isNaN(page)) return res.status(400).json();
  const { tag, project, sort } = req.query;
  const query = {
    ...(tag ? { 'tags.tag': tag } : {}),
    ...(project ? { 'series.project.name': project } : {}),
  };
  try {
    const posts = await Post.find(query)
      .sort({ _id: sort ? parseInt(sort, 10) : -1 })
      .limit(6)
      .skip((page - 1) * 6)
      .lean()
      .select('-body -series')
      .exec();
    const postCount = await Post.countDocuments(query).exec();
    const tagData = await Post.find()
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
    const seriesData = await Post.find()
      .sort({ _id: -1 })
      .lean()
      .select('series')
      .exec();
    let seriesList = [];
    for (let i = 0; i < seriesData.length; i++) {
      let exist = false;
      for (let j = 0; j < seriesList.length; j++) {
        if (seriesList[j].name === seriesData[i].series.name) {
          exist = true;
          seriesList[j].count++;
        }
      }
      if (!exist && seriesData[i].series.name !== '') {
        seriesList.push({
          name: seriesData[i].series.name,
          count: 1,
        });
      }
    }
    seriesList.sort(function (a, b) {
      return b.count - a.count;
    });
    return res.json({
      posts: posts,
      postCount: postCount,
      tags: tagList,
      series: seriesList,
    });
  } catch (e) {
    return res.status(500).json();
  }
};
export const read = async (req, res) => {
  const { id } = req.params;
  try {
    const post = await Post.findById(id).exec();
    console.log(post.id, post.title);
    const prev = await Post.find({ _id: { $lt: id } })
      .sort({ _id: -1 })
      .limit(1)
      .select('_id title');
    const next = await Post.find({ _id: { $gt: id } })
      .sort({ _id: 1 })
      .limit(1)
      .select('_id title');
    if (!post) return res.status(404).json();
    return res.json({ post, prev, next });
  } catch (e) {
    return res.status(500).json();
  }
};
export const remove = async (req, res) => {
  const { id } = req.params;
  try {
    await Post.findByIdAndRemove(id).exec();
    return res.status(204).json();
  } catch (e) {
    return res.status(500).json();
  }
};
export const update = async (req, res) => {
  const { id } = req.params;
  try {
    const post = await Post.findByIdAndUpdate(id, req.body, {
      new: true,
    }).exec();
    if (!post) return res.status(404).json();
    post.date.lastModifiedDate = new Date();
    await post.save();
    return res.json(post);
  } catch (e) {
    return res.status(500).json();
  }
};
export const series = async (req, res) => {
  const { series } = req.params;
  const { sort } = req.query;
  if (!series) return res.status(400).json();
  try {
    const posts = await Post.find({ 'series.name': series })
      .sort({ _id: sort ? parseInt(sort, 10) : 1 })
      .lean()
      .select('-body -series -tags')
      .exec();
    return res.json(posts);
  } catch (e) {
    return res.status(500).json();
  }
};
export const getlist = async (req, res) => {
  try {
    const titleList = await Project.find()
      .sort({ title: 1 })
      .lean()
      .select('_id title')
      .exec();
    const seriesData = await Post.find()
      .sort({ 'series.name': 1 })
      .lean()
      .select('series')
      .exec();
    let seriesList = [];
    for (let i = 0; i < seriesData.length; i++) {
      let exist = false;
      for (let j = 0; j < seriesList.length; j++) {
        if (seriesList[j] === seriesData[i].series.name) {
          exist = true;
          break;
        }
      }
      if (!exist && seriesData[i].series.name !== '') {
        seriesList.push(seriesData[i].series.name);
      }
    }
    const tagData = await Post.find()
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
      titles: titleList,
      series: seriesList,
      tags: tagList,
    });
  } catch (e) {
    return res.status(500).json();
  }
};
export const backup = async (req, res) => {
  try {
    const data = await Post.find().exec();
    return res.json(data);
  } catch (e) {
    return res.status(500).json();
  }
};
