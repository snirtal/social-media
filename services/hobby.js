const Hobby = require('../models/hobby');

const createHobby = async (name, description, practiceTime, maxParticipants,createdBy) => {
  const hobby = new Hobby({ name, description, practiceTime, maxParticipants, createdBy });
  return await hobby.save();
};


module.exports = {
  createHobby
};
