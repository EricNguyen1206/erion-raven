import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { User, IUser } from "@/models/User";
import { Session } from "@/models/Session";
import { config } from "@/config/config";
import { SignupRequestDto, SigninRequestDto } from "@raven/validators";
import { UserDto } from "@raven/types";
import { OAuth2Client } from 'google-auth-library';
import { googleConfig } from '@/config/google';
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
      if (!user.password) {
        throw new Error("Invalid credentials");
      }
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

  // Google Auth Methods
  public async verifyGoogleToken(token: string): Promise<any> {
    try {
      const client = new OAuth2Client(googleConfig.clientId);
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: googleConfig.clientId,
      });
      const payload = ticket.getPayload();

      if (!payload) {
        throw new Error("Invalid Google Token Payload");
      }

      return payload;
    } catch (error) {
      logger.error("Google token verification failed:", error);
      throw new Error("Invalid Google Token");
    }
  }

  public async googleSignin(token: string): Promise<{ user: UserDto; accessToken: string; refreshToken: string }> {
    try {
      const payload = await this.verifyGoogleToken(token);

      if (!payload.email || !payload.email_verified) {
        throw new Error("Google account must have a verified email");
      }

      let user = await User.findOne({ email: payload.email });

      if (!user) {
        // Create new user if not exists
        let username = payload.name || payload.email.split('@')[0];

        // Ensure username uniqueness
        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
          username = `${username}${Math.floor(1000 + Math.random() * 9000)}`;
        }

        user = new User({
          username,
          email: payload.email,
          avatar: payload.picture,
          // No password for Google users
        });

        await user.save();
        logger.info("New user created via Google Sign-In", { userId: user.id, email: user.email });
      } else {
        // Update avatar if not present or changed (optional policy)
        if (payload.picture && user.avatar !== payload.picture) {
          user.avatar = payload.picture;
          await user.save();
        }
      }

      // Generate tokens (Reuse existing logic or refactor)
      // For now, I'll copy the logic to keep it independent but consistent
      const accessToken = jwt.sign(
        { userId: user.id, email: user.email, username: user.username },
        config.jwt.secret,
        { expiresIn: config.jwt.accessExpire } as jwt.SignOptions
      );

      const refreshToken = crypto.randomBytes(64).toString("hex");
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      const session = new Session({
        userId: user._id,
        refreshToken,
        expiresAt,
      });

      await session.save();
      logger.info("User signed in via Google", { userId: user.id });

      const userResponse: UserDto = {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
      };
      if (user.avatar) {
        userResponse.avatar = user.avatar;
      }

      return {
        user: userResponse,
        accessToken,
        refreshToken,
      };

    } catch (error) {
      logger.error("Google signin error:", error);
      throw error;
    }
  }
}
