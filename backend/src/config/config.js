import dotenv from "dotenv";

dotenv.config();

const config = {
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || "development",
    mongoUri: process.env.MONGODB_URI,
    clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
    jwtSecret: process.env.JWT_SECRET,
};

export default config;