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

const updateHobby = async (req, res) => {
  const hobby = await hobbyService.updateHobby(req.params.id, req.body);
  if (!hobby) return res.status(404).json({ errors: ['Hobby not found'] });
  res.json(hobby);
};

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
