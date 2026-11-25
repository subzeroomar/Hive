import mongoose from "mongoose";
import config from "./config.js";

const connectDB = async () => {
    try {
        if (!config.mongoUri) {
            throw new Error("MONGODB_URI is missing from .env");
        }

        const connection = await mongoose.connect(config.mongoUri);

        console.log(`MongoDB connected: ${connection.connection.host}`);
        console.log(`Database: ${connection.connection.name}`);
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        process.exit(1);
    }
};

export default connectDB;