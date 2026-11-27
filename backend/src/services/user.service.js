import User from "../models/User.js";
import Post from "../models/Post.js";
import Comment from "../models/Comment.js";

// Return public user information
const getSafeUser = (user) => ({
    id: user._id,
    username: user.username,
    bio: user.bio,
    avatar: user.avatar,
    createdAt: user.createdAt,
});

// Get a user's public profile along with recent posts (and comments for logged-in viewers)
export const getUserProfile = async (username, viewerId = null) => {
    const user = await User.findOne({
        username: username.toLowerCase(),
    });

    if (!user) {
        const error = new Error("User not found.");
        error.statusCode = 404;
        throw error;
    }

    const includePrivateActivity = Boolean(viewerId);

    const [posts, comments] = await Promise.all([
        Post.find({ author: user._id })
            .sort({ createdAt: -1 })
            .limit(20)
            .populate("author", "username avatar")
            .populate("community", "name creator"),
        includePrivateActivity
            ? Comment.find({ author: user._id })
                  .sort({ createdAt: -1 })
                  .limit(20)
                  .populate("post", "title")
            : Promise.resolve([]),
    ]);

    return {
        user: getSafeUser(user),
        posts: posts.map((post) => ({
            id: post._id,
            title: post.title,
            content: post.content,
            image: post.image,
            author: {
                id: post.author._id,
                username: post.author.username,
                avatar: post.author.avatar || "",
            },
            community: post.community
                ? {
                      id: post.community._id,
                      name: post.community.name,
                      creator: post.community.creator,
                  }
                : null,
            ...(includePrivateActivity && {
                upvotes: post.upvotes,
                downvotes: post.downvotes,
                score: post.score,
            }),
            commentCount: post.commentCount,
            createdAt: post.createdAt,
        })),
        ...(includePrivateActivity && {
            comments: comments.map((c) => ({
                id: c._id,
                content: c.content,
                post: c.post ? { id: c.post._id, title: c.post.title } : null,
                createdAt: c.createdAt,
            })),
        }),
    };
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
