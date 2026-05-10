import { server } from "./app.js";
import { dbconnect } from "./db/dbconnect.js";
import { connectRedis } from "./redis/redis.js";
import { initializeIO } from "./socket/socket.js";

const PORT = process.env.PORT || 8000;

async function start() {
    try {
        await dbconnect();
        console.log("MongoDB connected");

        await connectRedis();
        console.log("Redis connected");

        initializeIO();
        console.log("Socket Initialized");

        server.listen(PORT, "0.0.0.0", () => {
            console.log("server started on port", PORT);
        });
    } catch (error) {
        console.error("FATAL startup error:", error);
        process.exit(1);
    }
}

start();

const shutdown = (signal) => {
    console.log(`${signal} received, shutting down gracefully`);
    server.close(() => {
        console.log("HTTP server closed");
        process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref();
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("unhandledRejection", (err) => console.error("unhandledRejection:", err));
process.on("uncaughtException", (err) => console.error("uncaughtException:", err));
