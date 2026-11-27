import express from "express";

import {
    list,
    create,
    getByName,
    search,
    join,
    leave,
} from "../controllers/community.controller.js";

import protect from "../middleware/auth.middleware.js";
import optionalAuth from "../middleware/optionalAuth.middleware.js";

const router = express.Router();

// List communities (guests and authenticated users)
router.get("/", optionalAuth, list);

// Search communities (must come before /:name)
router.get("/search", optionalAuth, search);

// Create a community (authentication required)
router.post("/", protect, create);

// Get a community by name (guests and authenticated users)
router.get("/:name", optionalAuth, getByName);

// Join a community (authentication required)
router.post("/:id/join", protect, join);

// Leave a community (authentication required)
router.delete("/:id/leave", protect, leave);

export default router;
