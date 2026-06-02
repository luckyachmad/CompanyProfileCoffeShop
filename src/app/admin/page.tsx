'use client';

import useSWR from 'swr';
import Link from 'next/link';

/**
 * Admin Dashboard Home Page
 * 
 * Displays dashboard overview with real-time statistics:
 * - Total menu items count
 * - Total gallery photos count
 * - Total categories count
 * 
 * Includes quick action links to Menu Management and Gallery Management
 * Uses semantic HTML structure for accessibility
 * 
 * Requirements: 10.1, 16.3
 * Design: Uses SWR for data fetching with loading and error states
 */

// SWR fetcher function
const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface MenuItem {
  id: number;
  title: string;
}

interface GalleryPhoto {
  id: number;
  image_url: string;
}

interface Category {
  id: number;
  name: string;
}

export default function AdminDashboard() {
  // Fetch data from API endpoints using SWR
  const { data: menuItems, error: menuError, isLoading: menuLoading } = useSWR<MenuItem[]>('/api/menu', fetcher);
  const { data: galleryPhotos, error: galleryError, isLoading: galleryLoading } = useSWR<GalleryPhoto[]>('/api/gallery', fetcher);
  const { data: categories, error: categoriesError, isLoading: categoriesLoading } = useSWR<Category[]>('/api/categories', fetcher);

  // Calculate counts
  const menuCount = menuItems?.length ?? 0;
  const galleryCount = galleryPhotos?.length ?? 0;
  const categoriesCount = categories?.length ?? 0;

  // Check if any data is loading
  const isLoading = menuLoading || galleryLoading || categoriesLoading;

  // Check if there are any errors
  const hasError = menuError || galleryError || categoriesError;

  return (
    <>
      <header>
        <h1 className="text-3xl font-heading font-bold text-text-primary mb-6">
          Dashboard
        </h1>
      </header>

      {/* Error State */}
      {hasError && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4" role="alert">
          <p className="text-sm font-body text-red-800">
            Error loading dashboard data. Please refresh the page or try again later.
          </p>
        </div>
      )}

      {/* Statistics Cards */}
      <section aria-labelledby="statistics-heading">
        <h2 id="statistics-heading" className="sr-only">Dashboard Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Menu Items Card */}
          <article className="bg-surface rounded-2xl shadow-sm border border-border p-6 transition-all duration-300 ease-in-out hover:shadow-md">
            <h3 className="text-lg font-heading font-semibold text-primary mb-2">
              Menu Items
            </h3>
            {menuLoading ? (
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                <span className="text-sm font-body text-text-muted">Loading...</span>
              </div>
            ) : menuError ? (
              <p className="text-2xl font-body font-bold text-red-600">Error</p>
            ) : (
              <p className="text-3xl font-body font-bold text-text-primary">{menuCount}</p>
            )}
            <p className="text-sm font-body text-text-muted mt-1">
              Total items in menu
            </p>
          </article>

          {/* Gallery Photos Card */}
          <article className="bg-surface rounded-2xl shadow-sm border border-border p-6 transition-all duration-300 ease-in-out hover:shadow-md">
            <h3 className="text-lg font-heading font-semibold text-primary mb-2">
              Gallery Photos
            </h3>
            {galleryLoading ? (
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                <span className="text-sm font-body text-text-muted">Loading...</span>
              </div>
            ) : galleryError ? (
              <p className="text-2xl font-body font-bold text-red-600">Error</p>
            ) : (
              <p className="text-3xl font-body font-bold text-text-primary">{galleryCount}</p>
            )}
            <p className="text-sm font-body text-text-muted mt-1">
              Total photos uploaded
            </p>
          </article>

          {/* Categories Card */}
          <article className="bg-surface rounded-2xl shadow-sm border border-border p-6 transition-all duration-300 ease-in-out hover:shadow-md">
            <h3 className="text-lg font-heading font-semibold text-primary mb-2">
              Categories
            </h3>
            {categoriesLoading ? (
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                <span className="text-sm font-body text-text-muted">Loading...</span>
              </div>
            ) : categoriesError ? (
              <p className="text-2xl font-body font-bold text-red-600">Error</p>
            ) : (
              <p className="text-3xl font-body font-bold text-text-primary">{categoriesCount}</p>
            )}
            <p className="text-sm font-body text-text-muted mt-1">
              Active menu categories
            </p>
          </article>
        </div>
      </section>

      {/* Quick Actions Section */}
      <section className="mt-8 bg-surface rounded-2xl shadow-sm border border-border p-6" aria-labelledby="quick-actions-heading">
        <h2 id="quick-actions-heading" className="text-xl font-heading font-semibold text-primary mb-4">
          Quick Actions
        </h2>
        <nav className="flex flex-wrap gap-4" aria-label="Quick action links">
          <Link
            href="/admin/menu"
            className="bg-primary text-white px-6 py-3 rounded-lg font-body font-medium transition-all duration-300 ease-in-out hover:bg-primary-hover hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
          >
            Manage Menu
          </Link>
          <Link
            href="/admin/gallery"
            className="bg-primary text-white px-6 py-3 rounded-lg font-body font-medium transition-all duration-300 ease-in-out hover:bg-primary-hover hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
          >
            Manage Gallery
          </Link>
        </nav>
      </section>
    </>
  );
}
