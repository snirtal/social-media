const Post = require('../models/post');
const Hobby = require('../models/hobby');
const userService = require ('../services/user')
const mongoose = require ('mongoose')
const createPost = async (userId, content,reqfile) => {
  const post = new Post({ user: userId, content,imagePath: reqfile });
  return await post.save();
};

const createHobbyPost = async (userId, content, hobbyId,reqfile) => {
    try {
    const newPost = await Post.create({
      user: userId,
      content: content,
      imagePath: reqfile
    });

    await Hobby.findByIdAndUpdate(hobbyId, {
      $push: { posts: newPost._id }
    });
    return newPost;
  } catch (err) {
    throw err;
  }
}


const searchPostsByDates = async (from, to) => {
  try {
    const fromDate = new Date(from);
    const toDate = new Date(to);

    const posts = await Post.find({
      created: {
        $gte: fromDate,
        $lte: toDate
      }
    })
    return posts;
  } catch (err) {
    console.error("Error searching posts by dates:", err);
    throw err;
  }
};

const getPostById = async (id) => await Post.findById(id).populate('user');

const toggleLike = async (postId, userId) => {
    try {
        const post = await Post.findById(postId);

        if (!post) {
            const error = new Error('Post not found.');
            error.statusCode = 404; // Custom status code for controller
            throw error;
        }

        const userIdObj = new mongoose.Types.ObjectId(userId);

        const userLiked = post.likes.includes(userIdObj);

        let isLiked; // To track the final state after toggle

        if (userLiked) {
            post.likes.pull(userIdObj); // Mongoose array method to remove an item
            isLiked = false;
        } else {
            // If not liked, add the like
            post.likes.push(userIdObj);
            isLiked = true;
        }

        await post.save();

        return {
            likesCount: post.likes.length,
            isLiked: isLiked
        };

    } catch (error) {
        console.error('Error in postService.toggleLike:', error);
        throw error;
    }
};

const getPosts = async (query = {}) => {
   return await Post.find(query).populate('user', 'firstName lastName profilePicture') 
                   .sort({ created: -1 }) 
                   .lean() }
const updatePost = async (id, content) => {
  const post = await getPostById(id);
  if (!post) return null;
  post.content = content;
  return await post.save();
};

const getHobbyPosts = async (postIds, filters = {}) => {
  const query = {};

  // Add hobby ID to the query
query._id = { $in: postIds }; // This is the correct way

  if (filters.content) {
    query.content = { $regex: filters.content, $options: 'i' };
  }

  // User name search
  if (filters.userName) {
    // Fetch users matching the name
    let users = await userService.getUsers({
      $or: [
        { firstName: { $regex: filters.userName, $options: 'i' } },
        { lastName: { $regex: filters.userName, $options: 'i' } }
      ]
    });
    // Map them to their IDs. Ensure userService.getUsers also returns lean objects or just IDs.
    let userIdsToFilter = users.map(user => user._id);

    if (userIdsToFilter.length > 0) {
      query.user = { $in: userIdsToFilter };
    } else {
      // If no users found matching the name, then no posts can match either.
      return [];
    }
  }

  // Date range search
  if (filters.startDate || filters.endDate) {
    query.created = {};
    if (filters.startDate) {
      query.created.$gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);
      query.created.$lte = endDate;
    }
  }
  const posts = await getPosts(query); 
  return posts; 
};

const deletePost = async (id) => {
  const post = await getPostById(id);
  if (!post) return null;
  return await post.deleteOne();
};

module.exports = { createPost,searchPostsByDates, getPostById, getPosts, updatePost, deletePost,createHobbyPost,getHobbyPosts,toggleLike };
