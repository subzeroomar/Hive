import express from "express";
import { castVote, getMyVote } from "../controllers/vote.controller.js";
import protect from "../middleware/auth.middleware.js";

const router = express.Router();

// Cast, switch, or toggle off a vote on a post
router.post("/:postId", protect, castVote);

// Get current user's vote for a post
router.get("/:postId", protect, getMyVote);

export default router;
