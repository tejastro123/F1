import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import dotenv from 'dotenv';
dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || 'placeholder_id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'placeholder_secret',
      callbackURL: '/api/v1/auth/google/callback',
      scope: ['profile', 'email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          // User exists, proceed
          return done(null, user);
        }

        // Check if a user with this email already exists (e.g., an Admin who signed up manually)
        const email = profile.emails[0].value;
        user = await User.findOne({ email });

        if (user) {
          // Link Google to existing account
          user.googleId = profile.id;
          if (!user.displayName) user.displayName = profile.displayName;
          if (!user.avatarUrl) user.avatarUrl = profile.photos[0]?.value;
          await user.save();
          return done(null, user);
        }

        // Completely new user!
        const newUser = await User.create({
          email,
          googleId: profile.id,
          displayName: profile.displayName,
          avatarUrl: profile.photos[0]?.value,
          role: 'user', // Public permission level
        });

        return done(null, newUser);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// We won't use sessions globally in Express (since we prefer JWTs),
// but passport requires serialization functions to be defined if session is initialize.
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

export default passport;
