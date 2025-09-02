const express = require('express');
const router = express.Router();
const hobbyController = require('../controllers/hobby');

router.route('/')
  .get(hobbyController.getHobbies)
  .post(hobbyController.createHobby);

router.get('/view', hobbyController.getHobbiesViewPage); 

router.get('/create', hobbyController.showCreateForm);
router.get('/group', hobbyController.showGroupPage)
router.get('/statistics', hobbyController.postsPerHobby)
router.get('/edit/:id', hobbyController.getEditPage);
router.route('/:id')
  .get(hobbyController.getHobby)
  .patch(hobbyController.updateHobby)
  .delete(hobbyController.deleteHobby);

  router.route('/search').post(hobbyController.searchHobbies)


module.exports = router;


