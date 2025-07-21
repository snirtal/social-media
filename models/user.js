const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const User = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phoneNumber: { type: String },
  profileAvatar: {type: String, required: false, default: 'https://static.vecteezy.com/system/resources/previews/002/002/403/non_2x/man-with-beard-avatar-character-isolated-icon-free-vector.jpg'},
  age: {type: Number, default: 0},
  city: {type: String, default: ''},
  isAdmin: {type: Boolean, default: false},
  hobbies: [{ type: Schema.Types.ObjectId, ref: 'Hobby' }],
  friends: [{ type: Schema.Types.ObjectId, ref: 'User'}],
   location: {
    type: {
      type: String, 
      enum: ['Point'],
      required: false
    },
    coordinates: {
      type: [Number], 
      required: false
    }
  }
});

User.index({ location: '2dsphere' });

module.exports = mongoose.model('User', User);
