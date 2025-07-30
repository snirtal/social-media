const User = require('../models/user');

const createUser = async (firstName, lastName, email, password, phoneNumber, city, age, bio = '', gender = '', preferredCommunication = '', hobbies = [], friends = []) => {
    const user = new User({ firstName, lastName, email, password, phoneNumber, city, age, bio, gender, preferredCommunication, hobbies, friends });
    return await user.save();
};

const getUserById = async (id) => await User.findById(id).populate('hobbies');

module.exports = { createUser, getUserById };
