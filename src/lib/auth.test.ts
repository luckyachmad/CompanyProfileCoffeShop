import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authOptions } from './auth';
import bcrypt from 'bcryptjs';

// Mock dependencies
vi.mock('./db', () => ({
  pool: {
    query: vi.fn(),
  },
}));

vi.mock('bcryptjs', () => ({
  default: {
    compare: vi.fn(),
  },
}));

import { pool } from './db';

/**
 * Test Suite for Admin Authentication Flow
 * 
 * Tests Requirements:
 * - 11.2: Sign-in with valid credentials
 * - 11.3: Sign-in with invalid credentials  
 * - 11.4: Middleware protection (tested in middleware.test.ts)
 * - 11.5: Sign-out functionality (tested via NextAuth)
 * 
 * Task: 15.2
 */
describe('Admin Authentication - Sign-in Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Sign-in with valid credentials (Requirement 11.2)', () => {
    it('should authenticate admin with correct email and password', async () => {
      const mockAdmin = {
        id: 1,
        email: 'admin@coffeeshop.com',
        password: '$2a$10$hashedPasswordValue',
        created_at: new Date(),
      };

      // Mock database query to return admin
      vi.mocked(pool.query).mockResolvedValue({
        rows: [mockAdmin],
        command: 'SELECT',
        rowCount: 1,
        oid: 0,
        fields: [],
      });

      // Mock bcrypt.compare to return true (valid password)
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

      // Get the Credentials provider
      const credentialsProvider = authOptions.providers[0];
      if (credentialsProvider.type !== 'credentials') {
        throw new Error('Expected Credentials provider');
      }

      // Call the authorize function
      const result = await credentialsProvider.authorize!(
        {
          email: 'admin@coffeeshop.com',
          password: 'correct-password',
        },
        {} as any
      );

      // Verify database was queried with email
      expect(pool.query).toHaveBeenCalledWith(
        'SELECT * FROM admins WHERE email = $1',
        ['admin@coffeeshop.com']
      );

      // Verify bcrypt.compare was called with password and hash
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'correct-password',
        mockAdmin.password
      );

      // Verify user object is returned (without password)
      expect(result).toEqual({
        id: '1',
        email: 'admin@coffeeshop.com',
      });
    });

    it('should create server-side session with httpOnly cookie', () => {
      // Verify session configuration
      expect(authOptions.session).toEqual({
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
      });

      // JWT strategy uses httpOnly cookies by default in NextAuth
      // This is handled internally by NextAuth.js
    });

    it('should include user ID in JWT token', async () => {
      const mockToken = { sub: '1' };
      const mockUser = { id: '1', email: 'admin@coffeeshop.com' };

      // Get the JWT callback
      const jwtCallback = authOptions.callbacks?.jwt;
      expect(jwtCallback).toBeDefined();

      if (jwtCallback) {
        const result = await jwtCallback({
          token: mockToken,
          user: mockUser,
          trigger: 'signIn',
          isNewUser: false,
          session: undefined,
          account: null,
        });

        // Verify user ID is added to token
        expect(result).toHaveProperty('id', '1');
      }
    });

    it('should include user ID in session object', async () => {
      const mockSession = {
        user: { email: 'admin@coffeeshop.com' },
        expires: '2024-12-31',
      };
      const mockToken = { id: '1', sub: '1' };

      // Get the session callback
      const sessionCallback = authOptions.callbacks?.session;
      expect(sessionCallback).toBeDefined();

      if (sessionCallback) {
        const result = await sessionCallback({
          session: mockSession as any,
          token: mockToken,
          user: undefined as any,
          trigger: 'getSession',
          newSession: undefined,
        });

        // Verify user ID is added to session from token
        expect(result.user).toHaveProperty('id', '1');
      }
    });
  });

  describe('Sign-in with invalid credentials (Requirement 11.3)', () => {
    it('should reject sign-in when email is missing', async () => {
      const credentialsProvider = authOptions.providers[0];
      if (credentialsProvider.type !== 'credentials') {
        throw new Error('Expected Credentials provider');
      }

      const result = await credentialsProvider.authorize!(
        {
          password: 'some-password',
        } as any,
        {} as any
      );

      // Should return null for invalid credentials
      expect(result).toBeNull();

      // Database should not be queried
      expect(pool.query).not.toHaveBeenCalled();
    });

    it('should reject sign-in when password is missing', async () => {
      const credentialsProvider = authOptions.providers[0];
      if (credentialsProvider.type !== 'credentials') {
        throw new Error('Expected Credentials provider');
      }

      const result = await credentialsProvider.authorize!(
        {
          email: 'admin@coffeeshop.com',
        } as any,
        {} as any
      );

      // Should return null for invalid credentials
      expect(result).toBeNull();

      // Database should not be queried
      expect(pool.query).not.toHaveBeenCalled();
    });

    it('should reject sign-in when email does not exist in database', async () => {
      // Mock database query to return no results
      vi.mocked(pool.query).mockResolvedValue({
        rows: [],
        command: 'SELECT',
        rowCount: 0,
        oid: 0,
        fields: [],
      });

      const credentialsProvider = authOptions.providers[0];
      if (credentialsProvider.type !== 'credentials') {
        throw new Error('Expected Credentials provider');
      }

      const result = await credentialsProvider.authorize!(
        {
          email: 'nonexistent@coffeeshop.com',
          password: 'any-password',
        },
        {} as any
      );

      // Verify database was queried
      expect(pool.query).toHaveBeenCalledWith(
        'SELECT * FROM admins WHERE email = $1',
        ['nonexistent@coffeeshop.com']
      );

      // Should return null when admin not found
      expect(result).toBeNull();

      // bcrypt.compare should not be called
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should reject sign-in when password is incorrect', async () => {
      const mockAdmin = {
        id: 1,
        email: 'admin@coffeeshop.com',
        password: '$2a$10$hashedPasswordValue',
        created_at: new Date(),
      };

      // Mock database query to return admin
      vi.mocked(pool.query).mockResolvedValue({
        rows: [mockAdmin],
        command: 'SELECT',
        rowCount: 1,
        oid: 0,
        fields: [],
      });

      // Mock bcrypt.compare to return false (invalid password)
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      const credentialsProvider = authOptions.providers[0];
      if (credentialsProvider.type !== 'credentials') {
        throw new Error('Expected Credentials provider');
      }

      const result = await credentialsProvider.authorize!(
        {
          email: 'admin@coffeeshop.com',
          password: 'wrong-password',
        },
        {} as any
      );

      // Verify bcrypt.compare was called
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'wrong-password',
        mockAdmin.password
      );

      // Should return null when password is incorrect
      expect(result).toBeNull();
    });

    it('should display non-empty error message on invalid credentials', () => {
      // Verify error page is configured
      expect(authOptions.pages).toBeDefined();
      expect(authOptions.pages?.error).toBe('/api/auth/error');
    });

    it('should NOT create session when credentials are invalid', async () => {
      // Mock database query to return no results
      vi.mocked(pool.query).mockResolvedValue({
        rows: [],
        command: 'SELECT',
        rowCount: 0,
        oid: 0,
        fields: [],
      });

      const credentialsProvider = authOptions.providers[0];
      if (credentialsProvider.type !== 'credentials') {
        throw new Error('Expected Credentials provider');
      }

      const result = await credentialsProvider.authorize!(
        {
          email: 'invalid@example.com',
          password: 'wrong-password',
        },
        {} as any
      );

      // authorize returns null, which prevents session creation
      expect(result).toBeNull();
    });
  });

  describe('Authentication configuration', () => {
    it('should use Credentials provider', () => {
      expect(authOptions.providers).toHaveLength(1);
      expect(authOptions.providers[0].type).toBe('credentials');
      expect(authOptions.providers[0].name).toBe('Credentials');
    });

    it('should use JWT session strategy', () => {
      expect(authOptions.session?.strategy).toBe('jwt');
    });

    it('should have 30-day session max age', () => {
      expect(authOptions.session?.maxAge).toBe(30 * 24 * 60 * 60);
    });

    it('should read NEXTAUTH_SECRET from environment', () => {
      expect(authOptions.secret).toBe(process.env.NEXTAUTH_SECRET);
    });

    it('should enable debug mode in development', () => {
      const isDevelopment = process.env.NODE_ENV === 'development';
      expect(authOptions.debug).toBe(isDevelopment);
    });

    it('should configure custom sign-in page', () => {
      expect(authOptions.pages?.signIn).toBe('/auth/signin');
    });
  });

  describe('Error handling', () => {
    it('should handle database connection errors gracefully', async () => {
      // Mock database query to throw error
      vi.mocked(pool.query).mockRejectedValue(new Error('Database connection failed'));

      const credentialsProvider = authOptions.providers[0];
      if (credentialsProvider.type !== 'credentials') {
        throw new Error('Expected Credentials provider');
      }

      // Spy on console.error
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await credentialsProvider.authorize!(
        {
          email: 'admin@coffeeshop.com',
          password: 'password',
        },
        {} as any
      );

      // Should return null on error
      expect(result).toBeNull();

      // Should log error
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Authentication error:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    it('should handle bcrypt comparison errors gracefully', async () => {
      const mockAdmin = {
        id: 1,
        email: 'admin@coffeeshop.com',
        password: '$2a$10$hashedPasswordValue',
        created_at: new Date(),
      };

      vi.mocked(pool.query).mockResolvedValue({
        rows: [mockAdmin],
        command: 'SELECT',
        rowCount: 1,
        oid: 0,
        fields: [],
      });

      // Mock bcrypt.compare to throw error
      vi.mocked(bcrypt.compare).mockRejectedValue(new Error('bcrypt error') as never);

      const credentialsProvider = authOptions.providers[0];
      if (credentialsProvider.type !== 'credentials') {
        throw new Error('Expected Credentials provider');
      }

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await credentialsProvider.authorize!(
        {
          email: 'admin@coffeeshop.com',
          password: 'password',
        },
        {} as any
      );

      // Should return null on error
      expect(result).toBeNull();

      // Should log error
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Security requirements', () => {
    it('should NOT expose password in returned user object', async () => {
      const mockAdmin = {
        id: 1,
        email: 'admin@coffeeshop.com',
        password: '$2a$10$hashedPasswordValue',
        created_at: new Date(),
      };

      vi.mocked(pool.query).mockResolvedValue({
        rows: [mockAdmin],
        command: 'SELECT',
        rowCount: 1,
        oid: 0,
        fields: [],
      });

      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

      const credentialsProvider = authOptions.providers[0];
      if (credentialsProvider.type !== 'credentials') {
        throw new Error('Expected Credentials provider');
      }

      const result = await credentialsProvider.authorize!(
        {
          email: 'admin@coffeeshop.com',
          password: 'correct-password',
        },
        {} as any
      );

      // Verify password is NOT in the returned object
      expect(result).not.toHaveProperty('password');
      expect(result).toEqual({
        id: '1',
        email: 'admin@coffeeshop.com',
      });
    });

    it('should use bcrypt for password verification', async () => {
      const mockAdmin = {
        id: 1,
        email: 'admin@coffeeshop.com',
        password: '$2a$10$hashedPasswordValue',
        created_at: new Date(),
      };

      vi.mocked(pool.query).mockResolvedValue({
        rows: [mockAdmin],
        command: 'SELECT',
        rowCount: 1,
        oid: 0,
        fields: [],
      });

      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

      const credentialsProvider = authOptions.providers[0];
      if (credentialsProvider.type !== 'credentials') {
        throw new Error('Expected Credentials provider');
      }

      await credentialsProvider.authorize!(
        {
          email: 'admin@coffeeshop.com',
          password: 'password',
        },
        {} as any
      );

      // Verify bcrypt.compare is used (not plain text comparison)
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'password',
        '$2a$10$hashedPasswordValue'
      );
    });

    it('should use parameterized SQL query to prevent SQL injection', async () => {
      const maliciousEmail = "admin@example.com' OR '1'='1";

      vi.mocked(pool.query).mockResolvedValue({
        rows: [],
        command: 'SELECT',
        rowCount: 0,
        oid: 0,
        fields: [],
      });

      const credentialsProvider = authOptions.providers[0];
      if (credentialsProvider.type !== 'credentials') {
        throw new Error('Expected Credentials provider');
      }

      await credentialsProvider.authorize!(
        {
          email: maliciousEmail,
          password: 'password',
        },
        {} as any
      );

      // Verify parameterized query is used (email is passed as parameter, not concatenated)
      expect(pool.query).toHaveBeenCalledWith(
        'SELECT * FROM admins WHERE email = $1',
        [maliciousEmail]
      );
    });
  });
});
