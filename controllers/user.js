const userService = require('../services/user');
const hobbyService = require('../services/hobby');
const postsService = require('../services/post');

const createUser = async (req, res) => {
    try {
        const {
            firstname,
            lastname,
            email,
            password,
            phone,
            city,
            age,
            bio, // New field
            gender, // New field
            preferredCommunication, // New field
            hobbies = [] // Ensure hobbies is an array, default to empty
        } = req.body;

        const user = await userService.createUser(
            firstname,
            lastname,
            email,
            password,
            phone,
            city,
            age,
            bio, // Pass new field
            gender, // Pass new field
            preferredCommunication, // Pass new field
            hobbies
        );

        // Populate session with new fields
        req.session.user = {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            isAdmin: user.isAdmin,
            phoneNumber: user.phoneNumber,
            profileAvatar: user.profileAvatar,
            latitude: user.location && user.location.coordinates ? user.location.coordinates[1] : undefined,
            longitude: user.location && user.location.coordinates ? user.location.coordinates[0] : undefined,
            city: user.city,
            age: user.age,
            bio: user.bio, // Add new field to session
            gender: user.gender, // Add new field to session
            preferredCommunication: user.preferredCommunication, // Add new field to session
            hobbies: user.hobbies.map(x => x.id) // Assuming hobbies are populated or you just need IDs
        };

        let posts = await postsService.getPosts();
        res.render('user/feed', { user: req.session.user, allPosts: posts });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ errors: ['Failed to create user.', error.message] });
    }
};

const showHomePage = (req, res) => {
    res.render('user/home');
};

const showProfilePage = async (req, res) => {
    let hobbies = await hobbyService.getHobbies();
    // Ensure the user data for the profile page is fresh, especially if it was just updated
    // or if the session user might be stale.
    // For a profile page, it's often good practice to fetch the latest user data from DB
    // rather than relying solely on session, unless session is guaranteed to be updated
    // immediately upon any profile change.
    // Assuming req.session.user._id is always available if logged in:
    const user = req.session.user ? await userService.getUserById(req.session.user._id) : null;

    if (!user) {
        // Handle case where user is not found or not logged in
        return res.redirect('/login'); // Or render an error page
    }

    // Update session with the latest user data from DB before rendering profile page
    // This ensures that the rendered profile page shows the most up-to-date data,
    // including any new fields that might have been populated by default or in a previous update.
    req.session.user = {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isAdmin: user.isAdmin,
        phoneNumber: user.phoneNumber,
        profileAvatar: user.profileAvatar,
        latitude: user.location && user.location.coordinates ? user.location.coordinates[1] : undefined,
        longitude: user.location && user.location.coordinates ? user.location.coordinates[0] : undefined,
        city: user.city,
        age: user.age,
        bio: user.bio, // Add new field to session
        gender: user.gender, // Add new field to session
        preferredCommunication: user.preferredCommunication, // Add new field to session
        hobbies: user.hobbies.map(x => x.id)
    };

    res.render('user/profile', { user: req.session.user, hobbies });
};


const showFeedPage = async (req, res) => {
    let posts = await postsService.getPosts()
    if (req.session.user) {
        res.render('user/feed', { user: req.session.user, allPosts: posts });
    } else {
        res.render('user/feed', { user: null, allPosts: posts });
    }
};

const showUserStatisticsPage = (req, res) => {
    res.render('statistics/usersNetwork.ejs');
};

const userByAgeStatistics = async (req, res) => {
    let data = await userService.usersByAge();
    res.render('statistics/usersByAge.ejs', { data: data });
};

const getUsersViewPage = async (req, res) => {
    if(req.session.user && req.session.user.isAdmin) {
    let users = await userService.getUsers();
    res.render('user/view', { users }); }
    else {
    res.render('user/home')
    }
};

const toggleAdmin = async (req, res) => {
        if(req.session.user && req.session.user.isAdmin) {

    try {
        let user = await userService.toggleAdmin(req.params.id);
        res.json(user);
    } catch (error) {
        console.error('Error toggling admin status:', error);
        res.status(500).json({ errors: ['Failed to toggle admin status.', error.message] });
    }
} res.status(401)
};

