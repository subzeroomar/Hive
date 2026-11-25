import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import config from "./config/config.js";

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

// Export Express application
export default app;