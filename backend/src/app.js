import path from "path";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import config from "./config/config.js";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import communityRoutes from "./routes/community.routes.js";
import postRoutes from "./routes/post.routes.js";
import commentRoutes from "./routes/comment.routes.js";
import voteRoutes from "./routes/vote.routes.js";
import errorHandler from "./middleware/error.middleware.js";

const app = express();

// Security middleware (allow cross-origin static images from /uploads)
app.use(
    helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" },
    })
);

// Allow frontend requests
app.use(
    cors({
        origin: config.clientUrl,
        credentials: true,
    })
);

// Parse incoming request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve uploaded post images
app.use("/uploads", express.static(path.resolve("uploads")));

// Health check
app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Hive API is running!",
    });
});

// Authentication routes
app.use("/api/auth", authRoutes);

// User routes
app.use("/api/users", userRoutes);

// Community routes
app.use("/api/communities", communityRoutes);

// Post routes
app.use("/api/posts", postRoutes);

// Comment routes
app.use("/api/comments", commentRoutes);

// Vote routes
app.use("/api/votes", voteRoutes);

// Central error handler
app.use(errorHandler);

export default app;
