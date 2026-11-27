import asyncHandler from "../utils/asyncHandler.js";
import {
    getPostComments,
    createComment,
    updateComment,
    deleteComment,
} from "../services/comment.service.js";

// Get nested comments for a post (authenticated users only)
export const getByPost = asyncHandler(async (req, res) => {
    const result = await getPostComments(req.params.postId);

    res.status(200).json({
        success: true,
        data: result,
    });
});

// Create a top-level comment or nested reply
export const create = asyncHandler(async (req, res) => {
    const comment = await createComment(
        req.user._id,
        req.params.postId,
        req.body
    );

    res.status(201).json({
        success: true,
        message: "Comment added successfully.",
        data: {
            comment,
        },
    });
});

// Update a comment
export const update = asyncHandler(async (req, res) => {
    const comment = await updateComment(
        req.user._id,
        req.params.id,
        req.body
    );

    res.status(200).json({
        success: true,
        message: "Comment updated successfully.",
        data: {
            comment,
        },
    });
});

// Delete a comment (author or community moderator)
export const remove = asyncHandler(async (req, res) => {
    const result = await deleteComment(req.user._id, req.params.id);

    res.status(200).json({
        success: true,
        message: result.message,
        data: {
            commentId: result.id,
            deletedCount: result.deletedCount,
        },
    });
});
