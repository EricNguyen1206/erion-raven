import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GithubStrategy } from 'passport-github2';
import { AuthService } from '../services/auth.service';
import { config } from './config';
import { googleConfig } from './google';

const authService = new AuthService();

// Ensure base URL is correctly formed
const apiBaseUrl = process.env.API_BASE_URL || `http://localhost:${config.port}`;

passport.use(
  new GoogleStrategy(
    {
      clientID: googleConfig.clientId,
      clientSecret: googleConfig.clientSecret,
      callbackURL: `${apiBaseUrl}/api/v1/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
        if (!email) {
          return done(new Error('No email found from Google profile'), false);
        }

        const user = await authService.findOrCreateOAuthUser({
          provider: 'google',
          providerId: profile.id,
          email: email,
          name: profile.displayName,
          avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : undefined,
        });

        done(null, user);
      } catch (error) {
        done(error, false);
      }
    }
  )
);

passport.use(
  new GithubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
      callbackURL: `${apiBaseUrl}/api/v1/auth/github/callback`,
      scope: ['user:email'],
    },
    async (accessToken: string, refreshToken: string, profile: any, done: any) => {
      try {
        // GitHub might not return public email in profile directly,
        // but passport-github2 fetches emails when scope includes 'user:email'
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
        if (!email) {
          return done(new Error('No email found from GitHub profile. Please ensure your email is public or grant email access.'), false);
        }

        const user = await authService.findOrCreateOAuthUser({
          provider: 'github',
          providerId: profile.id,
          email: email,
          name: profile.displayName || profile.username,
          avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : undefined,
        });

        done(null, user);
      } catch (error) {
        done(error, false);
      }
    }
  )
);

export default passport;
