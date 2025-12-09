import mongoose from "mongoose";
import { config } from "./config";
import { logger } from "@/utils/logger";

export const initializeDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(config.database.uri);

    logger.info("✅ MongoDB connection established successfully");

    // Log connection info
    const connection = mongoose.connection;
    logger.info(`📊 Connected to database: ${connection.name}`);
    logger.info(`🔗 MongoDB host: ${connection.host}:${connection.port}`);

    // Handle connection events
    connection.on("error", (error) => {
      logger.error("MongoDB connection error:", error);
    });

    connection.on("disconnected", () => {
      logger.warn("MongoDB disconnected");
    });

    connection.on("reconnected", () => {
      logger.info("MongoDB reconnected");
    });

  } catch (error: any) {
    logger.error("❌ Error during MongoDB initialization:", error);

    // Provide helpful error messages for common issues
    if (error.name === "MongoServerSelectionError") {
      logger.error(
        "\n💡 Troubleshooting tips:\n" +
        "1. Check if MongoDB server is running\n" +
        "2. Verify the MONGODB_URI is correct\n" +
        "3. For MongoDB Atlas, ensure your IP is whitelisted\n" +
        "4. Check your internet connection"
      );
    } else if (error.name === "MongoParseError") {
      logger.error(
        "\n💡 Troubleshooting tips:\n" +
        "1. Verify the MONGODB_URI format is correct\n" +
        "2. Expected format: mongodb://[username:password@]host[:port]/database\n" +
        "3. For Atlas: mongodb+srv://username:password@cluster.mongodb.net/database"
      );
    } else if (error.message?.includes("authentication")) {
      logger.error(
        "\n💡 Troubleshooting tips:\n" +
        "1. Verify your MongoDB username and password\n" +
        "2. Ensure the user has access to the database\n" +
        "3. If password contains special characters, URL-encode them"
      );
    }

    process.exit(1);
  }
};

export const closeDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    logger.info("✅ MongoDB connection closed");
  } catch (error) {
    logger.error("❌ Error closing MongoDB connection:", error);
  }
};
