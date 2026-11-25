import express from "express";

import {
    create,
    getByName,
    search,
    join,
    leave,
} from "../controllers/community.controller.js";

import protect from "../middleware/auth.middleware.js";

const router = express.Router();

// Search communities (must come before /:name)
router.get("/search", search);

// Create a community (authentication required)
router.post("/", protect, create);

// Get a community by name (public)
router.get("/:name", getByName);

// Join a community (authentication required)
router.post("/:id/join", protect, join);

// Leave a community (authentication required)
router.delete("/:id/leave", protect, leave);

export default router;