import jwt from "jsonwebtoken";
import User from "../models/User.js";
import config from "../config/config.js";
import asyncHandler from "../utils/asyncHandler.js";

// Identify the user if a valid token is provided.
// Continue as a guest if no token is provided.
const optionalAuth = asyncHandler(async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next();
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        return next();
    }

    try {
        const decoded = jwt.verify(token, config.jwtSecret);

        const user = await User.findById(decoded.userId);

        if (user) {
            req.user = user;
        }
    } catch (error) {
        // Invalid or expired tokens are treated as guest access.
    }

    next();
});

export default optionalAuth;