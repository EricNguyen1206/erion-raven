import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { User, IUser } from "@/models/User";
import { Session } from "@/models/Session";
import { config } from "@/config/config";
import { SignupRequestDto, SigninRequestDto } from "@notify/validators";
import { UserDto } from "@notify/types";
import { logger } from "@/utils/logger";

export class AuthService {
  public async signup(data: SignupRequestDto): Promise<UserDto> {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email: data.email });

      if (existingUser) {
        throw new Error("Email already exists");
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, 12);

      // Create user
      const user = new User({
        username: data.username,
        email: data.email,
        password: hashedPassword,
      });

      const savedUser = await user.save();

      logger.info("User signed up successfully", { userId: savedUser.id, email: savedUser.email });

      const response: UserDto = {
        id: savedUser.id,
        username: savedUser.username,
        email: savedUser.email,
        createdAt: savedUser.createdAt,
      };
      if (savedUser.avatar !== undefined) {
        response.avatar = savedUser.avatar;
      }
      return response;
    } catch (error) {
      logger.error("Signup error:", error);
      throw error;
    }
  }

  public async signin(
    data: SigninRequestDto
  ): Promise<{ user: UserDto; accessToken: string; refreshToken: string }> {
    try {
      // Find user by email
      const user = await User.findOne({ email: data.email });

      if (!user) {
        throw new Error("Invalid credentials");
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(data.password, user.password);
      if (!isPasswordValid) {
        throw new Error("Invalid credentials");
      }

      // Generate access token (short-lived)
      const accessToken = jwt.sign(
        { userId: user.id, email: user.email, username: user.username },
        config.jwt.secret,
        {
          expiresIn: config.jwt.accessExpire,
        } as jwt.SignOptions
      );

      // Generate refresh token (long-lived, 30 days)
      const refreshToken = crypto.randomBytes(64).toString("hex");

      // Calculate expiration date (30 days from now)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      // Create session record
      const session = new Session({
        userId: user._id,
        refreshToken,
        expiresAt,
      });

      await session.save();

      logger.info("User signed in successfully", { userId: user.id, email: user.email });

      const userResponse: UserDto = {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
      };
      if (user.avatar !== undefined) {
        userResponse.avatar = user.avatar;
      }

      return {
        user: userResponse,
        accessToken,
        refreshToken,
      };
    } catch (error) {
      logger.error("Signin error:", error);
      throw error;
    }
  }

  public async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      // Find session by refresh token
      const session = await Session.findOne({ refreshToken }).populate<{ user: IUser }>("userId");

      if (!session) {
        throw new Error("Invalid refresh token");
      }

      // Check if session is expired
      if (session.isExpired()) {
        throw new Error("Refresh token expired");
      }

      // Get user from populated field
      const user = session.userId as unknown as IUser;
      if (!user) {
        throw new Error("User not found");
      }

      // Generate new access token
      const accessToken = jwt.sign(
        { userId: user.id, email: user.email, username: user.username },
        config.jwt.secret,
        {
          expiresIn: config.jwt.accessExpire,
        } as jwt.SignOptions
      );

      logger.info("Access token refreshed", { userId: user.id, sessionId: session.id });

      return { accessToken };
    } catch (error) {
      logger.error("Refresh token error:", error);
      throw error;
    }
  }

  public async signout(refreshToken: string, userId: string): Promise<void> {
    try {
      // Find and delete session
      const session = await Session.findOne({ refreshToken, userId });

      if (session) {
        await Session.deleteOne({ _id: session._id });
        logger.info("User signed out successfully", { userId, sessionId: session.id });
      }
    } catch (error) {
      logger.error("Signout error:", error);
      throw error;
    }
  }

  public async logoutAll(userId: string): Promise<void> {
    try {
      // Delete all sessions for user
      await Session.deleteMany({ userId });

      logger.info("All sessions logged out", { userId });
    } catch (error) {
      logger.error("Logout all error:", error);
      throw error;
    }
  }
}
