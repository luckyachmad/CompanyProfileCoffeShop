import 'next-auth';
import 'next-auth/jwt';

/**
 * Extend NextAuth types to include custom user properties
 * This allows us to add the user ID to the session and JWT token
 */
declare module 'next-auth' {
  interface User {
    id: string;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
  }
}
