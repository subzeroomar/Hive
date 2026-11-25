import app from "./app.js";
import connectDB from "./config/db.js";
import config from "./config/config.js";

const startServer = async () => {
    try {
        await connectDB();

        app.listen(config.port, () => {
            console.log(`Hive server running on port ${config.port}`);
            console.log(`Environment: ${config.nodeEnv}`);
        });
    } catch (error) {
        console.error("Server startup failed:", error.message);
        process.exit(1);
    }
};

startServer();