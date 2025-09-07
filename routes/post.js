const express = require('express');
const router = express.Router();
const postController = require('../controllers/post');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

router.get('/statistics', postController.showPostStatistics);

router.route('/')
  .get(postController.getPosts)
  .post(upload.single('image'), postController.createPost);

router.route('/:id')
  .get(postController.getPost)
  .patch(postController.updatePost)
  .delete(postController.deletePost);


router.post('/about/search', postController.aboutSearch);
  
router.route('/:id/like')
.post(postController.toggleLike)

router.route('/search/:hobbyId')
  .post(postController.getHobbyPosts);

router.route('/hobby')
  .post(upload.single('image'), postController.createHobbyPost);

module.exports = router;