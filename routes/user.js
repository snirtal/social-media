const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');

router.route('/')
  .get(userController.getUsers)
  .post(userController.createUser);
router.get('/home',userController.showHomePage); 
router.get('/feed', userController.showFeedPage); 
router.get('/view', userController.getUsersViewPage); 
router.get('/statistics', userController.showUserStatisticsPage)
router.get('/usersByAge', userController.userByAgeStatistics)
router.get('/profile', userController.showProfilePage)
router.post('/signin',userController.authenticateUser)
router.post('/:id/toggle-admin', userController.toggleAdmin)
router.post('/toggle-friend', userController.toggleFriend)
router.post('/search', userController.searchUsers)
router.post('/logout', userController.logout)
router.get('/about', userController.renderAboutPage)
router.post('/:id/hobby/:hobbyId',userController.toggleHobby);

router.route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
