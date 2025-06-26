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

});

module.exports = mongoose.model('Hobby', Hobby);
