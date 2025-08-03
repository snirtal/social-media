const userService = require('../services/user');

const createUser = async (req, res) => {
  res.json(await userService.createUser(req.body.username, req.body.hobbies));
};

const showHomePage = (req, res) => {
  res.render('user/home');
};

const showFeedPage = (req, res) => {
  res.render('user/feed');
};
const getUsers = async (req, res) => {
  res.json(await userService.getUsers());
};

const getUser = async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  if (!user) return res.status(404).json({ errors: ['User not found'] });
  res.json(user);
};

const updateUser = async (req, res) => {
  const user = await userService.updateUser(req.params.id, req.body.username, req.body.hobbies);
  if (!user) return res.status(404).json({ errors: ['User not found'] });
  res.json(user);
};

const deleteUser = async (req, res) => {
  const user = await userService.deleteUser(req.params.id);
  if (!user) return res.status(404).json({ errors: ['User not found'] });
  res.json({ message: 'Deleted successfully' });
};

module.exports = { createUser, getUsers, getUser, updateUser, deleteUser,showHomePage,showFeedPage };
