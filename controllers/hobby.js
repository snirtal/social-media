const user = require('../models/user');
const hobbyService = require('../services/hobby');
const userService = require('../services/user')
const getHobbiesViewPage = async (req, res) => {

  res.render('hobbies/list', { hobbies: await hobbyService.getHobbies(), user: req.session.user });
};

const getHobbies = async (req, res) => {
  try {
    const hobbies = await hobbyService.getHobbies();
    res.json(hobbies);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch hobbies' });
  }
};
const showCreateForm = (req, res) => {
  res.render('hobbies/create');
};
const createHobby = async (req, res) => {
  const { name, description, practiceTime, maxParticipants } = req.body;
  await hobbyService.createHobby(name, description, practiceTime, maxParticipants,req.session.user._id);
  res.render('hobbies/list', {hobbies: await hobbyService.getHobbies(),user: req.session.user}); // or res.render('hobbies/success');
};

const postsPerHobby = async (req,res) => {
  let data = await hobbyService.postsPerHobby()
  res.render('statistics/postHobbyGraph', {data: data})
}
const getEditPage = async (req,res) => {
  let data = await hobbyService.getHobbyById(req.params.id)
  res.render('hobbies/edit', {hobby: data, user: req.session.user})
}


const searchHobbies = async (req, res) => {
    try {
        const filters = req.body; 

        if (filters.minPracticeTime && isNaN(Number(filters.minPracticeTime))) {
            return res.status(400).json({ message: 'minPracticeTime must be a number.' });
        }

        const hobbies = await hobbyService.searchHobbies(filters);
        res.json(hobbies);
    } catch (error) {
        console.error('Error searching hobbies in controller:', error);
        res.status(500).json({ message: 'Failed to search hobbies.', error: error.message });
    }
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

const getHobby = async (req, res) => {
  const hobby = await hobbyService.getHobbyById(req.params.id);
  if (!hobby) return res.status(404).json({ errors: ['Hobby not found'] });
  res.json(hobby);
};

const updateHobby = async (req, res) => {
  const hobby = await hobbyService.updateHobby(req.params.id, req.body);
  if (!hobby) return res.status(404).json({ errors: ['Hobby not found'] });
  res.json(hobby);
};

const deleteHobby = async (req, res) => {
  const hobby = await hobbyService.deleteHobby(req.params.id);
  if (!hobby) return res.status(404).json({ errors: ['Hobby not found'] });
  res.render('hobbies/list', { hobbies: await hobbyService.getHobbies(), user: req.session.user });

};

module.exports = {
  createHobby,
  getHobbies,
  getHobby,
  updateHobby,
  deleteHobby,
  showCreateForm,
  getHobbiesViewPage,
  showGroupPage,
  postsPerHobby,
  getEditPage,
  searchHobbies
};
