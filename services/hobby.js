const Hobby = require('../models/hobby');
const User = require('../models/user')

const createHobby = async (name, description, practiceTime, maxParticipants,createdBy) => {
  const hobby = new Hobby({ name, description, practiceTime, maxParticipants, createdBy });
  return await hobby.save();
};

const getHobbyById = async (id) => 
  await Hobby.findById(id)
    .populate({
      path: 'posts',
      populate: { path: 'user' }
    });

const getHobbies = async () => await Hobby.find({});
const postsPerHobby = async () => {
    return await Hobby.aggregate([
        {
            // Add a new field 'postCount'
            $addFields: {
                postCount: {
                    // Use $cond to check if 'posts' is an array
                    $cond: {
                        if: { $isArray: "$posts" }, // If 'posts' is an array
                        then: { $size: "$posts" }, // Then get its size
                        else: 0 // Otherwise, set postCount to 0
                    }
                }
            }
        },
        {
            // Project only the required fields
            $project: {
                _id: 0,
                name: "$name",
                postCount: "$postCount" // Use the newly calculated postCount
            }
        },
        {
            // Sort by post count, descending
            $sort: { postCount: -1 }
        }
    ]);
};


const searchHobbies = async (filters) => {
    try {
        let query = {};

        if (filters.name) {
            query.name = { $regex: filters.name, $options: 'i' }; // Case-insensitive search
        }

        if (filters.minPracticeTime || filters.maxPracticeTime) {
            query.practiceTime = {};
            if (filters.minPracticeTime) {
                query.practiceTime.$gte = filters.minPracticeTime;
            }
            if (filters.maxPracticeTime) {
                query.practiceTime.$lte = filters.maxPracticeTime;
            }
        }

        if (filters.minParticipants || filters.maxParticipants) {
            query.maxParticipants = {};
            if (filters.minParticipants) {
                query.maxParticipants.$gte = filters.minParticipants;
            }
            if (filters.maxParticipants) {
                query.maxParticipants.$lte = filters.maxParticipants;
            }
        }

        if (filters.createdByUserName) {
            const users = await User.find({
                $or: [
                    { firstName: { $regex: filters.createdByUserName, $options: 'i' } },
                    { lastName: { $regex: filters.createdByUserName, $options: 'i' } },
                            {
            $expr: {
                $regexMatch: {
                    input: { $concat: ["$firstName", " ", "$lastName"] },
                    regex: filters.createdByUserName,
                    options: "i"
                }
            }
        }
                ]
            }).select('_id'); // Only select the IDs

            const userIds = users.map(user => user._id);
            if (userIds.length > 0) {
                query.createdBy = { $in: userIds };
            } else {
                // If no users found matching the name, no hobbies will match this criteria
                return [];
            }
        }

        const hobbies = await Hobby.find(query)
                                    .populate('createdBy', 'firstName lastName') // Populate creator's name
                                    .sort({ name: 1 }); // Sort by name for consistent results

        return hobbies;
    } catch (error) {
        console.error('Error searching hobbies in service:', error);
        throw error;
    }
};

const updateHobby = async (id, updates) => {
  const hobby = await getHobbyById(id);
  if (!hobby) return null;

  hobby.name = updates.name || hobby.name;
  hobby.description = updates.description || hobby.description;
  hobby.practiceTime = updates.practiceTime || hobby.practiceTime;
  hobby.maxParticipants = updates.maxParticipants || hobby.maxParticipants;

  return await hobby.save();
};

const deleteHobby = async (id) => {
  const hobby = await getHobbyById(id);
  if (!hobby) return null;
  return await hobby.deleteOne();
};

module.exports = {
  createHobby,
  getHobbyById,
  getHobbies,
  updateHobby,
  deleteHobby,
  postsPerHobby,
  searchHobbies
};
