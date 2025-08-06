const hobbyService = require('../services/hobby');

const getHobbies = async (req, res) => {
  res.render('hobbies/list', { hobbies: await hobbyService.getHobbies() });
};
const showCreateForm = (req, res) => {
  res.render('hobbies/create');
};
const createHobby = async (req, res) => {
    console.log(req)
  const { name, description, practiceTime, maxParticipants } = req.body;
  await hobbyService.createHobby(name, description, practiceTime, maxParticipants);
  res.redirect('/hobbies/view'); // or res.render('hobbies/success');
};

const getHobby = async (req, res) => {
  const hobby = await hobbyService.getHobbyById(req.params.id);
  if (!hobby) return res.status(404).json({ errors: ['Hobby not found'] });
  res.json(hobby);
};


const showGroupPage = async (req, res) => {
  const hobbyId = req.query.hobby;

   hobbyService.getHobbyById(hobbyId)
    .then(async hobby => {
      if (!hobby) {
        return res.status(404).send('Hobby not found');
      }
     let usersByHobby = await userService.getUsersByHobbyId(hobbyId);
     let users = await userService.getUsers();
     let usersNotInHobby = users.filter(x=> usersByHobby.some(y => y._id.toString() == x._id.toString()) == false);
     let isHobbyOwner = hobby.createdBy ? req.session.user._id.toString() == hobby.createdBy.toString() : false;
      res.render('hobbies/group', { hobby: hobby, user: req.session.user, isHobbyOwner, usersByHobby, usersNotInHobby });
    })
    .catch(err => {
      console.error(err);
      res.status(500).send('Server error');
    });
}


const updateHobby = async (req, res) => {
  const hobby = await hobbyService.updateHobby(req.params.id, req.body);
  if (!hobby) return res.status(404).json({ errors: ['Hobby not found'] });
  res.json(hobby);
};
const postsPerHobby = async (req,res) => {
  let data = await hobbyService.postsPerHobby()
  res.render('statistics/postHobbyGraph', {data: data})
}
const deleteHobby = async (req, res) => {
  const hobby = await hobbyService.deleteHobby(req.params.id);
  if (!hobby) return res.status(404).json({ errors: ['Hobby not found'] });
  res.json({ message: 'Deleted successfully' });
};

module.exports = {
  createHobby,
  getHobbies,
  getHobby,
  updateHobby,
  deleteHobby,
  showCreateForm
};

