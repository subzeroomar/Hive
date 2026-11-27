import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import config from "./config/config.js";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import communityRoutes from "./routes/community.routes.js";
import postRoutes from "./routes/post.routes.js";
import errorHandler from "./middleware/error.middleware.js";

const app = express();

// Security middleware
app.use(helmet());

// Allow frontend requests
app.use(cors({
    origin: config.clientUrl,
    credentials: true,
}));

// Parse incoming request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check
app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Hive API is running!",
    });
});

// Authentication routes
app.use("/api/auth", authRoutes);

//User routes
app.use("/api/users", userRoutes);

// Community routes
app.use("/api/communities", communityRoutes);

// Post routes
app.use("/api/posts", postRoutes);
    
// Central error handler
app.use(errorHandler);

export default app;
