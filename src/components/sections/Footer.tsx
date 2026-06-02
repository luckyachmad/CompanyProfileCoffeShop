import FooterClient from './FooterClient';

/**
 * Footer Section - Server Component
 * 
 * Renders the page footer with:
 * - Coffee shop logo/brand name
 * - Copyright notice including the current year
 * - Quick navigation links to all seven page sections
 * - Uses bg-primary (deep espresso brown) background
 * - All text in text-white for brand contrast
 * - Uses semantic <footer> element
 * 
 * This component is a Server Component that renders static content.
 * Interactive elements (smooth scroll navigation) are delegated to FooterClient.
 * 
 * **Validates: Requirements 8.1, 8.2, 8.3, 8.4, 16.3**
 */
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-white py-12 px-4 md:px-8 lg:px-16">
      <div className="max-w-7xl mx-auto">
        <FooterClient currentYear={currentYear} />
      </div>
    </footer>
  );
}
