import asyncHandler from "../utils/asyncHandler.js";

import {
    getUserProfile,
    updateUserProfile,
    searchUsers,
} from "../services/user.service.js";

// Get a public user profile
export const getProfile = asyncHandler(async (req, res) => {
    const result = await getUserProfile(req.params.username, req.user?._id);

    res.status(200).json({
        success: true,
        data: result,
    });
});

// Update the authenticated user's profile
export const updateProfile = asyncHandler(async (req, res) => {
    const user = await updateUserProfile(
        req.user._id,
        req.body
    );

    res.status(200).json({
        success: true,
        message: "Profile updated successfully.",
        data: {
            user,
        },
    });
});

// Search for users
export const search = asyncHandler(async (req, res) => {
    const users = await searchUsers(req.query.q);

    res.status(200).json({
        success: true,
        results: users.length,
        data: {
            users,
        },
    });
});