const getUsers = async (req, res) => {
    try {
        let users = await userService.getUsers();
        res.json(users);
    } catch (error) {
        console.error('Error getting users:', error);
        res.status(500).json({ errors: ['Failed to retrieve users.', error.message] });
    }
};

const getUser = async (req, res) => {
    try {
        const user = await userService.getUserById(req.params.id);
        if (!user) return res.status(404).json({ errors: ['User not found'] });
        res.json(user);
    } catch (error) {
        console.error('Error getting user by ID:', error);
        res.status(500).json({ errors: ['Failed to retrieve user.', error.message] });
    }
};

const updateUser = async (req, res) => {
    // Extract common fields, including new ones
    const updateData = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        phoneNumber: req.body.phoneNumber,
        profileAvatar: req.body.profileAvatar,
        city: req.body.city,
        age: parseInt(req.body.age, 10) || 0, // Ensure age is a number, default to 0 if invalid
        bio: req.body.bio, // New field
        gender: req.body.gender, // New field
        preferredCommunication: req.body.preferredCommunication // New field
    };

    // --- Handle Location (GeoJSON) ---
    // Ensure req.body.location and req.body.location.coordinates exist before accessing
    if (req.body.location && Array.isArray(req.body.location.coordinates) && req.body.location.coordinates.length === 2) {
        const latitude = parseFloat(req.body.location.coordinates[1]);
        const longitude = parseFloat(req.body.location.coordinates[0]);

        if (!isNaN(latitude) && !isNaN(longitude)) {
            updateData.location = {
                type: 'Point',
                coordinates: [longitude, latitude] // IMPORTANT: GeoJSON is [longitude, latitude]
            };
        }
    } else {
        // If location is explicitly sent as null/undefined or invalid, remove it
        // This is important if a user wants to clear their location
        if (req.body.location === null) {
             updateData.location = null;
        }
    }

    // --- Handle Hobbies ---
    // Ensure hobbies is always an array
    if (req.body.hobbies) {
        if (!Array.isArray(req.body.hobbies)) {
            updateData.hobbies = [req.body.hobbies];
        } else {
            updateData.hobbies = req.body.hobbies;
        }
    } else {
        updateData.hobbies = []; // Default to an empty array if no hobbies are sent
    }

    try {
        const user = await userService.updateUser(req.params.id, updateData);

        if (!user) {
            return res.status(404).json({ errors: ['User not found'] });
        }

        // Update session user data with all fields, including new ones
        req.session.user = {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            isAdmin: user.isAdmin,
            phoneNumber: user.phoneNumber,
            profileAvatar: user.profileAvatar,
            // Access location from the Mongoose user object
            latitude: user.location && user.location.coordinates ? user.location.coordinates[1] : undefined,
            longitude: user.location && user.location.coordinates ? user.location.coordinates[0] : undefined,
            city: user.city,
            age: user.age,
            bio: user.bio, // Add new field to session
            gender: user.gender, // Add new field to session
            preferredCommunication: user.preferredCommunication, // Add new field to session
            hobbies: user.hobbies.map(h => h.toString()) // Convert hobbies ObjectIds back to strings for session
        };

        req.session.save(err => {
            if (err) {
                console.error('Session save error:', err);
                return res.status(500).json({ errors: ['Failed to save session'] });
            }
            res.json(user);
        });
    } catch (error) {
        console.error('Error updating user:', error);
        if (error.name === 'ValidationError') {
            const errors = Object.keys(error.errors).map(key => error.errors[key].message);
            return res.status(400).json({ errors: errors });
        }
        res.status(500).json({ errors: ['Failed to update profile.', error.message] });
    }
};

const deleteUser = async (req, res) => {
    if(req.session.user && req.session.isAdmin) {
    try {
        const user = await userService.deleteUser(req.params.id);
        if (!user) return res.status(404).json({ errors: ['User not found'] });
        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ errors: ['Failed to delete user.', error.message] });
    } } 
    else {
        res.status(401)
    }
};

