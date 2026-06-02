'use client';

/**
 * FooterClient - Client Component for Footer navigation and interactions
 * 
 * Handles:
 * - Smooth scroll to page sections on navigation link clicks
 * - Displays logo/brand name, copyright, and quick links
 * 
 * **Validates: Requirements 8.1, 8.2, 8.3, 8.4**
 */

interface FooterClientProps {
  currentYear: number;
}

interface NavLink {
  label: string;
  targetId: string;
}

export default function FooterClient({ currentYear }: FooterClientProps) {
  const navLinks: NavLink[] = [
    { label: 'Home', targetId: 'hero' },
    { label: 'About', targetId: 'about' },
    { label: 'Menu', targetId: 'menu' },
    { label: 'Gallery', targetId: 'gallery' },
    { label: 'Testimonials', targetId: 'testimonials' },
    { label: 'Contact', targetId: 'contact' },
  ];

  const handleScrollToSection = (targetId: string) => {
    // For hero section, scroll to top
    if (targetId === 'hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const targetSection = document.getElementById(targetId);
    if (targetSection) {
      targetSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Logo and Brand Section */}
      <div className="space-y-4">
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-white">
          Coffee Shop
        </h2>
        <p className="font-body text-sm text-white/80 max-w-xs">
          Crafting exceptional coffee experiences with passion and dedication.
        </p>
      </div>

      {/* Quick Navigation Links */}
      <div className="space-y-4">
        <h3 className="font-heading text-lg md:text-xl font-semibold text-white">
          Quick Links
        </h3>
        <nav className="flex flex-col space-y-2">
          {navLinks.map((link) => (
            <button
              key={link.targetId}
              onClick={() => handleScrollToSection(link.targetId)}
              className="font-body text-sm text-white/80 hover:text-white transition-colors duration-300 ease-in-out text-left"
              aria-label={`Navigate to ${link.label} section`}
            >
              {link.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Copyright Section */}
      <div className="space-y-4">
        <h3 className="font-heading text-lg md:text-xl font-semibold text-white">
          Contact Us
        </h3>
        <div className="font-body text-sm text-white/80 space-y-2">
          <p>123 Coffee Street</p>
          <p>Jakarta, Indonesia</p>
          <p>Phone: +62 812-3456-7890</p>
        </div>
      </div>

      {/* Copyright Notice - Full Width */}
      <div className="md:col-span-3 pt-8 mt-8 border-t border-white/20">
        <p className="font-body text-sm text-white/80 text-center">
          &copy; {currentYear} Coffee Shop. All rights reserved.
        </p>
      </div>
    </div>
  );
}
