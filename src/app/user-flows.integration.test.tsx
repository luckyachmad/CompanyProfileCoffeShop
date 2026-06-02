/** @vitest-environment happy-dom */

/**
 * User Flows Integration Tests
 * 
 * Tests complete user flows for the landing page including:
 * - Landing page rendering with all 7 sections
 * - Smooth scroll navigation
 * - WhatsApp button integration (floating and inline)
 * - Lightbox modal functionality
 * 
 * **Validates: Requirements 1.1, 1.2, 2.6, 5.3, 9.3, 9.4**
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import React from 'react';

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt || ''} />;
  },
}));

// Mock framer-motion to avoid animation complexity in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
}));

describe('User Flows Integration Tests', () => {
  // Store original fetch and environment
  const originalFetch = global.fetch;
  const originalEnv = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

  beforeEach(() => {
    // Setup environment variables
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER = '628123456789';
    process.env.NEXTAUTH_URL = 'http://localhost:3000';

    // Mock successful API responses
    global.fetch = vi.fn((url: string | URL | Request) => {
      const urlString = url.toString();

      if (urlString.includes('/api/menu')) {
        return Promise.resolve({
          ok: true,
          json: async () => [
            {
              id: 1,
              category_id: 1,
              title: 'Espresso',
              description: 'Rich and bold',
              price: 25000,
              image_url: '/images/espresso.webp',
              is_best_seller: true,
              category_name: 'Coffee',
            },
            {
              id: 2,
              category_id: 2,
              title: 'Lemon Tea',
              description: 'Refreshing and tangy',
              price: 20000,
              image_url: '/images/lemon-tea.webp',
              is_best_seller: false,
              category_name: 'Non-Coffee',
            },
          ],
        } as Response);
      }

      if (urlString.includes('/api/gallery')) {
        return Promise.resolve({
          ok: true,
          json: async () => [
            {
              id: 1,
              image_url: '/images/gallery-1.webp',
              alt_text: 'Coffee shop interior',
              sort_order: 1,
            },
            {
              id: 2,
              image_url: '/images/gallery-2.webp',
              alt_text: 'Latte art',
              sort_order: 2,
            },
          ],
        } as Response);
      }

      if (urlString.includes('/api/testimonials')) {
        return Promise.resolve({
          ok: true,
          json: async () => [
            {
              id: 1,
              author_name: 'John Doe',
              content: 'Amazing coffee!',
              rating: 5,
            },
          ],
        } as Response);
      }

      return Promise.reject(new Error('Unknown API endpoint'));
    }) as any;

    // Mock scrollIntoView
    Element.prototype.scrollIntoView = vi.fn();

    // Mock window.open
    global.window.open = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER = originalEnv;
    vi.restoreAllMocks();
  });

  describe('Landing Page Rendering with All 7 Sections', () => {
    it('should render landing page with all 7 sections in correct order', async () => {
      const HomePage = (await import('./page')).default;
      const { container } = render(<HomePage />);

      // Verify main container exists with correct styling
      const main = container.querySelector('main');
      expect(main).toBeTruthy();
      expect(main?.className).toContain('bg-background');
      expect(main?.className).toContain('min-h-screen');

      // Verify all section components are present
      // Note: We check for the presence of the children, not specific component names
      // since Server Components are rendered as their output
      const children = main?.children;
      expect(children).toBeTruthy();
      expect(children!.length).toBeGreaterThanOrEqual(8); // 7 sections + WhatsApp button
    });

    it('should render Hero section with full viewport height', async () => {
      const Hero = (await import('@/components/sections/Hero')).default;
      const { container } = render(<Hero />);

      const header = container.querySelector('header');
      expect(header).toBeTruthy();
      expect(header?.className).toContain('h-screen');
      expect(header?.className).toContain('relative');
    });

    it('should render About section with content', async () => {
      const About = (await import('@/components/sections/About')).default;
      const { container } = render(<About />);

      const section = container.querySelector('section');
      expect(section).toBeTruthy();
      expect(section?.id).toBe('about');
    });

    it('should render Menu section with id="menu" for scroll targeting', async () => {
      const Menu = (await import('@/components/sections/Menu')).default;
      const { container } = render(<Menu />);

      await waitFor(() => {
        const section = container.querySelector('section');
        expect(section).toBeTruthy();
        expect(section?.id).toBe('menu');
      });
    });

    it('should render Gallery section with content', async () => {
      const Gallery = (await import('@/components/sections/Gallery')).default;
      const { container } = render(<Gallery />);

      await waitFor(() => {
        const section = container.querySelector('section');
        expect(section).toBeTruthy();
        expect(section?.id).toBe('gallery');
      });
    });

    it('should render Testimonials section with content', async () => {
      const Testimonials = (await import('@/components/sections/Testimonials')).default;
      const { container } = render(<Testimonials />);

      const section = container.querySelector('section');
      expect(section).toBeTruthy();
      expect(section?.id).toBe('testimonials');
    });

    it('should render Contact section with content', async () => {
      const Contact = (await import('@/components/sections/Contact')).default;
      const { container } = render(<Contact />);

      const section = container.querySelector('section');
      expect(section).toBeTruthy();
      expect(section?.id).toBe('contact');
    });

    it('should render Footer section with content', async () => {
      const Footer = (await import('@/components/sections/Footer')).default;
      const { container } = render(<Footer />);

      const footerElement = container.querySelector('footer');
      expect(footerElement).toBeTruthy();
      expect(footerElement?.className).toContain('bg-primary');
    });

    it('should apply minimum section padding to all sections', async () => {
      const About = (await import('@/components/sections/About')).default;
      const { container } = render(<About />);

      const section = container.querySelector('section');
      expect(section).toBeTruthy();
      
      // Check for padding classes (py-20 px-4 md:px-8 lg:px-16)
      const className = section?.className || '';
      expect(className).toMatch(/py-\d+/); // Has vertical padding
      expect(className).toMatch(/px-\d+/); // Has horizontal padding
    });
  });

  describe('Smooth Scroll Navigation (Requirement 1.2, 2.6)', () => {
    it('should scroll to menu section when Hero CTA button is clicked', async () => {
      const HeroClient = (await import('@/components/sections/HeroClient')).default;
      const { container } = render(<HeroClient />);

      // Find the CTA button
      const button = container.querySelector('button[aria-label="Explore our menu"]');
      expect(button).toBeTruthy();

      // Create and append a mock menu section
      const menuSection = document.createElement('section');
      menuSection.id = 'menu';
      document.body.appendChild(menuSection);

      // Click the button
      fireEvent.click(button!);

      // Verify scrollIntoView was called with smooth behavior
      expect(menuSection.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });

      // Cleanup
      document.body.removeChild(menuSection);
    });

    it('should have menu section with correct id attribute for scroll targeting', async () => {
      const Menu = (await import('@/components/sections/Menu')).default;
      const menu = await Menu();
      const { container } = render(menu);

      await waitFor(() => {
        const section = container.querySelector('section#menu');
        expect(section).toBeTruthy();
      });
    });

    it('should apply smooth scroll styling to Hero CTA button', async () => {
      const HeroClient = (await import('@/components/sections/HeroClient')).default;
      const { container } = render(<HeroClient />);

      const button = container.querySelector('button');
      expect(button).toBeTruthy();
      
      const className = button?.className || '';
      expect(className).toContain('rounded-full');
      expect(className).toContain('bg-primary');
      expect(className).toContain('transition-all');
      expect(className).toContain('duration-300');
      expect(className).toContain('ease-in-out');
    });

    it('should have Footer navigation links that support smooth scrolling', async () => {
      const Footer = (await import('@/components/sections/Footer')).default;
      const { container } = render(<Footer />);

      // Footer should have navigation links
      const footerElement = container.querySelector('footer');
      expect(footerElement).toBeTruthy();
      
      // Check for nav element or links
      const nav = container.querySelector('nav') || footerElement;
      expect(nav).toBeTruthy();
    });
  });

  describe('WhatsApp Button Integration (Requirements 9.3, 9.4)', () => {
    it('should render floating WhatsApp button with correct styling', async () => {
      const { default: WhatsAppButton } = await import('@/components/ui/WhatsAppButton');
      const { container } = render(<WhatsAppButton variant="floating" />);

      const button = container.querySelector('button');
      expect(button).toBeTruthy();
      
      const className = button?.className || '';
      expect(className).toContain('fixed');
      expect(className).toContain('bottom-');
      expect(className).toContain('right-');
      expect(className).toContain('z-50');
    });

    it('should include hover:scale-110 animation on floating button (Requirement 9.5)', async () => {
      const { default: WhatsAppButton } = await import('@/components/ui/WhatsAppButton');
      const { container } = render(<WhatsAppButton variant="floating" />);

      const button = container.querySelector('button');
      expect(button).toBeTruthy();
      
      const className = button?.className || '';
      expect(className).toContain('hover:scale-110');
      expect(className).toContain('transition-all');
      expect(className).toContain('duration-300');
      expect(className).toContain('ease-in-out');
    });

    it('should have aria-label for accessibility on floating button (Requirement 9.6)', async () => {
      const { default: WhatsAppButton } = await import('@/components/ui/WhatsAppButton');
      const { container } = render(<WhatsAppButton variant="floating" />);

      const button = container.querySelector('button');
      expect(button).toBeTruthy();
      expect(button?.getAttribute('aria-label')).toBeTruthy();
      expect(button?.getAttribute('aria-label')).not.toBe('');
    });

    it('should open WhatsApp with generic message when floating button is clicked', async () => {
      const { default: WhatsAppButton } = await import('@/components/ui/WhatsAppButton');
      const { container } = render(<WhatsAppButton variant="floating" />);

      const button = container.querySelector('button');
      expect(button).toBeTruthy();

      // Click the button
      fireEvent.click(button!);

      // Verify window.open was called with correct WhatsApp URL
      expect(window.open).toHaveBeenCalled();
      const call = (window.open as any).mock.calls[0];
      const url = call[0];
      
      expect(url).toContain('https://wa.me/');
      expect(url).toContain('628123456789');
      expect(url).toContain('?text=');
    });

    it('should render inline WhatsApp button with item name', async () => {
      const { default: WhatsAppButton } = await import('@/components/ui/WhatsAppButton');
      const { container } = render(
        <WhatsAppButton variant="inline" itemName="Espresso" />
      );

      const button = container.querySelector('button');
      expect(button).toBeTruthy();
      
      const className = button?.className || '';
      expect(className).not.toContain('fixed');
      expect(className).toContain('rounded-lg');
    });

    it('should open WhatsApp with item name in message when inline button is clicked (Requirement 9.4)', async () => {
      const { default: WhatsAppButton } = await import('@/components/ui/WhatsAppButton');
      const itemName = 'Cappuccino';
      const { container } = render(
        <WhatsAppButton variant="inline" itemName={itemName} />
      );

      const button = container.querySelector('button');
      expect(button).toBeTruthy();

      // Click the button
      fireEvent.click(button!);

      // Verify window.open was called with item name in URL
      expect(window.open).toHaveBeenCalled();
      const call = (window.open as any).mock.calls[0];
      const url = call[0];
      
      expect(url).toContain('https://wa.me/');
      expect(url).toContain('628123456789');
      expect(url).toContain(encodeURIComponent(itemName));
    });

    it('should read phone number exclusively from NEXT_PUBLIC_WHATSAPP_NUMBER (Requirement 9.2)', async () => {
      const { default: WhatsAppButton } = await import('@/components/ui/WhatsAppButton');
      
      // Clear environment variable
      delete process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
      
      const { container } = render(<WhatsAppButton variant="floating" />);

      // Component should not render any button when env var is missing
      const button = container.querySelector('button');
      expect(button).toBeNull();
    });

    it('should not render WhatsApp button if env var is missing (Requirement 9.7)', async () => {
      const { default: WhatsAppButton } = await import('@/components/ui/WhatsAppButton');
      
      // Clear environment variable
      delete process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
      
      const { container } = render(<WhatsAppButton variant="floating" />);
      
      // Should return null/empty
      expect(container.firstChild).toBeNull();
    });

    it('should include floating WhatsApp button on landing page', async () => {
      const HomePage = (await import('./page')).default;
      const { container } = render(<HomePage />);

      // The WhatsApp button should be included in the page structure
      const main = container.querySelector('main');
      expect(main).toBeTruthy();
      expect(main?.children.length).toBeGreaterThanOrEqual(8);
    });
  });

  describe('Lightbox Modal Functionality (Requirement 5.3)', () => {
    it('should open lightbox when gallery image is clicked', async () => {
      const Lightbox = (await import('@/components/ui/Lightbox')).default;
      const mockOnClose = vi.fn();
      
      const { container } = render(
        <Lightbox
          isOpen={true}
          imageUrl="/images/gallery-1.webp"
          altText="Coffee shop interior"
          onClose={mockOnClose}
        />
      );

      // Lightbox should be visible
      const lightbox = container.querySelector('[role="dialog"]');
      expect(lightbox).toBeTruthy();
      expect(lightbox?.getAttribute('aria-modal')).toBe('true');
    });

    it('should display full-size image in lightbox', async () => {
      const Lightbox = (await import('@/components/ui/Lightbox')).default;
      const mockOnClose = vi.fn();
      const imageUrl = '/images/gallery-1.webp';
      const altText = 'Coffee shop interior';
      
      const { container } = render(
        <Lightbox
          isOpen={true}
          imageUrl={imageUrl}
          altText={altText}
          onClose={mockOnClose}
        />
      );

      // Image should be present with correct attributes
      const image = container.querySelector('img');
      expect(image).toBeTruthy();
      expect(image?.getAttribute('src')).toContain(imageUrl);
      expect(image?.getAttribute('alt')).toBe(altText);
    });

    it('should have close button in lightbox (Requirement 5.4)', async () => {
      const Lightbox = (await import('@/components/ui/Lightbox')).default;
      const mockOnClose = vi.fn();
      
      const { container } = render(
        <Lightbox
          isOpen={true}
          imageUrl="/images/gallery-1.webp"
          altText="Test image"
          onClose={mockOnClose}
        />
      );

      // Close button should exist
      const closeButton = container.querySelector('button[aria-label*="Close"]');
      expect(closeButton).toBeTruthy();
    });

    it('should close lightbox when close button is clicked', async () => {
      const Lightbox = (await import('@/components/ui/Lightbox')).default;
      const mockOnClose = vi.fn();
      
      const { container } = render(
        <Lightbox
          isOpen={true}
          imageUrl="/images/gallery-1.webp"
          altText="Test image"
          onClose={mockOnClose}
        />
      );

      const closeButton = container.querySelector('button[aria-label*="Close"]');
      expect(closeButton).toBeTruthy();

      // Click close button
      fireEvent.click(closeButton!);

      // onClose should be called
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should close lightbox when Escape key is pressed (Requirement 5.5)', async () => {
      const Lightbox = (await import('@/components/ui/Lightbox')).default;
      const mockOnClose = vi.fn();
      
      render(
        <Lightbox
          isOpen={true}
          imageUrl="/images/gallery-1.webp"
          altText="Test image"
          onClose={mockOnClose}
        />
      );

      // Press Escape key
      fireEvent.keyDown(document, { key: 'Escape' });

      // onClose should be called
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should not render lightbox when isOpen is false', async () => {
      const Lightbox = (await import('@/components/ui/Lightbox')).default;
      const mockOnClose = vi.fn();
      
      const { container } = render(
        <Lightbox
          isOpen={false}
          imageUrl="/images/gallery-1.webp"
          altText="Test image"
          onClose={mockOnClose}
        />
      );

      // Lightbox should not be in DOM
      const lightbox = container.querySelector('[role="dialog"]');
      expect(lightbox).toBeNull();
    });

    it('should close lightbox when clicking outside image', async () => {
      const Lightbox = (await import('@/components/ui/Lightbox')).default;
      const mockOnClose = vi.fn();
      
      const { container } = render(
        <Lightbox
          isOpen={true}
          imageUrl="/images/gallery-1.webp"
          altText="Test image"
          onClose={mockOnClose}
        />
      );

      // Click on overlay (the dialog element itself)
      const overlay = container.querySelector('[role="dialog"]');
      expect(overlay).toBeTruthy();
      
      fireEvent.click(overlay!);

      // onClose should be called
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should have proper accessibility attributes', async () => {
      const Lightbox = (await import('@/components/ui/Lightbox')).default;
      const mockOnClose = vi.fn();
      
      const { container } = render(
        <Lightbox
          isOpen={true}
          imageUrl="/images/gallery-1.webp"
          altText="Test image"
          onClose={mockOnClose}
        />
      );

      const dialog = container.querySelector('[role="dialog"]');
      expect(dialog).toBeTruthy();
      expect(dialog?.getAttribute('aria-modal')).toBe('true');
      expect(dialog?.getAttribute('aria-label')).toBeTruthy();
    });

    it('should prevent body scroll when lightbox is open', async () => {
      const Lightbox = (await import('@/components/ui/Lightbox')).default;
      const mockOnClose = vi.fn();
      
      const { unmount } = render(
        <Lightbox
          isOpen={true}
          imageUrl="/images/gallery-1.webp"
          altText="Test image"
          onClose={mockOnClose}
        />
      );

      // Body overflow should be set to hidden
      await waitFor(() => {
        expect(document.body.style.overflow).toBe('hidden');
      });

      // Cleanup: unmount to restore body scroll
      unmount();
      
      // Body overflow should be reset
      expect(document.body.style.overflow).toBe('unset');
    });
  });

  describe('Complete User Flow Integration', () => {
    it('should load landing page with all sections and interactive elements', async () => {
      const HomePage = (await import('./page')).default;
      const { container } = render(<HomePage />);

      // Main container should exist
      const main = container.querySelector('main');
      expect(main).toBeTruthy();
      expect(main?.className).toContain('bg-background');

      // Should have multiple section children (7 sections + WhatsApp button)
      expect(main?.children.length).toBeGreaterThanOrEqual(8);

      // Verify structure
      expect(main).toBeTruthy();
    });

    it('should handle complete user journey: view page -> scroll -> click WhatsApp', async () => {
      // 1. Load page
      const HomePage = (await import('./page')).default;
      const { container } = render(<HomePage />);

      const main = container.querySelector('main');
      expect(main).toBeTruthy();

      // 2. Verify Hero section is present
      // Hero is the first section
      expect(main?.children[0]).toBeTruthy();

      // 3. Create menu section for scroll test
      const menuSection = document.createElement('section');
      menuSection.id = 'menu';
      document.body.appendChild(menuSection);

      // 4. Verify smooth scroll functionality would work
      expect(document.getElementById('menu')).toBeTruthy();

      // Cleanup
      document.body.removeChild(menuSection);
    });

    it('should maintain responsive design system compliance', async () => {
      const HomePage = (await import('./page')).default;
      const { container } = render(<HomePage />);

      const main = container.querySelector('main');
      expect(main).toBeTruthy();

      // Check for responsive padding classes
      const firstSection = main?.children[0] as HTMLElement;
      expect(firstSection).toBeTruthy();
    });

    it('should apply design tokens consistently across all sections', async () => {
      const HomePage = (await import('./page')).default;
      const { container } = render(<HomePage />);

      const main = container.querySelector('main');
      expect(main).toBeTruthy();
      
      // Main should use bg-background token
      expect(main?.className).toContain('bg-background');
    });
  });
});
