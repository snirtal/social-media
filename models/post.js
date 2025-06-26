const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Post = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  title: { type: String, required: true },
  created: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Post', Post);
