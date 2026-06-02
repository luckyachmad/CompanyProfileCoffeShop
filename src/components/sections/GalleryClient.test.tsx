/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import GalleryClient from './GalleryClient';
import type { GalleryPhoto } from '@/types/gallery';

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt} src={props.src} />;
  }
}));

// Mock Framer Motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, ...props }: any) => (
      <div className={className} {...props}>
        {children}
      </div>
    )
  }
}));

// Mock Lightbox component
vi.mock('@/components/ui/Lightbox', () => ({
  default: ({ isOpen, imageUrl, altText, onClose }: any) => {
    if (!isOpen) return null;
    return (
      <div data-testid="lightbox">
        <img src={imageUrl} alt={altText} />
        <button onClick={onClose} data-testid="lightbox-close">
          Close
        </button>
      </div>
    );
  }
}));

const mockPhotos: GalleryPhoto[] = [
  {
    id: 1,
    image_url: 'https://example.com/photo1.webp',
    alt_text: 'Coffee shop interior',
    sort_order: 0,
    created_at: new Date('2024-01-01')
  },
  {
    id: 2,
    image_url: 'https://example.com/photo2.webp',
    alt_text: 'Latte art',
    sort_order: 1,
    created_at: new Date('2024-01-02')
  },
  {
    id: 3,
    image_url: 'https://example.com/photo3.webp',
    alt_text: null,
    sort_order: 2,
    created_at: new Date('2024-01-03')
  }
];

describe('GalleryClient Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all gallery photos', () => {
    render(<GalleryClient photos={mockPhotos} />);

    mockPhotos.forEach((photo) => {
      const images = screen.getAllByAltText(
        photo.alt_text || 'Gallery photo'
      );
      expect(images.length).toBeGreaterThan(0);
    });
  });

  it('should render photos in a responsive grid', () => {
    const { container } = render(<GalleryClient photos={mockPhotos} />);

    const grid = container.querySelector('.grid');
    expect(grid?.className).toContain('grid-cols-1');
    expect(grid?.className).toContain('md:grid-cols-2');
    expect(grid?.className).toContain('lg:grid-cols-3');
    expect(grid?.className).toContain('xl:grid-cols-4');
  });

  it('should use alt_text for image alt attribute', () => {
    render(<GalleryClient photos={mockPhotos} />);

    const photo1 = screen.getAllByAltText('Coffee shop interior')[0];
    expect(photo1).toBeDefined();

    const photo2 = screen.getAllByAltText('Latte art')[0];
    expect(photo2).toBeDefined();
  });

  it('should use fallback alt text when alt_text is null', () => {
    render(<GalleryClient photos={mockPhotos} />);

    const fallbackImages = screen.getAllByAltText('Gallery photo');
    expect(fallbackImages.length).toBeGreaterThan(0);
  });

  it('should render images with object-cover class', () => {
    const { container } = render(<GalleryClient photos={mockPhotos} />);

    const images = container.querySelectorAll('img');
    images.forEach((img) => {
      expect(img.className).toContain('object-cover');
    });
  });

  it('should open Lightbox when photo is clicked', async () => {
    render(<GalleryClient photos={mockPhotos} />);

    const photoButtons = screen.getAllByRole('button', {
      name: /View full size/i
    });
    
    fireEvent.click(photoButtons[0]);

    await waitFor(() => {
      expect(screen.getByTestId('lightbox')).toBeDefined();
    });
  });

  it('should display selected photo in Lightbox', async () => {
    render(<GalleryClient photos={mockPhotos} />);

    const photoButtons = screen.getAllByRole('button', {
      name: /View full size/i
    });
    
    fireEvent.click(photoButtons[0]);

    await waitFor(() => {
      const lightboxImage = screen.getByTestId('lightbox').querySelector('img');
      expect(lightboxImage?.getAttribute('src')).toBe(mockPhotos[0].image_url);
      expect(lightboxImage?.getAttribute('alt')).toBe(mockPhotos[0].alt_text);
    });
  });

  it('should close Lightbox when close button is clicked', async () => {
    render(<GalleryClient photos={mockPhotos} />);

    const photoButtons = screen.getAllByRole('button', {
      name: /View full size/i
    });
    
    fireEvent.click(photoButtons[0]);

    await waitFor(() => {
      expect(screen.getByTestId('lightbox')).toBeDefined();
    });

    const closeButton = screen.getByTestId('lightbox-close');
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByTestId('lightbox')).toBeNull();
    });
  });

  it('should have hover effects on photo cards', () => {
    const { container } = render(<GalleryClient photos={mockPhotos} />);

    const photoButtons = container.querySelectorAll('button[aria-label*="View full size"]');
    
    photoButtons.forEach((button) => {
      expect(button.className).toContain('hover:shadow-md');
      expect(button.className).toContain('hover:scale-[1.02]');
      expect(button.className).toContain('transition-all');
      expect(button.className).toContain('duration-300');
    });
  });

  it('should render magnifying glass icon on hover overlay', () => {
    const { container } = render(<GalleryClient photos={mockPhotos} />);

    const svgIcons = container.querySelectorAll('svg');
    // Each photo should have a magnifying glass icon
    expect(svgIcons.length).toBeGreaterThanOrEqual(mockPhotos.length);
  });

  it('should apply aspect-square to photo containers', () => {
    const { container } = render(<GalleryClient photos={mockPhotos} />);

    const photoButtons = container.querySelectorAll('button[aria-label*="View full size"]');
    
    photoButtons.forEach((button) => {
      expect(button.className).toContain('aspect-square');
    });
  });

  it('should have accessible aria-labels for photo buttons', () => {
    render(<GalleryClient photos={mockPhotos} />);

    const button1 = screen.getByRole('button', {
      name: 'View full size: Coffee shop interior'
    });
    expect(button1).toBeDefined();

    const button2 = screen.getByRole('button', {
      name: 'View full size: Latte art'
    });
    expect(button2).toBeDefined();
  });

  it('should render rounded corners on photo cards', () => {
    const { container } = render(<GalleryClient photos={mockPhotos} />);

    const photoButtons = container.querySelectorAll('button[aria-label*="View full size"]');
    
    photoButtons.forEach((button) => {
      expect(button.className).toContain('rounded-lg');
    });
  });

  it('should handle empty photos array gracefully', () => {
    const { container } = render(<GalleryClient photos={[]} />);

    const grid = container.querySelector('.grid');
    expect(grid).toBeDefined();
    
    const photoButtons = screen.queryAllByRole('button', {
      name: /View full size/i
    });
    expect(photoButtons.length).toBe(0);
  });

  it('should support multiple photo selections', async () => {
    render(<GalleryClient photos={mockPhotos} />);

    const photoButtons = screen.getAllByRole('button', {
      name: /View full size/i
    });
    
    // Open first photo
    fireEvent.click(photoButtons[0]);
    await waitFor(() => {
      const lightboxImage = screen.getByTestId('lightbox').querySelector('img');
      expect(lightboxImage?.getAttribute('src')).toBe(mockPhotos[0].image_url);
    });

    // Close lightbox
    const closeButton = screen.getByTestId('lightbox-close');
    fireEvent.click(closeButton);
    await waitFor(() => {
      expect(screen.queryByTestId('lightbox')).toBeNull();
    });

    // Open second photo
    fireEvent.click(photoButtons[1]);
    await waitFor(() => {
      const lightboxImage = screen.getByTestId('lightbox').querySelector('img');
      expect(lightboxImage?.getAttribute('src')).toBe(mockPhotos[1].image_url);
    });
  });
});
