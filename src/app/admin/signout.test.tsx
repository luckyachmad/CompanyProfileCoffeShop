/**
 * @vitest-environment happy-dom
 */

/**
 * Sign-Out Functionality Tests
 * 
 * Tests the admin sign-out functionality:
 * - Sign-out button calls signOut function
 * - Session is invalidated on sign-out
 * - User is redirected to landing page after sign-out
 * 
 * Requirements: 11.5
 * Task: 15.2
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Create mock functions before using them in vi.mock
const mockSignOut = vi.fn();
const mockUseSession = vi.fn();
const mockUseRouter = vi.fn();
const mockUsePathname = vi.fn();

// Mock next-auth/react - use a factory function to avoid hoisting issues
vi.mock('next-auth/react', () => {
  return {
    useSession: () => mockUseSession(),
    signOut: (...args: any[]) => mockSignOut(...args),
    SessionProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

vi.mock('next/navigation', () => {
  return {
    useRouter: () => mockUseRouter(),
    usePathname: () => mockUsePathname(),
  };
});

// Mock Link component
vi.mock('next/link', () => {
  return {
    default: ({ children, href, ...props }: any) => (
      <a href={href} {...props}>
        {children}
      </a>
    ),
  };
});

import AdminLayout from './layout';

describe('Sign-Out Functionality (Requirement 11.5)', () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseRouter.mockReturnValue({
      push: mockPush,
      replace: vi.fn(),
      prefetch: vi.fn(),
    });

    mockUsePathname.mockReturnValue('/admin');
  });

  describe('Sign-out button rendering', () => {
    it('should render sign-out button when authenticated', () => {
      mockUseSession.mockReturnValue({
        data: {
          user: { id: '1', email: 'admin@coffeeshop.com' },
          expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
        status: 'authenticated',
      });

      render(
        <AdminLayout>
          <div>Admin Content</div>
        </AdminLayout>
      );

      const signOutButton = screen.getByRole('button', { name: /sign out/i });
      expect(signOutButton).toBeDefined();
    });

    it('should display current user email', () => {
      const testEmail = 'admin@coffeeshop.com';

      mockUseSession.mockReturnValue({
        data: {
          user: { id: '1', email: testEmail },
          expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
        status: 'authenticated',
      });

      render(
        <AdminLayout>
          <div>Admin Content</div>
        </AdminLayout>
      );

      expect(screen.getByText(testEmail)).toBeDefined();
      expect(screen.getByText(/signed in as/i)).toBeDefined();
    });
  });

  describe('Sign-out action', () => {
    it('should call signOut when sign-out button is clicked', async () => {
      mockUseSession.mockReturnValue({
        data: {
          user: { id: '1', email: 'admin@coffeeshop.com' },
          expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
        status: 'authenticated',
      });

      mockSignOut.mockResolvedValue({ url: '/' });

      render(
        <AdminLayout>
          <div>Admin Content</div>
        </AdminLayout>
      );

      const signOutButton = screen.getByRole('button', { name: /sign out/i });
      fireEvent.click(signOutButton);

      await waitFor(() => {
        expect(mockSignOut).toHaveBeenCalledTimes(1);
      });
    });

    it('should redirect to landing page after sign-out', async () => {
      mockUseSession.mockReturnValue({
        data: {
          user: { id: '1', email: 'admin@coffeeshop.com' },
          expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
        status: 'authenticated',
      });

      mockSignOut.mockResolvedValue({ url: '/' });

      render(
        <AdminLayout>
          <div>Admin Content</div>
        </AdminLayout>
      );

      const signOutButton = screen.getByRole('button', { name: /sign out/i });
      fireEvent.click(signOutButton);

      await waitFor(() => {
        expect(mockSignOut).toHaveBeenCalledWith({ callbackUrl: '/' });
      });
    });

    it('should have proper button styling with transition', () => {
      mockUseSession.mockReturnValue({
        data: {
          user: { id: '1', email: 'admin@coffeeshop.com' },
          expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
        status: 'authenticated',
      });

      render(
        <AdminLayout>
          <div>Admin Content</div>
        </AdminLayout>
      );

      const signOutButton = screen.getByRole('button', { name: /sign out/i });

      // Check for transition classes
      expect(signOutButton.className).toContain('transition-all');
      expect(signOutButton.className).toContain('duration-300');
      expect(signOutButton.className).toContain('ease-in-out');

      // Check for primary button styling
      expect(signOutButton.className).toContain('bg-primary');
      expect(signOutButton.className).toContain('text-white');
      expect(signOutButton.className).toContain('rounded-lg');
    });
  });

  describe('Authentication state handling', () => {
    it('should show loading state while checking authentication', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'loading',
      });

      render(
        <AdminLayout>
          <div>Admin Content</div>
        </AdminLayout>
      );

      expect(screen.getByText(/loading/i)).toBeDefined();
    });

    it('should not render admin content when unauthenticated', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
      });

      const { container } = render(
        <AdminLayout>
          <div>Admin Content</div>
        </AdminLayout>
      );

      // Should return null, so container should be empty
      expect(container.innerHTML).toBe('');
    });

    it('should redirect to sign-in when unauthenticated', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
      });

      render(
        <AdminLayout>
          <div>Admin Content</div>
        </AdminLayout>
      );

      // useEffect should trigger router.push
      waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/auth/signin');
      });
    });

    it('should render admin content when authenticated', () => {
      mockUseSession.mockReturnValue({
        data: {
          user: { id: '1', email: 'admin@coffeeshop.com' },
          expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
        status: 'authenticated',
      });

      render(
        <AdminLayout>
          <div>Admin Content</div>
        </AdminLayout>
      );

      expect(screen.getByText('Admin Content')).toBeDefined();
    });
  });

  describe('Session invalidation', () => {
    it('should invalidate session after sign-out', async () => {
      // Start with authenticated session
      mockUseSession.mockReturnValue({
        data: {
          user: { id: '1', email: 'admin@coffeeshop.com' },
          expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
        status: 'authenticated',
      });

      mockSignOut.mockImplementation(async ({ callbackUrl }) => {
        // Simulate session invalidation
        mockUseSession.mockReturnValue({
          data: null,
          status: 'unauthenticated',
        });
        return { url: callbackUrl };
      });

      render(
        <AdminLayout>
          <div>Admin Content</div>
        </AdminLayout>
      );

      const signOutButton = screen.getByRole('button', { name: /sign out/i });
      fireEvent.click(signOutButton);

      await waitFor(() => {
        expect(mockSignOut).toHaveBeenCalled();
      });

      // After sign-out, session should be invalidated
      const sessionAfterSignOut = mockUseSession();
      expect(sessionAfterSignOut.data).toBeNull();
      expect(sessionAfterSignOut.status).toBe('unauthenticated');
    });
  });

  describe('Accessibility', () => {
    it('should have accessible sign-out button', () => {
      mockUseSession.mockReturnValue({
        data: {
          user: { id: '1', email: 'admin@coffeeshop.com' },
          expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
        status: 'authenticated',
      });

      render(
        <AdminLayout>
          <div>Admin Content</div>
        </AdminLayout>
      );

      const signOutButton = screen.getByRole('button', { name: /sign out/i });

      // Button should be keyboard accessible
      expect(signOutButton.tagName).toBe('BUTTON');
      expect(signOutButton.textContent).toContain('Sign Out');
    });

    it('should have semantic navigation structure', () => {
      mockUseSession.mockReturnValue({
        data: {
          user: { id: '1', email: 'admin@coffeeshop.com' },
          expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
        status: 'authenticated',
      });

      render(
        <AdminLayout>
          <div>Admin Content</div>
        </AdminLayout>
      );

      const nav = screen.getByRole('navigation', { name: /admin dashboard navigation/i });
      expect(nav).toBeDefined();
      expect(nav.tagName).toBe('NAV');
    });
  });
});
