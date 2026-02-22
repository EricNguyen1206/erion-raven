import { logger } from "@/utils/logger";
import { prisma } from "@/lib/prisma";

export const initializeDatabase = async (): Promise<void> => {
  try {
    // Attempt a simple query to ensure the connection is established
    await prisma.$queryRaw`SELECT 1`;
    logger.info("✅ Database connection established successfully via Prisma");

  } catch (error: any) {
    logger.error("❌ Error during Database initialization:", error);
    process.exit(1);
  }
};

export const closeDatabase = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
    logger.info("✅ Prisma Database connection closed");
  } catch (error) {
    logger.error("❌ Error closing Prisma Database connection:", error);
  }
};
