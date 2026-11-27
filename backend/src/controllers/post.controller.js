import asyncHandler from "../utils/asyncHandler.js";

import {
    createPost,
    getPostById,
    updatePost,
    deletePost,
    getCommunityPosts,
    getHomeFeed,
} from "../services/post.service.js";

// Create a post
export const create = asyncHandler(async (req, res) => {
    const post = await createPost(req.user._id, req.body);

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
    const post = await getPostById(req.params.id);

    res.status(200).json({
        success: true,
        data: {
            post,
        },
    });
});

// Update a post
export const update = asyncHandler(async (req, res) => {
    const post = await updatePost(
        req.user._id,
        req.params.id,
        req.body
    );

    res.status(200).json({
        success: true,
        message: "Post updated successfully.",
        data: {
            post,
        },
    });
});

// Delete a post
export const remove = asyncHandler(async (req, res) => {
    const result = await deletePost(
        req.user._id,
        req.params.id
    );

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
    const result = await getHomeFeed(
        req.user?._id,
        req.query
    );

    res.status(200).json({
        success: true,
        data: result,
    });
});