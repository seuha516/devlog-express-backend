import Post from '../../models/Post.js';
import Project from '../../models/Project.js';

export const catalog = async (req, res) => {
  try {
    const titleData = await Project.find().sort({ title: 1 }).lean().select('title').exec();
    const seriesData = await Post.find().sort({ series: 1 }).lean().select('series').exec();
    let titleList = [];
    for (let i = 0; i < titleData.length; i++) {
      titleList.push(titleData[i].title);
    }
    let seriesList = [];
    for (let i = 0; i < seriesData.length; i++) {
      let exist = false;
      for (let j = 0; j < seriesList.length; j++) {
        if (seriesList[j] === seriesData[i].series) {
          exist = true;
          break;
        }
      }
      if (!exist && seriesData[i].series !== '') {
        seriesList.push(seriesData[i].series);
      }
    }
    const tagData = await Post.find().lean().select('tags').exec();
    let tagList = {};
    for (let i = 0; i < tagData.length; i++) {
      for (let j = 0; j < tagData[i].tags.length; j++) {
        if (!tagList[tagData[i].tags[j].name]) {
          tagList[tagData[i].tags[j].name] = tagData[i].tags[j].color;
        }
      }
    }
    return res.json({
      titles: titleList,
      series: seriesList,
      tags: tagList,
    });
  } catch (e) {
    return res.status(500).json({ message: '오류가 발생했습니다.', error: e });
  }
};
export const list = async (req, res) => {
  const page = parseInt(req.query.page || '1');
  if (page < 1 || isNaN(page)) return res.status(400).json({ message: '페이지 값이 올바르지 않습니다.' });
  const { tag, project, series, sort } = req.query;
  const query = {
    ...(tag ? { 'tags.name': tag } : {}),
    ...(project ? { project: project } : {}),
    ...(series ? { series: series } : {}),
  };

  try {
    const posts = await Post.find(query)
      .sort({ _id: sort ? parseInt(sort) : -1 })
      .limit(6)
      .skip((page - 1) * 6)
      .lean()
      .select('-body -series -project -like -comment')
      .exec();
    const postCount = await Post.countDocuments(query);
    const tagData = await Post.find().lean().select('tags').exec();
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
    const seriesData = await Post.find().lean().select('series').exec();
    let seriesList = [];
    for (let i = 0; i < seriesData.length; i++) {
      let exist = false;
      for (let j = 0; j < seriesList.length; j++) {
        if (seriesList[j].name === seriesData[i].series) {
          exist = true;
          seriesList[j].count++;
        }
      }
      if (!exist && seriesData[i].series !== '') {
        seriesList.push({
          name: seriesData[i].series,
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
    return res.status(500).json({ message: '오류가 발생했습니다.', error: e });
  }
};
export const write = async (req, res) => {
  try {
    const post = new Post(req.body);
    await post.save();
    return res.json(post);
  } catch (e) {
    return res.status(500).json({ message: '오류가 발생했습니다.', error: e });
  }
};
export const read = async (req, res) => {
  const { id } = req.params;
  try {
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: '존재하지 않는 게시물입니다.' });
    const prev = await Post.find({ _id: { $lt: id } })
      .sort({ _id: -1 })
      .limit(1)
      .select('_id title')
      .exec();
    const next = await Post.find({ _id: { $gt: id } })
      .sort({ _id: 1 })
      .limit(1)
      .select('_id title')
      .exec();
    return res.json({ post, prev: prev[0] || null, next: next[0] || null });
  } catch (e) {
    return res.status(500).json({ message: '오류가 발생했습니다.', error: e });
  }
};
export const remove = async (req, res) => {
  const { id } = req.params;
  try {
    await Post.findByIdAndRemove(id).exec();
    return res.status(204).json();
  } catch (e) {
    return res.status(500).json({ message: '오류가 발생했습니다.', error: e });
  }
};
export const update = async (req, res) => {
  const { id } = req.params;
  try {
    const post = await Post.findByIdAndUpdate(id, req.body, { new: true });
    if (!post) return res.status(404).json({ message: '존재하지 않는 게시물입니다.' });
    post.date.lastModifiedDate = new Date();
    await post.save();
    return res.json(post);
  } catch (e) {
    return res.status(500).json({ message: '오류가 발생했습니다.', error: e });
  }
};
export const like = async (req, res) => {
  const { id } = req.params;
  try {
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: '존재하지 않는 게시물입니다.' });
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const canLike = await post.pressLike(ip);
    if (canLike) {
      await post.save();
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
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: '존재하지 않는 게시물입니다.' });
    const { commentId, comment } = req.body;
    await post.writeComment(commentId, comment);
    await post.save();
    return res.status(200).json();
  } catch (e) {
    return res.status(500).json({ message: '오류가 발생했습니다.', error: e });
  }
};
export const removeComment = async (req, res) => {
  const { id } = req.params;
  try {
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: '존재하지 않는 게시물입니다.' });
    const { commentId, password } = req.body;
    const canRemove = await post.removeComment(commentId, password);
    if (canRemove) {
      await post.save();
      return res.status(200).json();
    } else {
      return res.status(401).json({ message: '비밀번호가 틀렸습니다.' });
    }
  } catch (e) {
    return res.status(500).json({ message: '오류가 발생했습니다.', error: e });
  }
};
