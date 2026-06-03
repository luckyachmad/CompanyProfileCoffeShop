'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';

/**
 * Admin Dashboard Layout Component
 * 
 * Client Component that provides:
 * - Authentication guard with session check
 * - Responsive sidebar navigation with semantic <nav> element
 * - Sign-out functionality
 * - Mobile-friendly menu toggle
 * - Semantic HTML structure for accessibility
 * 
 * Requirements: 10.1, 10.9, 16.3
 * 
 * Design tokens: bg-surface (sidebar), bg-background (main), font-heading, font-body
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Authentication guard: The middleware handles redirects, so we only need to prevent rendering
  // if the user is not authenticated. The middleware will handle the actual redirect.
  useEffect(() => {
    // No client-side redirect needed - middleware handles this
    // This effect is kept for potential future use
  }, [status, router]);

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-text-primary font-body">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render admin content if not authenticated
  if (status === 'unauthenticated') {
    return null;
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Navigation items
  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: '📊' },
    { href: '/admin/menu', label: 'Menu Management', icon: '☕' },
    { href: '/admin/gallery', label: 'Gallery Management', icon: '🖼️' },
  ];

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile menu button */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 lg:hidden bg-primary text-white p-3 rounded-lg shadow-md transition-all duration-300 ease-in-out hover:bg-primary-hover"
        aria-label="Toggle menu"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {isSidebarOpen ? (
            <path d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-surface border-r border-border shadow-lg z-40 transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 w-64`}
      >
        {/* Sidebar Header - Coffee Shop Branding */}
        <div className="p-6 border-b border-border">
          <Link href="/" className="flex items-center space-x-2 group">
            <span className="text-3xl transition-transform duration-300 ease-in-out group-hover:scale-110">
              ☕
            </span>
            <div>
              <h1 className="text-xl font-heading font-bold text-primary">
                Coffee Shop
              </h1>
              <p className="text-sm font-body text-text-muted">Admin Dashboard</p>
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-2" aria-label="Admin dashboard navigation">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsSidebarOpen(false)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-body font-medium transition-all duration-300 ease-in-out ${
                isActive(item.href)
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-text-primary hover:bg-background hover:text-primary'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Sidebar Footer - User Info & Sign Out */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-surface">
          <div className="mb-3 px-2">
            <p className="text-sm font-body text-text-muted">Signed in as</p>
            <p className="text-sm font-body font-medium text-text-primary truncate">
              {session?.user?.email}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full bg-primary text-white px-4 py-2 rounded-lg font-body font-medium transition-all duration-300 ease-in-out hover:bg-primary-hover hover:shadow-md active:scale-[0.98]"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Overlay for mobile when sidebar is open */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Main Content Area */}
      <main className="lg:ml-64 min-h-screen p-6 md:p-8 lg:p-12">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
