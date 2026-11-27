import express from "express";
import {
    getByPost,
    create,
    update,
    remove,
} from "../controllers/comment.controller.js";
import protect from "../middleware/auth.middleware.js";

const router = express.Router();

// Get nested comments for a post (restricted to logged-in users per SRS)
router.get("/post/:postId", protect, getByPost);

// Create a comment or reply on a post
router.post("/post/:postId", protect, create);

// Edit own comment
router.put("/:id", protect, update);

// Delete own comment or moderate in owned community
router.delete("/:id", protect, remove);

export default router;
