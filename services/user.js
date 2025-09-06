const User = require('../models/user');

const createUser = async (firstName, lastName, email, password, phoneNumber, city, age, bio = '', gender = '', preferredCommunication = '', hobbies = [], friends = []) => {
    const user = new User({ firstName, lastName, email, password, phoneNumber, city, age, bio, gender, preferredCommunication, hobbies, friends });
    return await user.save();
};

const getUserById = async (id) => await User.findById(id).populate('hobbies');

const getUsers = async (query = {}) => await User.find(query).populate('hobbies').populate('friends');

const updateUser = async (id, updateData) => {
    // updateData should now contain bio, gender, preferredCommunication if they are being updated
    return await User.findByIdAndUpdate(id, updateData, { new: true });
};

const deleteUser = async (id) => {
    const user = await getUserById(id);
    if (!user) return null;
    user.isDeleted = true;
    return await user.save();
};


const searchUsersByGender = async (gender) => {
  try {
    if (!gender) return [];

    const users = await User.find({ gender })

    return users;
  } catch (err) {
    console.error("Error searching users by gender:", err);
    throw err;
  }
};

const getUsersByHobbyId = async (hobbyId) => {
    try {
        const users = await User.find({ hobbies: hobbyId })
            .populate('hobbies')
            .populate('friends');
        return users;
    } catch (error) {
        throw error; // Re-throw to be handled by the calling route
    }
};

const toggleAdmin = async (id) => {
    const user = await getUserById(id)
    if (!user) return null;
    user.isAdmin = !user.isAdmin;
    return await user.save();
}

const usersByAge = async () => {
    try {
        const data = await User.aggregate([
            {
                // Match documents where 'age' exists and is a positive number
                $match: {
                    age: { $exists: true, $ne: null, $gt: 0 } // Ensure age is present and positive
                }
            },
            {
                // Group by the 'age' field
                $group: {
                    _id: "$age", // The age value will be the group identifier
                    userCount: { $sum: 1 } // Count the number of users in each age group
                }
            },
            {
                // Project to rename '_id' to 'age' and include 'userCount'
                $project: {
                    _id: 0, // Exclude the default _id field
                    age: "$_id", // Rename _id to age
                    userCount: "$userCount" // Include the calculated userCount
                }
            },
            {
                // Sort the results by age in ascending order
                $sort: { age: 1 }
            }
        ]);
        return data;
    } catch (error) {
        console.error("Error aggregating users by age:", error);
        throw error; // Re-throw to be handled by the calling route
    }
};

const toggleHobby = async (userId, hobbyId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const hobbyIndex = user.hobbies.findIndex(h => h._id.toString() === hobbyId.toString());
    console.log(hobbyIndex)
    
    if (hobbyIndex > -1) {
      // Hobby exists, remove it
      user.hobbies.splice(hobbyIndex, 1);
    } else {
      // Hobby doesn't exist, add it
      user.hobbies.push(hobbyId);
    }

    await user.save();
    return true;
  } catch (error) {
    console.error('Error toggling hobby:', error);
    throw error;
  }
};

const toggleFriend = async (userId, friendId) => {
    if (userId === friendId) {
        throw new Error("User cannot be friends with themselves.");
    }

    const user = await User.findById(userId);
    const friendIndex = user.friends.findIndex(f => f.toString() === friendId);

    if (friendIndex >= 0) {
        user.friends.splice(friendIndex, 1);
    } else {
        user.friends.push(friendId);
    }

    await user.save();
    return user.populate('friends');
};

module.exports = { createUser,searchUsersByGender, toggleHobby, getUserById, getUsers, updateUser, deleteUser, toggleAdmin, toggleFriend, usersByAge, getUsersByHobbyId };
