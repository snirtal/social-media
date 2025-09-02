const express = require('express');
// bodyParser is technically not needed if you use express.json and express.urlencoded directly,
// but if you have legacy code relying on it, it's fine to keep.
// const bodyParser = require('body-parser'); // Keeping commented as per previous discussion
const cors = require('cors');
const mongoose = require('mongoose');
require('custom-env').env(process.env.NODE_ENV, './config');
const session = require('express-session');
// const multer = require ('multer') // Multer is defined in the specific route file now
mongoose.connect(process.env.CONNECTION_STRING);

const path = require('path');

const hobbyRoutes = require('./routes/hobby');
const userRoutes = require('./routes/user');
const postRoutes = require('./routes/post');

var app = express();

app.use(session({
    secret: '!@#!@#!@',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(cors());

// Keep these global body parsers for other requests (JSON, standard URL-encoded forms)
app.use(express.json()); // For application/json
app.use(express.urlencoded({ extended: true })); // For application/x-www-form-urlencoded

// Serve static files from the 'assets' directory (e.g., CSS, JS)
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// --- NEW CONFIGURATION FOR UPLOADS ---
// Serve uploaded files from the 'uploads' directory
// Requests to /uploads/filename.jpg will serve ./uploads/filename.jpg
app.use('/uploads', express.static('uploads'));
// --- END NEW CONFIGURATION ---

app.use('/hobbies', hobbyRoutes);
app.use('/users', userRoutes);
app.use('/posts', postRoutes);

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});