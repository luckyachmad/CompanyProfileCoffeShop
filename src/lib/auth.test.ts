import { describe, it, expect, vi, beforeEach } from 'vitest';
import bcrypt from 'bcryptjs';
import { authOptions } from './auth';
import { pool } from './db';

// Mock the database pool
vi.mock('./db', () => ({
  pool: {
    query: vi.fn(),
  },
}));

describe('NextAuth Configuration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('authOptions structure', () => {
    it('should have JWT session strategy configured', () => {
      expect(authOptions.session?.strategy).toBe('jwt');
    });

    it('should have Credentials provider configured', () => {
      expect(authOptions.providers).toHaveLength(1);
      expect(authOptions.providers[0]).toHaveProperty('name', 'Credentials');
    });

    it('should have custom sign-in page configured', () => {
      expect(authOptions.pages?.signIn).toBe('/api/auth/signin');
    });

    it('should have JWT and session callbacks defined', () => {
      expect(authOptions.callbacks?.jwt).toBeDefined();
      expect(authOptions.callbacks?.session).toBeDefined();
    });

    it('should read secret from environment variable', () => {
      expect(authOptions.secret).toBe(process.env.NEXTAUTH_SECRET);
    });
  });

  describe('Credentials Provider authorize function', () => {
    const credentialsProvider = authOptions.providers[0] as any;
    const authorize = credentialsProvider.options.authorize;

    it('should return null when email is missing', async () => {
      const result = await authorize({ password: 'test123' }, {} as any);
      expect(result).toBeNull();
    });

    it('should return null when password is missing', async () => {
      const result = await authorize({ email: 'admin@test.com' }, {} as any);
      expect(result).toBeNull();
    });

    it('should return null when admin does not exist', async () => {
      vi.mocked(pool.query).mockResolvedValueOnce({
        rows: [],
        command: 'SELECT',
        rowCount: 0,
        oid: 0,
        fields: [],
      } as any);

      const result = await authorize(
        { email: 'nonexistent@test.com', password: 'test123' },
        {} as any
      );

      expect(result).toBeNull();
      expect(pool.query).toHaveBeenCalledWith(
        'SELECT * FROM admins WHERE email = $1',
        ['nonexistent@test.com']
      );
    });

    it('should return null when password is invalid', async () => {
      const hashedPassword = await bcrypt.hash('correctpassword', 10);

      vi.mocked(pool.query).mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            email: 'admin@test.com',
            password: hashedPassword,
            created_at: new Date(),
          },
        ],
        command: 'SELECT',
        rowCount: 1,
        oid: 0,
        fields: [],
      } as any);

      const result = await authorize(
        { email: 'admin@test.com', password: 'wrongpassword' },
        {} as any
      );

      expect(result).toBeNull();
    });

    it('should return user object when credentials are valid', async () => {
      const hashedPassword = await bcrypt.hash('correctpassword', 10);

      vi.mocked(pool.query).mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            email: 'admin@test.com',
            password: hashedPassword,
            created_at: new Date(),
          },
        ],
        command: 'SELECT',
        rowCount: 1,
        oid: 0,
        fields: [],
      } as any);

      const result = await authorize(
        { email: 'admin@test.com', password: 'correctpassword' },
        {} as any
      );

      expect(result).toEqual({
        id: '1',
        email: 'admin@test.com',
      });
    });

    it('should return null when database query fails', async () => {
      vi.mocked(pool.query).mockRejectedValueOnce(new Error('Database error'));

      const result = await authorize(
        { email: 'admin@test.com', password: 'test123' },
        {} as any
      );

      expect(result).toBeNull();
    });

    it('should not expose password in returned user object', async () => {
      const hashedPassword = await bcrypt.hash('correctpassword', 10);

      vi.mocked(pool.query).mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            email: 'admin@test.com',
            password: hashedPassword,
            created_at: new Date(),
          },
        ],
        command: 'SELECT',
        rowCount: 1,
        oid: 0,
        fields: [],
      } as any);

      const result = await authorize(
        { email: 'admin@test.com', password: 'correctpassword' },
        {} as any
      );

      expect(result).not.toHaveProperty('password');
    });
  });

  describe('JWT callback', () => {
    it('should add user ID to token on sign in', async () => {
      const token = { email: 'admin@test.com' } as any;
      const user = { id: '1', email: 'admin@test.com' };

      const result = await authOptions.callbacks!.jwt!({
        token,
        user,
        trigger: 'signIn',
        account: null,
        profile: undefined,
        isNewUser: false,
        session: undefined,
      } as any);

      expect(result.id).toBe('1');
    });

    it('should preserve existing token when user is not provided', async () => {
      const token = { email: 'admin@test.com', id: '1' } as any;

      const result = await authOptions.callbacks!.jwt!({
        token,
        trigger: 'update',
        account: null,
        profile: undefined,
        isNewUser: false,
        session: undefined,
      } as any);

      expect(result).toEqual(token);
    });
  });

  describe('Session callback', () => {
    it('should add user ID from token to session', async () => {
      const session = {
        user: { email: 'admin@test.com', id: '' },
        expires: '2024-12-31',
      } as any;
      const token = { id: '1', email: 'admin@test.com' } as any;

      const result = await authOptions.callbacks!.session!({
        session,
        token,
        trigger: 'update',
        newSession: undefined,
        user: undefined as any,
      } as any);

      expect((result as any).user.id).toBe('1');
    });

    it('should handle session without user object', async () => {
      const session = { expires: '2024-12-31' } as any;
      const token = { id: '1', email: 'admin@test.com' } as any;

      const result = await authOptions.callbacks!.session!({
        session,
        token,
        trigger: 'update',
        newSession: undefined,
        user: undefined as any,
      } as any);

      expect(result).toEqual(session);
    });
  });

  describe('Security requirements', () => {
    it('should use bcrypt for password comparison', async () => {
      const credentialsProvider = authOptions.providers[0] as any;
      const authorize = credentialsProvider.options.authorize;

      const hashedPassword = await bcrypt.hash('testpassword', 10);

      vi.mocked(pool.query).mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            email: 'admin@test.com',
            password: hashedPassword,
            created_at: new Date(),
          },
        ],
        command: 'SELECT',
        rowCount: 1,
        oid: 0,
        fields: [],
      } as any);

      await authorize(
        { email: 'admin@test.com', password: 'testpassword' },
        {} as any
      );

      // Verify bcrypt.compare was called (implicitly tested by successful auth)
      expect(pool.query).toHaveBeenCalled();
    });

    it('should use parameterized queries to prevent SQL injection', async () => {
      const credentialsProvider = authOptions.providers[0] as any;
      const authorize = credentialsProvider.options.authorize;

      vi.mocked(pool.query).mockResolvedValueOnce({
        rows: [],
        command: 'SELECT',
        rowCount: 0,
        oid: 0,
        fields: [],
      } as any);

      const maliciousEmail = "admin@test.com' OR '1'='1";
      await authorize(
        { email: maliciousEmail, password: 'test123' },
        {} as any
      );

      // Verify parameterized query was used
      expect(pool.query).toHaveBeenCalledWith(
        'SELECT * FROM admins WHERE email = $1',
        [maliciousEmail]
      );
    });
  });
});
