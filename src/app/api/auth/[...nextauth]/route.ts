import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * NextAuth API Route Handler
 * 
 * This route handler exports the NextAuth authentication endpoints
 * for both GET and POST requests. It uses the authOptions configuration
 * defined in src/lib/auth.ts.
 * 
 * Endpoints provided:
 * - GET /api/auth/signin - Sign in page
 * - POST /api/auth/signin - Sign in submission
 * - GET /api/auth/signout - Sign out page
 * - POST /api/auth/signout - Sign out submission
 * - GET /api/auth/session - Get current session
 * - GET /api/auth/csrf - Get CSRF token
 * - GET /api/auth/providers - Get configured providers
 * 
 * Requirements: 11.1
 */
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
