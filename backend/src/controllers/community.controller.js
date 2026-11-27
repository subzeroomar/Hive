import asyncHandler from "../utils/asyncHandler.js";

import {
    listCommunities,
    createCommunity,
    getCommunityByName,
    searchCommunities,
    joinCommunity,
    leaveCommunity,
} from "../services/community.service.js";

// List communities
export const list = asyncHandler(async (req, res) => {
    const communities = await listCommunities(req.user?._id);

    res.status(200).json({
        success: true,
        results: communities.length,
        data: {
            communities,
        },
    });
});

// Create a new community
export const create = asyncHandler(async (req, res) => {
    const community = await createCommunity(
        req.user._id,
        req.body
    );

    res.status(201).json({
        success: true,
        message: "Community created successfully.",
        data: {
            community,
        },
    });
});

// Get a community by name
export const getByName = asyncHandler(async (req, res) => {
    const community = await getCommunityByName(
        req.params.name,
        req.user?._id
    );

    res.status(200).json({
        success: true,
        data: {
            community,
        },
    });
});

// Search communities
export const search = asyncHandler(async (req, res) => {
    const communities = await searchCommunities(
        req.query.q,
        req.user?._id
    );

    res.status(200).json({
        success: true,
        results: communities.length,
        data: {
            communities,
        },
    });
});

// Join a community
export const join = asyncHandler(async (req, res) => {
    const community = await joinCommunity(
        req.user._id,
        req.params.id
    );

    res.status(200).json({
        success: true,
        message: "You joined the community successfully.",
        data: {
            community,
        },
    });
});

// Leave a community
export const leave = asyncHandler(async (req, res) => {
    const community = await leaveCommunity(
        req.user._id,
        req.params.id
    );

    res.status(200).json({
        success: true,
        message: "You left the community successfully.",
        data: {
            community,
        },
    });
});
