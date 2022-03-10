import Post from '../models/Post.js';

const updateData = async () => {
  try {
    const posts = await Post.find().exec();
    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      await Post.findByIdAndUpdate(post._id, { body: post.body.replace('https://seungha-devlog-server.xyz:4000/get/', 'https://seungha-devlog-server.xyz:4000/image/') });
      console.log(i);
    }
  } catch (e) {
    return res.status(500).json({ message: '오류가 발생했습니다.', error: e });
  }
};

export default updateData;
