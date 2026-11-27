import express from "express";

import {
    create,
    getById,
    update,
    remove,
    getCommunityFeed,
    getHome,
} from "../controllers/post.controller.js";

import protect from "../middleware/auth.middleware.js";
import optionalAuth from "../middleware/optionalAuth.middleware.js";

const router = express.Router();

// Home feed (guests and authenticated users)
router.get("/feed", optionalAuth, getHome);

// Community posts (guests and authenticated users)
router.get("/community/:communityId", optionalAuth, getCommunityFeed);

// Create a post (authentication required)
router.post("/", protect, create);

// Get a post by ID (public)
router.get("/:id", getById);

// Update a post (authentication required)
router.put("/:id", protect, update);

// Delete a post (authentication required)
router.delete("/:id", protect, remove);

export default router;