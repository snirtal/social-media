const postService = require('../services/post');

const createPost = async (req, res) => {
  console.log(req)
  res.json(await postService.createPost(req.body.user, req.body.content));
};

const getPosts = async (req, res) => {
  res.json(await postService.getPosts());
};

const getPost = async (req, res) => {
  const post = await postService.getPostById(req.params.id);
  if (!post) return res.status(404).json({ errors: ['Post not found'] });
  res.json(post);
};

const updatePost = async (req, res) => {
  const post = await postService.updatePost(req.params.id, req.body.content);
  if (!post) return res.status(404).json({ errors: ['Post not found'] });
  res.json(post);
};

const deletePost = async (req, res) => {
  const post = await postService.deletePost(req.params.id);
  if (!post) return res.status(404).json({ errors: ['Post not found'] });
  res.json({ message: 'Deleted successfully' });
};

module.exports = { createPost, getPosts, getPost, updatePost, deletePost };
