import asyncHandler from "../utils/asyncHandler.js";

import {
    createPost,
    getPostById,
    updatePost,
    deletePost,
    getCommunityPosts,
    getHomeFeed,
    summarizePost,
} from "../services/post.service.js";

// Build a full public URL for an uploaded file
const getUploadedImageUrl = (req) => {
    if (!req.file) return undefined;
    return `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
};

// Create a post (supports both multipart file upload and JSON image URL)
export const create = asyncHandler(async (req, res) => {
    const uploadedImageUrl = getUploadedImageUrl(req);
    const body = {
        ...req.body,
        ...(uploadedImageUrl ? { image: uploadedImageUrl } : {}),
    };

    const post = await createPost(req.user._id, body);

    res.status(201).json({
        success: true,
        message: "Post created successfully.",
        data: {
            post,
        },
    });
});

// Get a post by ID
export const getById = asyncHandler(async (req, res) => {
    const post = await getPostById(req.params.id, req.user?._id);

    res.status(200).json({
        success: true,
        data: {
            post,
        },
    });
});

// Update a post (supports both multipart file upload and JSON image URL)
export const update = asyncHandler(async (req, res) => {
    const uploadedImageUrl = getUploadedImageUrl(req);
    const body = {
        ...req.body,
        ...(uploadedImageUrl ? { image: uploadedImageUrl } : {}),
    };

    const post = await updatePost(req.user._id, req.params.id, body);

    res.status(200).json({
        success: true,
        message: "Post updated successfully.",
        data: {
            post,
        },
    });
});

// Delete a post (author or community moderator)
export const remove = asyncHandler(async (req, res) => {
    const result = await deletePost(req.user._id, req.params.id);

    res.status(200).json({
        success: true,
        message: result.message,
        data: {
            postId: result.id,
        },
    });
});

// Get posts from a community
export const getCommunityFeed = asyncHandler(async (req, res) => {
    const result = await getCommunityPosts(
        req.params.communityId,
        req.user?._id,
        req.query
    );

    res.status(200).json({
        success: true,
        data: result,
    });
});

// Get the home feed
export const getHome = asyncHandler(async (req, res) => {
    const result = await getHomeFeed(req.user?._id, req.query);

    res.status(200).json({
        success: true,
        data: result,
    });
});

// Summarize a post with AI (authenticated users only)
export const summarize = asyncHandler(async (req, res) => {
    const result = await summarizePost(req.params.id);

    res.status(200).json({
        success: true,
        data: result,
    });
});
