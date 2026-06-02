import Image from 'next/image';
import HeroClient from './HeroClient';

/**
 * Hero Section - Server Component
 * 
 * Renders a full-viewport hero banner with:
 * - Full-width background image with dark overlay for text contrast
 * - Headline and sub-headline with fade-in animations
 * - Primary CTA button that smooth-scrolls to the menu section
 * - Uses semantic <header> element for page banner
 * 
 * This component is a Server Component that renders static content.
 * Interactive elements (animations, scroll behavior) are delegated to HeroClient.
 * 
 * **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 16.3**
 */
export default function Hero() {
  return (
    <header className="relative h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero-background.webp"
          alt="Coffee shop interior with warm lighting and cozy atmosphere"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        {/* Dark overlay for text readability - bg-black/40 as per requirement 2.1 */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content Container */}
      <HeroClient />
    </header>
  );
}
