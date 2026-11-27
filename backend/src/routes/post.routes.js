import express from "express";

import {
    create,
    getById,
    update,
    remove,
    getCommunityFeed,
    getHome,
    summarize,
} from "../controllers/post.controller.js";

import protect from "../middleware/auth.middleware.js";
import optionalAuth from "../middleware/optionalAuth.middleware.js";
import uploadSingleImage from "../middleware/upload.middleware.js";

const router = express.Router();

// Home feed (guests and authenticated users)
router.get("/feed", optionalAuth, getHome);

// Community posts (guests and authenticated users)
router.get("/community/:communityId", optionalAuth, getCommunityFeed);

// Create a post (authentication required; accepts multipart image or JSON)
router.post("/", protect, uploadSingleImage, create);

// AI post summarization (authentication required)
router.post("/:id/summarize", protect, summarize);

// Get a post by ID (guests and authenticated users)
router.get("/:id", optionalAuth, getById);

// Update a post (authentication required; accepts multipart image or JSON)
router.put("/:id", protect, uploadSingleImage, update);

// Delete a post (author or community moderator)
router.delete("/:id", protect, remove);

export default router;
