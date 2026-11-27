import express from "express";

import {
    getProfile,
    updateProfile,
    search,
} from "../controllers/user.controller.js";

import protect from "../middleware/auth.middleware.js";
import optionalAuth from "../middleware/optionalAuth.middleware.js";

const router = express.Router();

// Search users (must come before /:username)
router.get("/search", search);

// Update the authenticated user's profile (must come before /:username)
router.put("/me", protect, updateProfile);

// Get a public user profile
router.get("/:username", optionalAuth, getProfile);

export default router;