const toggleHobby = async (req,res) => {
  let hobbyId = req.params.hobbyId;
  let userId = req.params.id
  let hobby = await hobbyService.getHobbyById(hobbyId);
  if(hobby) {
   let response = await  userService.toggleHobby(userId,hobbyId);
      return res.json({ message: 'Toggled successfully' });
  }
    return res.status(500).json({ errors: ['Failed To Find Hobby'] }); 
}
const renderAboutPage = async (req,res) => {
            res.render('user/about');

}
const logout = (req, res) => {
    if (req.session) {
        req.session.destroy(err => {
            if (err) {
                console.error('Error destroying session:', err);
                return res.status(500).json({ message: 'Could not log out. Please try again.' });
            }
            res.status(200).json({ message: 'Logged out successfully' }); // Use status(200).json for success
        });
    } else {
        res.status(500).json({ message: 'No active session to destroy.' }); // Provide a clearer message
    }
};

const searchUsers = async (req, res) => {
    try {
        const { name, ageMin, ageMax, city, hobby, gender, preferredCommunication } = req.body; // Add new search criteria
        const currentUserId = req.session.user._id;

        const query = {
            _id: { $ne: currentUserId }
        };

        if (name) {
            query.$or = [
                { firstName: { $regex: name, $options: 'i' } },
                { lastName: { $regex: name, $options: 'i' } }
            ];
        }

        if (ageMin || ageMax) {
            query.age = {};
            if (ageMin) {
                query.age.$gte = ageMin;
            }
            if (ageMax) {
                query.age.$lte = ageMax;
            }
        }

        if (city) {
            query.city = { $regex: city, $options: 'i' };
        }

        if (hobby) {
            query.hobbies = hobby;
        }

        // Add new search criteria to query
        if (gender) {
            query.gender = gender;
        }
        if (preferredCommunication) {
            query.preferredCommunication = preferredCommunication;
        }

        const users = await userService.getUsers(query);
        res.json(users);
    } catch (error) {
        console.error('Error searching users:', error);
        res.status(500).json({ message: 'Error searching users', error: error.message });
    }
};

const authenticateUser = async (req, res) => {
    try {
        const users = await userService.getUsers();
        const { email, password } = req.body;

        // In a real application, you'd hash the password and compare it securely
        let user = users.find(x => x.email.toLowerCase() === email.toLowerCase() && x.password === password); // Fix: compare x.password with password

        if (!user) {
            // It's better to render a login page with an error message or send JSON error
            return res.status(401).json({ errors: ['Invalid email or password.'] });
        }

        // Populate session with all user data, including new fields
        req.session.user = {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            isAdmin: user.isAdmin,
            phoneNumber: user.phoneNumber,
            profileAvatar: user.profileAvatar,
            latitude: user.location && user.location.coordinates ? user.location.coordinates[1] : undefined,
            longitude: user.location && user.location.coordinates ? user.location.coordinates[0] : undefined,
            city: user.city,
            age: user.age,
            bio: user.bio, // Add new field to session
            gender: user.gender, // Add new field to session
            preferredCommunication: user.preferredCommunication, // Add new field to session
            hobbies: user.hobbies.map(x => x.id)
        };

        let posts = await postsService.getPosts();
        res.render('user/feed', { user: req.session.user, allPosts: posts });
    } catch (error) {
        console.error('Error authenticating user:', error);
        res.status(500).json({ errors: ['Failed to authenticate user.', error.message] });
    }
};

const toggleFriend = async (req, res) => {
    try {
        // Ensure user is logged in
        if (!req.session.user || !req.session.user._id) {
            return res.status(401).json({ message: 'Unauthorized: User not logged in.' });
        }
        const user = await userService.toggleFriend(req.session.user._id, req.body.friendId);
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message || 'Server error toggling friend status.' });
    }
};

module.exports = {
    createUser,
    getUsers,
    showUserStatisticsPage,
    searchUsers,
    getUsersViewPage,
    getUser,
    updateUser,
    userByAgeStatistics,
    deleteUser,
    showHomePage,
    showFeedPage,
    showProfilePage,
    authenticateUser,
    toggleAdmin,
    toggleFriend,
    logout,toggleHobby,
    renderAboutPage
};
