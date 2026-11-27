import Post from "../models/Post.js";
import Community from "../models/Community.js";
import Membership from "../models/Membership.js";

// Return public post information
const getSafePost = (post, includeScores = true) => ({
    id: post._id,
    title: post.title,
    content: post.content,
    image: post.image,
    author: post.author,
    community: post.community,

    ...(includeScores && {
        upvotes: post.upvotes,
        downvotes: post.downvotes,
        score: post.score,
    }),

    commentCount: post.commentCount,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
});

// CREATE POST
export const createPost = async (userId, data) => {
    const { title, content, image, communityId } = data;

    if (!title || !title.trim()) {
        const error = new Error("Post title is required.");
        error.statusCode = 400;
        throw error;
    }

    if (title.trim().length > 200) {
        const error = new Error("Post title cannot exceed 200 characters.");
        error.statusCode = 400;
        throw error;
    }

    if (content && content.length > 10000) {
        const error = new Error("Post content cannot exceed 10000 characters.");
        error.statusCode = 400;
        throw error;
    }

    if (!communityId) {
        const error = new Error("Community ID is required.");
        error.statusCode = 400;
        throw error;
    }

    const community = await Community.findById(communityId);

    if (!community) {
        const error = new Error("Community not found.");
        error.statusCode = 404;
        throw error;
    }

    const membership = await Membership.findOne({
        user: userId,
        community: communityId,
    });

    if (!membership) {
        const error = new Error("You must join this community before posting.");
        error.statusCode = 403;
        throw error;
    }

    if ((!content || !content.trim()) && !image) {
        const error = new Error("A post must contain text or an image.");
        error.statusCode = 400;
        throw error;
    }

    const post = await Post.create({
        title: title.trim(),
        content: content || "",
        image: image || "",
        author: userId,
        community: communityId,
    });

    return getSafePost(post);
};

// GET POST BY ID
export const getPostById = async (postId) => {
    const post = await Post.findById(postId);

    if (!post) {
        const error = new Error("Post not found.");
        error.statusCode = 404;
        throw error;
    }

    return getSafePost(post);
};
// UPDATE POST
export const updatePost = async (userId, postId, updates) => {
    const post = await Post.findById(postId);

    if (!post) {
        const error = new Error("Post not found.");
        error.statusCode = 404;
        throw error;
    }

    // Only the original author can edit the post.
    if (post.author.toString() !== userId.toString()) {
        const error = new Error("You are not allowed to edit this post.");
        error.statusCode = 403;
        throw error;
    }

    const allowedFields = ["title", "content", "image"];

    for (const field of allowedFields) {
        if (updates[field] !== undefined) {
            post[field] = updates[field];
        }
    }

    if (!post.title || !post.title.trim()) {
        const error = new Error("Post title is required.");
        error.statusCode = 400;
        throw error;
    }

    if (post.title.trim().length > 200) {
        const error = new Error("Post title cannot exceed 200 characters.");
        error.statusCode = 400;
        throw error;
    }

    if (post.content && post.content.length > 10000) {
        const error = new Error("Post content cannot exceed 10000 characters.");
        error.statusCode = 400;
        throw error;
    }

    if ((!post.content || !post.content.trim()) && !post.image) {
        const error = new Error("A post must contain text or an image.");
        error.statusCode = 400;
        throw error;
    }

    await post.save();

    return getSafePost(post);
};

// DELETE POST
export const deletePost = async (userId, postId) => {
    const post = await Post.findById(postId);

    if (!post) {
        const error = new Error("Post not found.");
        error.statusCode = 404;
        throw error;
    }

    // Only the original author can delete the post.
    if (post.author.toString() !== userId.toString()) {
        const error = new Error("You are not allowed to delete this post.");
        error.statusCode = 403;
        throw error;
    }

    await Post.findByIdAndDelete(postId);

    return {
        id: post._id,
        message: "Post deleted successfully.",
    };
};
// GET POSTS FROM A COMMUNITY
export const getCommunityPosts = async (
    communityId,
    userId,
    options = {}
) => {
    const community = await Community.findById(communityId);

    if (!community) {
        const error = new Error("Community not found.");
        error.statusCode = 404;
        throw error;
    }

    const page = Math.max(1, parseInt(options.page, 10) || 1);
    const limit = Math.min(
        50,
        Math.max(1, parseInt(options.limit, 10) || 10)
    );

    const sort = options.sort === "top"
        ? { score: -1, createdAt: -1 }
        : { createdAt: -1 };

    const skip = (page - 1) * limit;

    const filter = { community: communityId };

    const [posts, totalPosts] = await Promise.all([
        Post.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(limit),

        Post.countDocuments(filter),
    ]);

    return {
        posts: posts.map((post) => getSafePost(post, Boolean(userId))),
        pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalPosts / limit),
            totalPosts,
            hasMore: skip + posts.length < totalPosts,
        },
    };
};
// GET HOME FEED
export const getHomeFeed = async (userId, options = {}) => {
    const page = Math.max(1, parseInt(options.page, 10) || 1);
    const limit = Math.min(
        50,
        Math.max(1, parseInt(options.limit, 10) || 10)
    );

    const sort = options.sort === "top"
        ? { score: -1, createdAt: -1 }
        : { createdAt: -1 };

    const skip = (page - 1) * limit;

    let filter = {};

    // Logged-in users see posts from joined communities
    // and popular posts from public communities.
    if (userId) {
        const memberships = await Membership.find({
            user: userId,
        }).select("community");

        const communityIds = memberships.map(
            (membership) => membership.community
        );

        filter = {
            $or: [
                { community: { $in: communityIds } },
                { score: { $gt: 0 } },
            ],
        };
    }

    const [posts, totalPosts] = await Promise.all([
        Post.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(limit),

        Post.countDocuments(filter),
    ]);

    return {
        posts: posts.map((post) => getSafePost(post, Boolean(userId))),
        pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalPosts / limit),
            totalPosts,
            hasMore: skip + posts.length < totalPosts,
        },
    };
};