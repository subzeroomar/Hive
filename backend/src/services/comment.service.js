import Comment from "../models/Comment.js";
import Post from "../models/Post.js";
import Community from "../models/Community.js";

const formatComment = (comment) => ({
    id: comment._id,
    content: comment.content,
    post: comment.post,
    parentComment: comment.parentComment,
    author:
        comment.author && typeof comment.author === "object" && comment.author.username
            ? {
                  id: comment.author._id,
                  username: comment.author.username,
                  avatar: comment.author.avatar || "",
              }
            : comment.author,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
    replies: [],
});

// Build a nested comment tree from flat comments
const buildCommentTree = (comments) => {
    const map = new Map();
    const roots = [];

    for (const comment of comments) {
        const formatted = formatComment(comment);
        map.set(String(formatted.id), formatted);
    }

    for (const node of map.values()) {
        if (node.parentComment && map.has(String(node.parentComment))) {
            map.get(String(node.parentComment)).replies.push(node);
        } else {
            roots.push(node);
        }
    }

    return roots;
};

// GET COMMENTS FOR A POST (nested tree)
export const getPostComments = async (postId) => {
    const post = await Post.findById(postId);

    if (!post) {
        const error = new Error("Post not found.");
        error.statusCode = 404;
        throw error;
    }

    const comments = await Comment.find({ post: postId })
        .sort({ createdAt: 1 })
        .populate("author", "username avatar");

    return {
        comments: buildCommentTree(comments),
        totalComments: comments.length,
    };
};

// CREATE COMMENT OR REPLY
export const createComment = async (userId, postId, data) => {
    const { content, parentComment = null } = data;

    if (!content || !content.trim()) {
        const error = new Error("Comment content is required.");
        error.statusCode = 400;
        throw error;
    }

    if (content.trim().length > 5000) {
        const error = new Error("Comment cannot exceed 5000 characters.");
        error.statusCode = 400;
        throw error;
    }

    const post = await Post.findById(postId);

    if (!post) {
        const error = new Error("Post not found.");
        error.statusCode = 404;
        throw error;
    }

    if (parentComment) {
        const parent = await Comment.findById(parentComment);

        if (!parent || String(parent.post) !== String(postId)) {
            const error = new Error("Parent comment not found on this post.");
            error.statusCode = 404;
            throw error;
        }
    }

    const comment = await Comment.create({
        content: content.trim(),
        author: userId,
        post: postId,
        parentComment: parentComment || null,
    });

    await Post.findByIdAndUpdate(postId, {
        $inc: { commentCount: 1 },
    });

    await comment.populate("author", "username avatar");

    return formatComment(comment);
};

// UPDATE COMMENT (author only)
export const updateComment = async (userId, commentId, data) => {
    const { content } = data;

    if (!content || !content.trim()) {
        const error = new Error("Comment content is required.");
        error.statusCode = 400;
        throw error;
    }

    if (content.trim().length > 5000) {
        const error = new Error("Comment cannot exceed 5000 characters.");
        error.statusCode = 400;
        throw error;
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
        const error = new Error("Comment not found.");
        error.statusCode = 404;
        throw error;
    }

    if (String(comment.author) !== String(userId)) {
        const error = new Error("You are not allowed to edit this comment.");
        error.statusCode = 403;
        throw error;
    }

    comment.content = content.trim();
    await comment.save();
    await comment.populate("author", "username avatar");

    return formatComment(comment);
};

// DELETE COMMENT (author OR community moderator) — also deletes nested replies
export const deleteComment = async (userId, commentId) => {
    const comment = await Comment.findById(commentId);

    if (!comment) {
        const error = new Error("Comment not found.");
        error.statusCode = 404;
        throw error;
    }

    const post = await Post.findById(comment.post);
    const community = post ? await Community.findById(post.community) : null;

    const isAuthor = String(comment.author) === String(userId);
    const isMod = Boolean(
        community && String(community.creator) === String(userId)
    );

    if (!isAuthor && !isMod) {
        const error = new Error("You are not allowed to delete this comment.");
        error.statusCode = 403;
        throw error;
    }

    // Collect this comment and all nested descendant replies
    const allPostComments = await Comment.find({ post: comment.post }).select(
        "_id parentComment"
    );

    const idsToDelete = new Set([String(comment._id)]);
    let added = true;
    while (added) {
        added = false;
        for (const c of allPostComments) {
            const cId = String(c._id);
            const pId = c.parentComment ? String(c.parentComment) : null;
            if (pId && idsToDelete.has(pId) && !idsToDelete.has(cId)) {
                idsToDelete.add(cId);
                added = true;
            }
        }
    }

    const deleteList = Array.from(idsToDelete);
    await Comment.deleteMany({ _id: { $in: deleteList } });

    if (post) {
        const remainingCount = await Comment.countDocuments({ post: post._id });
        await Post.findByIdAndUpdate(post._id, {
            $set: { commentCount: remainingCount },
        });
    }

    return {
        id: comment._id,
        deletedCount: deleteList.length,
        message: "Comment deleted successfully.",
    };
};
