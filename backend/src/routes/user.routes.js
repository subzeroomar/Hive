import express from "express";

import {
    getProfile,
    updateProfile,
    search,
} from "../controllers/user.controller.js";

import protect from "../middleware/auth.middleware.js";

const router = express.Router();

// Search users (must come before /:username)
router.get("/search", search);

// Get a public user profile
router.get("/:username", getProfile);

// Update the authenticated user's profile
router.put("/me", protect, updateProfile);

export default router;