const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Hobby = new Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  created: {
    type: Date,
    default: Date.now
  },
  practiceTime: {
    type: Number,
    required: true
  },
  maxParticipants: {
    type: Number,
    required: true
  },
  posts: [{
    type: Schema.Types.ObjectId,
    ref: 'Post'
  }],
  createdBy: {
    type: Schema.Types.ObjectId, 
    ref: 'User',                 
    required: false               
  }
});

module.exports = mongoose.model('Hobby', Hobby);
