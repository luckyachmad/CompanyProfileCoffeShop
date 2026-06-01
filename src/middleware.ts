import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

/**
 * Next.js Middleware for Authentication Protection
 * 
 * This middleware protects all routes under /admin/* by verifying the NextAuth
 * session token. Unauthenticated requests are redirected to the sign-in page.
 * 
 * Implementation:
 * - Uses NextAuth's withAuth middleware wrapper
 * - Intercepts requests to /admin/* routes
 * - Verifies session token from httpOnly cookie
 * - Redirects unauthenticated users to /api/auth/signin
 * - Allows authenticated users to proceed to admin dashboard
 * 
 * Requirements: 11.4
 */
export default withAuth(
  // Middleware function - called for authenticated requests
  function middleware(req) {
    // Allow the request to proceed
    return NextResponse.next();
  },
  {
    callbacks: {
      /**
       * Authorization callback - determines if user can access the route
       * @param token - The JWT token from the session
       * @returns true if user is authorized, false otherwise
       */
      authorized: ({ token }) => {
        // User is authorized if they have a valid token
        return !!token;
      },
    },
    pages: {
      // Redirect unauthenticated users to the NextAuth sign-in page
      signIn: '/api/auth/signin',
    },
  }
);

/**
 * Matcher configuration - specifies which routes this middleware applies to
 * 
 * Protects:
 * - /admin - Admin dashboard home
 * - /admin/* - All admin sub-routes (menu, gallery, etc.)
 * 
 * Does NOT protect:
 * - / - Public landing page
 * - /api/* - API routes (except /api/auth/*)
 * - /_next/* - Next.js internal routes
 * - /public/* - Static assets
 */
export const config = {
  matcher: ['/admin/:path*'],
};
