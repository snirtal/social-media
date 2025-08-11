const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');

router.get('/home',userController.showHomePage); 

router.route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
