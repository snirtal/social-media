const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const User = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phoneNumber: { type: String },
    profileAvatar: {type: String, required: false, default: '/uploads/avatars/3.jpg'},
    age: {type: Number, default: 0},
    city: {type: String, default: ''},
    isDeleted: {type: Boolean, default: false},
    isAdmin: {type: Boolean, default: false},
    hobbies: [{ type: Schema.Types.ObjectId, ref: 'Hobby' }],
    friends: [{ type: Schema.Types.ObjectId, ref: 'User'}],
    // New fields
    bio: { type: String, default: '' },
    gender: { type: String, enum: ['Male', 'Female', 'Other', 'Prefer not to say', ''], default: '' },
    preferredCommunication: { type: String, enum: ['Email', 'Phone', 'SMS', ''], default: '' },
    location: {
        type: {
            type: String, // Must be 'Point' for GeoJSON Point
            enum: ['Point'],
            required: false
        },
        coordinates: {
            type: [Number], // Array of [longitude, latitude]
            required: false
        }
    }
});

User.index({ location: '2dsphere' });

module.exports = mongoose.model('User', User);
