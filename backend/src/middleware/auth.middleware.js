import jwt from "jsonwebtoken";
import User from "../models/User.js";
import config from "../config/config.js";
import asyncHandler from "../utils/asyncHandler.js";

// Verify the user's JWT and identify the account
const protect = asyncHandler(async (req, res, next) => {
    const authHeader = req.headers.authorization;

    // Check whether an authorization header exists
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        const error = new Error("Authentication required. Please log in.");
        error.statusCode = 401;
        throw error;
    }

    // Extract the token
    const token = authHeader.split(" ")[1];

    if (!token) {
        const error = new Error("Invalid authentication token.");
        error.statusCode = 401;
        throw error;
    }

    // Verify the token using our secret key
    let decoded;

    try {
        decoded = jwt.verify(token, config.jwtSecret);
    } catch (err) {
        const error = new Error(
            err.name === "TokenExpiredError"
                ? "Your session has expired. Please log in again."
                : "Invalid authentication token."
        );

        error.statusCode = 401;
        throw error;
    }

    // Find the user associated with the token
    const user = await User.findById(decoded.userId);

    if (!user) {
        const error = new Error("User account no longer exists.");
        error.statusCode = 401;
        throw error;
    }

    // Make the authenticated user available to controllers
    req.user = user;

    next();
});

export default protect;