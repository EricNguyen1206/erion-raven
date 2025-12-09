import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "@/config/config";
import { User, IUser } from "@/models/User";
import { logger } from "@/utils/logger";

export interface AuthenticatedRequest extends Request {
  user?: IUser;
  userId?: string;
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Try to get token from cookie first (preferred method)
    let token = req.cookies?.["accessToken"];

    // Fallback to Authorization header for backward compatibility
    if (!token) {
      const authHeader = req.headers.authorization;
      token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN
    }

    if (!token) {
      res.status(401).json({
        code: 401,
        message: "Unauthorized",
        details: "Access token is required",
      });
      return;
    }

    // Verify JWT token
    const decoded = jwt.verify(token, config.jwt.secret) as any;

    // Get user from database using Mongoose
    const user = await User.findOne({ _id: decoded.userId, deletedAt: null });

    if (!user) {
      res.status(401).json({
        code: 401,
        message: "Unauthorized",
        details: "User not found",
      });
      return;
    }

    // Add user to request object
    req.user = user;
    req.userId = user.id;

    next();
  } catch (error) {
    logger.error("Authentication error:", error);

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        code: 401,
        message: "Unauthorized",
        details: "Invalid token",
      });
      return;
    }

    res.status(500).json({
      code: 500,
      message: "Internal Server Error",
      details: "Authentication failed",
    });
  }
};
