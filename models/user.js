const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const User = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phoneNumber: { type: String },
  hobbies: [{ type: Schema.Types.ObjectId, ref: 'Hobby' }]
});

module.exports = mongoose.model('User', User);
