import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
    registerUser,
    loginUser,
} from "../services/auth.service.js";

// Register a new user
export const register = asyncHandler(async (req, res) => {
    const user = await registerUser(req.body);

    res.status(201).json({
        success: true,
        message: "Account created successfully.",
        data: {
            user,
        },
    });
});

// Log in an existing user
export const login = asyncHandler(async (req, res) => {
    const result = await loginUser(req.body);

    res.status(200).json({
        success: true,
        message: "Logged in successfully.",
        data: result,
    });
});
// Get the currently authenticated user
export const getMe = asyncHandler(async (req, res) => {
    const user = {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        bio: req.user.bio,
        avatar: req.user.avatar,
        createdAt: req.user.createdAt,
    };

    res.status(200).json({
        success: true,
        data: {
            user,
        },
    });
});