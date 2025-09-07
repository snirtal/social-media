const postService = require('../services/post');
const hobbyService = require('../services/hobby');
const userService = require('../services/user');
const axios = require('axios');
const fs = require('fs').promises; // Import the promises-based fs module
const path = require('path');

// IMPORTANT: Never hardcode sensitive information like this in a real application.
// Use environment variables instead.
const FACEBOOK_PAGE_ID = '822706394248558';
const FACEBOOK_ACCESS_TOKEN = 'EAAUeK8KSZCGkBPRdxw5tneWAyoGXHkTNVRTdstR1MZBOWzWUKvHdAK99BokbmKS5RT8lyPkS4Ii2Dyv6Yx9mM07C9Jvhm4TXKMPwfDVubOxrtRiNzoee5FhRG34S4NDDsoD2TrGa6MJLZCbuuJZAKZCdMNA42twoku1w6HEKwpKEiFi1DJao4q3x7FiPZBXWE0TWZAQ87ZBo';

// Imgur Client ID for API calls. Get one from your Imgur account.
// This should also be an environment variable.
const IMGUR_CLIENT_ID = 'YOUR_IMGUR_CLIENT_ID_HERE';

async function uploadImageToImgur(filePath) {
  try {
    const imageData = await fs.readFile(filePath);
    const base64Image = imageData.toString('base64');

    const response = await axios.post(
      'https://api.imgur.com/3/upload',
      {
        image: base64Image,
        type: 'base64',
      },
      {
        headers: {
          Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
        },
      }
    );

    return response.data.data.link;
  } catch (error) {
    console.error('Error uploading image to Imgur:', error.response ? error.response.data : error.message);
    return null;
  }
}

// Function to share the post to Facebook
async function sharePostToFacebook(content, imageUrl) {
  try {
    let endpoint = `https://graph.facebook.com/v19.0/${FACEBOOK_PAGE_ID}/feed`;
    let postData = {
      message: content,
      access_token: FACEBOOK_ACCESS_TOKEN
    };

    // If a public image URL is present, change the endpoint and include the image URL
    if (imageUrl) {
      endpoint = `https://graph.facebook.com/v19.0/${FACEBOOK_PAGE_ID}/photos`;
      postData = {
        url: imageUrl, // This URL must be publicly accessible
        message: content,
        access_token: FACEBOOK_ACCESS_TOKEN
      };
    }

    const response = await axios.post(endpoint, postData);
    console.log('Post successfully shared to Facebook:', response.data);
  } catch (error) {
    console.error('Error sharing post to Facebook:', error.response ? error.response.data : error.message);
  }
}

const createPost = async (req, res) => {
  const { content } = req.body;
  const userId = req.session.user._id;
  
  // Use a variable to hold the final, public URL for the image
  let publicImageUrl = '';
  
  // Check if a file was uploaded
  if (req.file) {
    // Upload the image to Imgur and get the public URL
    publicImageUrl = await uploadImageToImgur(req.file.path);
  }
  const imageFile = publicImageUrl;
  
  let post = await postService.createPost(userId, content, req.file.path);
  
  // Automatically share the new post to Facebook
  await sharePostToFacebook(content, imageFile);
  
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
  if (req.session.user) {
    const { content, hobbyId } = req.body;
    const userId = req.session.user._id;

    // Use a variable to hold the final, public URL for the image
    let publicImageUrl = '';
    
    // Check if a file was uploaded
    if (req.file) {
      // Upload the image to Imgur and get the public URL
      publicImageUrl = await uploadImageToImgur(req.file.path);
    }
    const imageFile = publicImageUrl;

    try {
      const post = await postService.createHobbyPost(userId, content, hobbyId, req.file.path);

      if (!post) {
        return res.status(500).json({ message: 'Failed to create post in service.' });
      }

      // Automatically share the new post to Facebook
      await sharePostToFacebook(content, imageFile);

      const hobby = await hobbyService.getHobbyById(hobbyId);

      if (!hobby) {
        return res.status(404).json({ message: 'Hobby not found after post creation.' });
      }

      let isHobbyOwner = hobby.createdBy ? userId.toString() === hobby.createdBy.toString() : false;
      const usersByHobby = await userService.getUsersByHobbyId(hobby.id);
      let users = await userService.getUsers();
      let usersNotInHobby = users.filter(x => usersByHobby.some(y => y._id.toString() == x._id.toString()) == false);
      res.render('hobbies/group', { hobby: hobby, user: req.session.user, isHobbyOwner, usersByHobby, usersNotInHobby });

    } catch (error) {
      console.error('Error in createHobbyPost:', error);
      res.status(500).json({ message: 'Internal server error while creating hobby post.', error: error.message });
    }
  } else {
    res.render('user/home');
  }
};
const toggleLike = async (req, res) => {
  const like = await postService.toggleLike(req.params.id, req.body.userId);
  return res.status(200).json(like);
};
const updatePost = async (req, res) => {
  const post = await postService.updatePost(req.params.id, req.body.content);
  if (!post) return res.status(404).json({ errors: ['Post not found'] });
  res.json(post);
};




const aboutSearch = async (req,res) => {

    const today = new Date(req.body.from); 
const lastWeek = new Date(req.body.to);

    let lastWeekPosts = await postService.searchPostsByDates(today,lastWeek)
     res.json({lastWeekPosts: lastWeekPosts?.length });

}
const deletePost = async (req, res) => {
  const post = await postService.deletePost(req.params.id);
  if (!post) return res.status(404).json({ errors: ['Post not found'] });
  res.json({ message: 'Deleted successfully' });
};

module.exports = { showPostStatistics,aboutSearch, createPost, getPosts, getPost, updatePost, deletePost, createHobbyPost, getHobbyPosts, toggleLike };

