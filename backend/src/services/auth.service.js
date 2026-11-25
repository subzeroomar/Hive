
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import config from "../config/config.js";

// Generate a JWT for an authenticated user.
const generateToken = (userId) => {
    if (!config.jwtSecret) {
        throw new Error("JWT_SECRET is missing from environment configuration.");
    }

    return jwt.sign(
        { userId },
        config.jwtSecret,
        { expiresIn: "7d" }
    );
};

// Return safe public user information.
const getSafeUser = (user) => ({
    id: user._id,
    username: user.username,
    email: user.email,
    bio: user.bio,
    avatar: user.avatar,
    createdAt: user.createdAt,
});

// REGISTER
export const registerUser = async ({ username, email, password }) => {
    if (!username || !email || !password) {
        const error = new Error("Username, email, and password are required.");
        error.statusCode = 400;
        throw error;
    }

    const normalizedUsername = username.trim().toLowerCase();
    const normalizedEmail = email.trim().toLowerCase();

    if (normalizedUsername.length < 3 || normalizedUsername.length > 30) {
        const error = new Error("Username must be between 3 and 30 characters.");
        error.statusCode = 400;
        throw error;
    }

    if (password.length < 8) {
        const error = new Error("Password must be at least 8 characters.");
        error.statusCode = 400;
        throw error;
    }

    const existingUser = await User.findOne({
        $or: [
            { username: normalizedUsername },
            { email: normalizedEmail },
        ],
    });

    if (existingUser) {
        const error = new Error("Username or email is already registered.");
        error.statusCode = 409;
        throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
        username: normalizedUsername,
        email: normalizedEmail,
        password: hashedPassword,
    });

    return getSafeUser(user);
};

// LOGIN
export const loginUser = async ({ email, password }) => {
    if (!email || !password) {
        const error = new Error("Email and password are required.");
        error.statusCode = 400;
        throw error;
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Password is excluded by default in the User model.
    // Explicitly select it for password comparison.
    const user = await User.findOne({
        email: normalizedEmail,
    }).select("+password");

    if (!user) {
        const error = new Error("Invalid email or password.");
        error.statusCode = 401;
        throw error;
    }

    const isPasswordCorrect = await bcrypt.compare(
        password,
        user.password
    );

    if (!isPasswordCorrect) {
        const error = new Error("Invalid email or password.");
        error.statusCode = 401;
        throw error;
    }

    const token = generateToken(user._id);

    return {
        user: getSafeUser(user),
        token,
    };
};
