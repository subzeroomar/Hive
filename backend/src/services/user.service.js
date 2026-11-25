import User from "../models/User.js";

// Return public user information
const getSafeUser = (user) => ({
    id: user._id,
    username: user.username,
    bio: user.bio,
    avatar: user.avatar,
    createdAt: user.createdAt,
});

// Get a user's public profile
export const getUserProfile = async (username) => {
    const user = await User.findOne({
        username: username.toLowerCase(),
    });

    if (!user) {
        const error = new Error("User not found.");
        error.statusCode = 404;
        throw error;
    }

    return getSafeUser(user);
};

// Update the authenticated user's profile
export const updateUserProfile = async (userId, updates) => {
    const allowedFields = ["bio", "avatar"];
    const updateData = {};

    for (const field of allowedFields) {
        if (updates[field] !== undefined) {
            updateData[field] = updates[field];
        }
    }

    if (
        updateData.bio !== undefined &&
        updateData.bio.length > 300
    ) {
        const error = new Error("Bio cannot exceed 300 characters.");
        error.statusCode = 400;
        throw error;
    }

    const user = await User.findByIdAndUpdate(
        userId,
        { $set: updateData },
        {
            new: true,
            runValidators: true,
        }
    );

    if (!user) {
        const error = new Error("User not found.");
        error.statusCode = 404;
        throw error;
    }

    return getSafeUser(user);
};

// Search users by username
export const searchUsers = async (query) => {
    if (!query || !query.trim()) {
        const error = new Error("Search query is required.");
        error.statusCode = 400;
        throw error;
    }

    const users = await User.find({
        username: {
            $regex: query.trim(),
            $options: "i",
        },
    })
        .select("username bio avatar createdAt")
        .limit(20)
        .sort({ username: 1 });

    return users.map(getSafeUser);
};