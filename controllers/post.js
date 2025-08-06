const postService = require('../services/post');
const hobbyService = require('../services/hobby');
const userService = require('../services/user');
const createPost = async (req, res) => {
  const { content } = req.body;

  const userId = req.session.user._id;

  const imageFile = req.file ?req.file.path : '';

  let post = await postService.createPost(userId,content,imageFile);
  res.json(post);
};

const getPosts = async (req, res) => {
  res.json(await postService.getPosts());
};

const showPostStatistics = (req, res) => {
  res.render('statistics/postsGraph');
};

const getPost = async (req, res) => {
  const post = await postService.getPostById(req.params.id);
  if (!post) return res.status(404).json({ errors: ['Post not found'] });
  res.json(post);
};

const getHobbyPosts = async (req, res) => {
  try {
    const hobbyId = req.params.hobbyId;
    const filters = req.body;
    let hobby = await hobbyService.getHobbyById(hobbyId);
    let postsIds = hobby && hobby.posts ? hobby.posts.map(x => x._id) : [];
    const posts = await postService.getHobbyPosts(postsIds, filters);
    console.log('res', posts);
    res.json(posts);
  } catch (error) {
    console.error('Error searching hobby posts:', error);
    res.status(500).json({ message: 'Error searching posts', error: error.message });
  }
};

const createHobbyPost = async (req, res) => {
  console.log('--- Inside createHobbyPost controller ---');

  const { content, hobbyId } = req.body;

  const userId = req.session.user._id;

  const imageFile = req.file ? req.file.path : ''; 

  try {
    const post = await postService.createHobbyPost(userId, content, hobbyId, imageFile);

    if (!post) {
      return res.status(500).json({ message: 'Failed to create post in service.' });
    }

    const hobby = await hobbyService.getHobbyById(hobbyId);

    if (!hobby) {
      return res.status(404).json({ message: 'Hobby not found after post creation.' });
    }

    let isHobbyOwner = hobby.createdBy ? userId.toString() === hobby.createdBy.toString() : false;
    const usersByHobby = await userService.getUsersByHobbyId(hobby.id);
         let users = await userService.getUsers();
     let usersNotInHobby = users.filter(x=> usersByHobby.some(y => y._id.toString() == x._id.toString()) == false);
    res.render('hobbies/group', { hobby: hobby, user: req.session.user, isHobbyOwner,usersByHobby, usersNotInHobby });

  } catch (error) {
    console.error('Error in createHobbyPost:', error);
    // Send a JSON error response instead of just 500
    res.status(500).json({ message: 'Internal server error while creating hobby post.', error: error.message });
  }
};
const toggleLike = async (req,res) => {
 const like = await postService.toggleLike(req.params.id,req.body.userId);
 return res.status(200).json(like);
}
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

module.exports = { showPostStatistics, createPost, getPosts, getPost, updatePost, deletePost, createHobbyPost, getHobbyPosts, toggleLike };
