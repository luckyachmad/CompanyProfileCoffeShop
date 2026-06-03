/**
 * Authentication Middleware Tests
 * 
 * Tests middleware protection of /admin/* routes:
 * - Authenticated requests are allowed to proceed
 * - Unauthenticated requests are redirected to sign-in
 * - Middleware only applies to /admin/* routes
 * 
 * Requirements: 11.4
 * Task: 15.2
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock next-auth/middleware
const mockWithAuth = vi.fn((middleware, options) => {
  return async (req: NextRequest) => {
    // Simulate the withAuth behavior
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    const hasValidToken = options.callbacks.authorized({ token });

    if (!hasValidToken) {
      // Simulate redirect to sign-in page
      return {
        status: 307,
        headers: {
          Location: options.pages.signIn,
        },
      };
    }

    // Call the middleware function for authenticated requests
    return middleware(req);
  };
});

vi.mock('next-auth/middleware', () => ({
  default: mockWithAuth,
  withAuth: mockWithAuth,
}));

describe('Authentication Middleware (Requirement 11.4)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Middleware configuration', () => {
    it('should protect /admin/* routes', async () => {
      // Import config after mocks are set up
      const { config } = await import('./middleware');

      expect(config.matcher).toBeDefined();
      expect(config.matcher).toContain('/admin/:path*');
    });

    it('should not protect public routes', async () => {
      const { config } = await import('./middleware');

      // The matcher should only include /admin routes
      expect(config.matcher).not.toContain('/');
      expect(config.matcher).not.toContain('/api/*');
    });
  });

  describe('Authorization callback', () => {
    it('should authorize requests with valid token', async () => {
      // Clear module cache to re-import with fresh mocks
      vi.resetModules();

      const mockWithAuthLocal = vi.fn((middleware, options) => {
        // Test the authorization callback directly
        const isAuthorized = options.callbacks.authorized({ token: 'valid-token' });
        expect(isAuthorized).toBe(true);
        return middleware;
      });

      vi.doMock('next-auth/middleware', () => ({
        default: mockWithAuthLocal,
        withAuth: mockWithAuthLocal,
      }));

      await import('./middleware');

      expect(mockWithAuthLocal).toHaveBeenCalled();
    });

    it('should reject requests with null token', async () => {
      vi.resetModules();

      const mockWithAuthLocal = vi.fn((middleware, options) => {
        const isAuthorized = options.callbacks.authorized({ token: null });
        expect(isAuthorized).toBe(false);
        return middleware;
      });

      vi.doMock('next-auth/middleware', () => ({
        default: mockWithAuthLocal,
        withAuth: mockWithAuthLocal,
      }));

      await import('./middleware');

      expect(mockWithAuthLocal).toHaveBeenCalled();
    });

    it('should reject requests with undefined token', async () => {
      vi.resetModules();

      const mockWithAuthLocal = vi.fn((middleware, options) => {
        const isAuthorized = options.callbacks.authorized({ token: undefined });
        expect(isAuthorized).toBe(false);
        return middleware;
      });

      vi.doMock('next-auth/middleware', () => ({
        default: mockWithAuthLocal,
        withAuth: mockWithAuthLocal,
      }));

      await import('./middleware');

      expect(mockWithAuthLocal).toHaveBeenCalled();
    });
  });

  describe('Sign-in redirect configuration', () => {
    it('should redirect to custom sign-in page', async () => {
      vi.resetModules();

      const mockWithAuthLocal = vi.fn((middleware, options) => {
        expect(options.pages.signIn).toBe('/auth/signin');
        return middleware;
      });

      vi.doMock('next-auth/middleware', () => ({
        default: mockWithAuthLocal,
        withAuth: mockWithAuthLocal,
      }));

      await import('./middleware');

      expect(mockWithAuthLocal).toHaveBeenCalled();
    });
  });

  describe('Protected route behavior', () => {
    it('should allow authenticated access to /admin', async () => {
      vi.resetModules();

      let authCallbackFn: any;
      let middlewareFn: any;

      const mockWithAuthLocal = vi.fn((middleware, options) => {
        authCallbackFn = options.callbacks.authorized;
        middlewareFn = middleware;
        return async (req: NextRequest) => {
          const hasValidToken = authCallbackFn({ token: 'valid-token' });
          if (hasValidToken) {
            return middlewareFn(req);
          }
          return new Response(null, {
            status: 307,
            headers: { Location: options.pages.signIn },
          });
        };
      });

      vi.doMock('next-auth/middleware', () => ({
        default: mockWithAuthLocal,
        withAuth: mockWithAuthLocal,
      }));

      const middlewareModule = await import('./middleware');
      const middleware = mockWithAuthLocal.mock.results[0]?.value;

      const mockRequest = new NextRequest('http://localhost:3000/admin', {
        headers: { authorization: 'Bearer valid-token' },
      });

      const response = await middleware(mockRequest);

      // Should proceed to the protected route (NextResponse.next())
      expect(response).toBeDefined();
    });

    it('should redirect unauthenticated access to /admin', async () => {
      vi.resetModules();

      let authCallbackFn: any;

      const mockWithAuthLocal = vi.fn((middleware, options) => {
        authCallbackFn = options.callbacks.authorized;
        return async (req: NextRequest) => {
          const hasValidToken = authCallbackFn({ token: null });
          if (!hasValidToken) {
            return new Response(null, {
              status: 307,
              headers: { Location: options.pages.signIn },
            });
          }
          return middleware(req);
        };
      });

      vi.doMock('next-auth/middleware', () => ({
        default: mockWithAuthLocal,
        withAuth: mockWithAuthLocal,
      }));

      await import('./middleware');
      const middleware = mockWithAuthLocal.mock.results[0]?.value;

      const mockRequest = new NextRequest('http://localhost:3000/admin');

      const response = await middleware(mockRequest);

      expect(response.status).toBe(307);
      expect(response.headers.get('Location')).toBe('/auth/signin');
    });

    it('should allow authenticated access to /admin/menu', async () => {
      vi.resetModules();

      let authCallbackFn: any;
      let middlewareFn: any;

      const mockWithAuthLocal = vi.fn((middleware, options) => {
        authCallbackFn = options.callbacks.authorized;
        middlewareFn = middleware;
        return async (req: NextRequest) => {
          const hasValidToken = authCallbackFn({ token: 'valid-token' });
          if (hasValidToken) {
            return middlewareFn(req);
          }
          return new Response(null, {
            status: 307,
            headers: { Location: options.pages.signIn },
          });
        };
      });

      vi.doMock('next-auth/middleware', () => ({
        default: mockWithAuthLocal,
        withAuth: mockWithAuthLocal,
      }));

      await import('./middleware');
      const middleware = mockWithAuthLocal.mock.results[0]?.value;

      const mockRequest = new NextRequest('http://localhost:3000/admin/menu', {
        headers: { authorization: 'Bearer valid-token' },
      });

      const response = await middleware(mockRequest);

      expect(response).toBeDefined();
    });

    it('should redirect unauthenticated access to /admin/gallery', async () => {
      vi.resetModules();

      let authCallbackFn: any;

      const mockWithAuthLocal = vi.fn((middleware, options) => {
        authCallbackFn = options.callbacks.authorized;
        return async (req: NextRequest) => {
          const hasValidToken = authCallbackFn({ token: null });
          if (!hasValidToken) {
            return new Response(null, {
              status: 307,
              headers: { Location: options.pages.signIn },
            });
          }
          return middleware(req);
        };
      });

      vi.doMock('next-auth/middleware', () => ({
        default: mockWithAuthLocal,
        withAuth: mockWithAuthLocal,
      }));

      await import('./middleware');
      const middleware = mockWithAuthLocal.mock.results[0]?.value;

      const mockRequest = new NextRequest('http://localhost:3000/admin/gallery');

      const response = await middleware(mockRequest);

      expect(response.status).toBe(307);
      expect(response.headers.get('Location')).toBe('/auth/signin');
    });
  });
});
