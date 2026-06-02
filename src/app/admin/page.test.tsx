/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminDashboard from './page';

// Mock SWR
vi.mock('swr', () => ({
  default: vi.fn(),
}));

// Mock Next.js Link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

import useSWR from 'swr';

describe('AdminDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render dashboard title', () => {
    // Mock SWR to return loading state
    vi.mocked(useSWR).mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
      isValidating: false,
      mutate: vi.fn(),
    } as any);

    render(<AdminDashboard />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('should display loading state for all cards', () => {
    vi.mocked(useSWR).mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
      isValidating: false,
      mutate: vi.fn(),
    } as any);

    render(<AdminDashboard />);

    const loadingElements = screen.getAllByText('Loading...');
    expect(loadingElements.length).toBeGreaterThan(0);
  });

  it('should display menu items count when data is loaded', async () => {
    const mockMenuItems = [
      { id: 1, title: 'Latte' },
      { id: 2, title: 'Cappuccino' },
      { id: 3, title: 'Espresso' },
    ];

    // Mock multiple useSWR calls in sequence
    let callCount = 0;
    vi.mocked(useSWR).mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        // First call: menu items
        return {
          data: mockMenuItems,
          error: undefined,
          isLoading: false,
          isValidating: false,
          mutate: vi.fn(),
        } as any;
      } else if (callCount === 2) {
        // Second call: gallery photos
        return {
          data: [],
          error: undefined,
          isLoading: false,
          isValidating: false,
          mutate: vi.fn(),
        } as any;
      } else {
        // Third call: categories
        return {
          data: [],
          error: undefined,
          isLoading: false,
          isValidating: false,
          mutate: vi.fn(),
        } as any;
      }
    });

    render(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  it('should display gallery photos count when data is loaded', async () => {
    const mockGalleryPhotos = [
      { id: 1, image_url: '/photo1.jpg' },
      { id: 2, image_url: '/photo2.jpg' },
    ];

    let callCount = 0;
    vi.mocked(useSWR).mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        // First call: menu items
        return {
          data: [],
          error: undefined,
          isLoading: false,
          isValidating: false,
          mutate: vi.fn(),
        } as any;
      } else if (callCount === 2) {
        // Second call: gallery photos
        return {
          data: mockGalleryPhotos,
          error: undefined,
          isLoading: false,
          isValidating: false,
          mutate: vi.fn(),
        } as any;
      } else {
        // Third call: categories
        return {
          data: [],
          error: undefined,
          isLoading: false,
          isValidating: false,
          mutate: vi.fn(),
        } as any;
      }
    });

    render(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });

  it('should display categories count when data is loaded', async () => {
    const mockCategories = [
      { id: 1, name: 'Coffee' },
      { id: 2, name: 'Non-Coffee' },
      { id: 3, name: 'Light Bites' },
    ];

    let callCount = 0;
    vi.mocked(useSWR).mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        // First call: menu items
        return {
          data: [],
          error: undefined,
          isLoading: false,
          isValidating: false,
          mutate: vi.fn(),
        } as any;
      } else if (callCount === 2) {
        // Second call: gallery photos
        return {
          data: [],
          error: undefined,
          isLoading: false,
          isValidating: false,
          mutate: vi.fn(),
        } as any;
      } else {
        // Third call: categories
        return {
          data: mockCategories,
          error: undefined,
          isLoading: false,
          isValidating: false,
          mutate: vi.fn(),
        } as any;
      }
    });

    render(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  it('should display error state when API calls fail', async () => {
    vi.mocked(useSWR).mockReturnValue({
      data: undefined,
      error: new Error('API Error'),
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    } as any);

    render(<AdminDashboard />);

    await waitFor(() => {
      expect(
        screen.getByText(/Error loading dashboard data/i)
      ).toBeInTheDocument();
    });
  });

  it('should render quick action links', () => {
    vi.mocked(useSWR).mockReturnValue({
      data: [],
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    } as any);

    render(<AdminDashboard />);

    const menuLink = screen.getByRole('link', { name: /Manage Menu/i });
    const galleryLink = screen.getByRole('link', { name: /Manage Gallery/i });

    expect(menuLink).toBeInTheDocument();
    expect(menuLink).toHaveAttribute('href', '/admin/menu');

    expect(galleryLink).toBeInTheDocument();
    expect(galleryLink).toHaveAttribute('href', '/admin/gallery');
  });

  it('should display zero when no data is available', async () => {
    let callCount = 0;
    vi.mocked(useSWR).mockImplementation(() => {
      callCount++;
      return {
        data: [],
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: vi.fn(),
      } as any;
    });

    render(<AdminDashboard />);

    await waitFor(() => {
      const zeros = screen.getAllByText('0');
      // Should have 3 zeros (one for each stat card)
      expect(zeros.length).toBe(3);
    });
  });

  it('should apply correct styling to stat cards', () => {
    vi.mocked(useSWR).mockReturnValue({
      data: [],
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    } as any);

    render(<AdminDashboard />);

    const menuItemsHeading = screen.getByText('Menu Items');
    const galleryPhotosHeading = screen.getByText('Gallery Photos');
    const categoriesHeading = screen.getByText('Categories');

    // Check that headings exist
    expect(menuItemsHeading).toBeInTheDocument();
    expect(galleryPhotosHeading).toBeInTheDocument();
    expect(categoriesHeading).toBeInTheDocument();

    // Check parent cards have proper classes
    const cards = document.querySelectorAll('.bg-surface.rounded-2xl');
    expect(cards.length).toBeGreaterThan(0);
  });

  it('should render Quick Actions section title', () => {
    vi.mocked(useSWR).mockReturnValue({
      data: [],
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    } as any);

    render(<AdminDashboard />);

    expect(screen.getByText('Quick Actions')).toBeInTheDocument();
  });
});
