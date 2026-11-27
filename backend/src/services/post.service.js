import Post from "../models/Post.js";
import Community from "../models/Community.js";
import Membership from "../models/Membership.js";
import Vote from "../models/Vote.js";
import Comment from "../models/Comment.js";

const POST_POPULATE = [
    { path: "author", select: "username avatar" },
    { path: "community", select: "name creator" },
];

// Return public post information
const getSafePost = (post, includeScores = true, userVote = 0) => ({
    id: post._id,
    title: post.title,
    content: post.content,
    image: post.image,
    author:
        post.author && typeof post.author === "object" && post.author.username
            ? {
                  id: post.author._id,
                  username: post.author.username,
                  avatar: post.author.avatar || "",
              }
            : post.author,
    community:
        post.community && typeof post.community === "object" && post.community.name
            ? {
                  id: post.community._id,
                  name: post.community.name,
                  creator: post.community.creator,
              }
            : post.community,

    ...(includeScores && {
        upvotes: post.upvotes,
        downvotes: post.downvotes,
        score: post.score,
        userVote,
    }),

    commentCount: post.commentCount,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
});

// Batch-lookup the current user's votes for a list of posts
const getUserVoteMap = async (userId, posts) => {
    if (!userId || !posts.length) return new Map();

    const postIds = posts.map((p) => p._id);
    const votes = await Vote.find({
        user: userId,
        post: { $in: postIds },
    }).select("post value");

    return new Map(votes.map((v) => [String(v.post), v.value]));
};

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

    await post.populate(POST_POPULATE);

    return getSafePost(post, true, 0);
};

// GET POST BY ID
export const getPostById = async (postId, userId = null) => {
    const post = await Post.findById(postId).populate(POST_POPULATE);

    if (!post) {
        const error = new Error("Post not found.");
        error.statusCode = 404;
        throw error;
    }

    let userVote = 0;
    if (userId) {
        const vote = await Vote.findOne({ user: userId, post: post._id }).select(
            "value"
        );
        userVote = vote ? vote.value : 0;
    }

    return getSafePost(post, Boolean(userId), userVote);
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
    await post.populate(POST_POPULATE);

    const vote = await Vote.findOne({ user: userId, post: post._id }).select(
        "value"
    );

    return getSafePost(post, true, vote ? vote.value : 0);
};

// DELETE POST (author OR community moderator)
export const deletePost = async (userId, postId) => {
    const post = await Post.findById(postId);

    if (!post) {
        const error = new Error("Post not found.");
        error.statusCode = 404;
        throw error;
    }

    const community = await Community.findById(post.community);
    const isAuthor = post.author.toString() === userId.toString();
    const isMod = Boolean(
        community && community.creator.toString() === userId.toString()
    );

    if (!isAuthor && !isMod) {
        const error = new Error("You are not allowed to delete this post.");
        error.statusCode = 403;
        throw error;
    }

    await Promise.all([
        Post.findByIdAndDelete(postId),
        Comment.deleteMany({ post: postId }),
        Vote.deleteMany({ post: postId }),
    ]);

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
            .limit(limit)
            .populate(POST_POPULATE),

        Post.countDocuments(filter),
    ]);

    const voteMap = await getUserVoteMap(userId, posts);

    return {
        posts: posts.map((post) =>
            getSafePost(post, Boolean(userId), voteMap.get(String(post._id)) || 0)
        ),
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
            .limit(limit)
            .populate(POST_POPULATE),

        Post.countDocuments(filter),
    ]);

    const voteMap = await getUserVoteMap(userId, posts);

    return {
        posts: posts.map((post) =>
            getSafePost(post, Boolean(userId), voteMap.get(String(post._id)) || 0)
        ),
        pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalPosts / limit),
            totalPosts,
            hasMore: skip + posts.length < totalPosts,
        },
    };
};

// AI POST SUMMARIZATION (read-only; never modifies the post)
const buildFallbackSummary = (post, comments) => {
    const parts = [];
    const authorName = post.author?.username || "the author";
    const communityName = post.community?.name || "this community";

    const cleanContent = (post.content || "").replace(/\s+/g, " ").trim();

    if (cleanContent) {
        const sentences = cleanContent.match(/[^.!?]+[.!?]+/g) || [cleanContent];
        const keyText = sentences.slice(0, 2).join(" ").trim();
        const clipped =
            keyText.length > 260 ? `${keyText.slice(0, 257)}...` : keyText;
        parts.push(`In h/${communityName}, u/${authorName} posted "${post.title}": ${clipped}`);
    } else if (post.image) {
        parts.push(
            `In h/${communityName}, u/${authorName} shared an image post titled "${post.title}".`
        );
    } else {
        parts.push(`In h/${communityName}, u/${authorName} posted "${post.title}".`);
    }

    if (comments.length > 0) {
        const sampleComment = comments[0].content.replace(/\s+/g, " ").trim();
        const clippedComment =
            sampleComment.length > 120
                ? `${sampleComment.slice(0, 117)}...`
                : sampleComment;
        parts.push(
            `The thread currently has ${comments.length} ${
                comments.length === 1 ? "comment" : "comments"
            } (e.g., u/${comments[0].author?.username || "a member"} noted: "${clippedComment}").`
        );
    } else {
        parts.push("There are no comments on this discussion yet.");
    }

    return parts.join(" ");
};

export const summarizePost = async (postId) => {
    const post = await Post.findById(postId).populate(POST_POPULATE);

    if (!post) {
        const error = new Error("Post not found.");
        error.statusCode = 404;
        throw error;
    }

    const recentComments = await Comment.find({ post: postId })
        .sort({ createdAt: 1 })
        .limit(8)
        .populate("author", "username");

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
        try {
            const commentText = recentComments
                .map((c) => `- u/${c.author?.username || "user"}: ${c.content}`)
                .join("\n");

            const prompt = [
                "Summarize the following community discussion post in 2-3 clear, neutral sentences.",
                `Community: h/${post.community?.name || "general"}`,
                `Title: ${post.title}`,
                `Content: ${post.content || "(Image-only post)"}`,
                commentText ? `Recent comments:\n${commentText}` : "",
            ]
                .filter(Boolean)
                .join("\n\n");

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                    }),
                }
            );

            if (response.ok) {
                const json = await response.json();
                const text =
                    json?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
                if (text) {
                    return {
                        postId: post._id,
                        summary: text,
                        provider: "gemini",
                    };
                }
            }
        } catch (err) {
            // Fall back cleanly if external AI call fails
            console.error("Gemini summarization failed, using fallback:", err.message);
        }
    }

    return {
        postId: post._id,
        summary: buildFallbackSummary(post, recentComments),
        provider: "extractive",
    };
};
