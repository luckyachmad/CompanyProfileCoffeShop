import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { pool } from '@/lib/db';
import type { Admin } from '@/types/admin';

/**
 * NextAuth.js configuration for admin authentication
 * 
 * Implements:
 * - Credentials provider with email/password authentication
 * - bcrypt password verification against PostgreSQL admins table
 * - JWT session strategy with httpOnly cookies
 * - Session callbacks for user data persistence
 * 
 * Requirements: 11.1, 11.2, 11.6
 */
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { 
          label: "Email", 
          type: "email",
          placeholder: "admin@example.com"
        },
        password: { 
          label: "Password", 
          type: "password" 
        }
      },
      async authorize(credentials) {
        // Validate that credentials are provided
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Query admin user from database
          const result = await pool.query<Admin>(
            'SELECT * FROM admins WHERE email = $1',
            [credentials.email]
          );

          // Check if admin exists
          if (result.rows.length === 0) {
            return null;
          }

          const admin = result.rows[0];

          // Verify password using bcrypt
          const isValidPassword = await bcrypt.compare(
            credentials.password,
            admin.password
          );

          if (!isValidPassword) {
            return null;
          }

          // Return user object (password excluded for security)
          return {
            id: admin.id.toString(),
            email: admin.email,
          };
        } catch (error) {
          console.error('Authentication error:', error);
          return null;
        }
      }
    })
  ],

  // Use JWT strategy for session management
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // Custom pages
  pages: {
    signIn: '/auth/signin',
    error: '/api/auth/error',
  },

  // Callbacks for JWT and session handling
  callbacks: {
    /**
     * JWT callback - called whenever a JWT is created or updated
     * Adds user ID to the token
     */
    async jwt({ token, user }) {
      // On sign in, add user ID to token
      if (user) {
        token.id = user.id;
      }
      return token;
    },

    /**
     * Session callback - called whenever a session is checked
     * Adds user ID from token to session object
     */
    async session({ session, token }) {
      // Add user ID to session from token
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    }
  },

  // Security options
  secret: process.env.NEXTAUTH_SECRET,

  // Enable debug in development
  debug: process.env.NODE_ENV === 'development',
};
