'use client';

import { motion } from 'framer-motion';

/**
 * HeroClient - Client Component for Hero animations and interactions
 * 
 * Handles:
 * - Framer Motion fade-in animations for headline and sub-headline
 * - Smooth scroll to #menu section on CTA button click
 * 
 * **Validates: Requirements 2.2, 2.3, 2.4, 2.6**
 */
export default function HeroClient() {
  const handleScrollToMenu = () => {
    const menuSection = document.getElementById('menu');
    if (menuSection) {
      menuSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative z-10 text-center px-4 md:px-8 max-w-4xl mx-auto">
      {/* Headline with fade-in animation */}
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6"
      >
        Crafted with Passion, Served with Love
      </motion.h1>

      {/* Sub-headline with fade-in animation (delayed) */}
      <motion.p
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
        className="font-body text-lg md:text-xl lg:text-2xl text-white/90 mb-10 max-w-2xl mx-auto"
      >
        Experience the perfect blend of premium coffee, cozy atmosphere, and exceptional service
      </motion.p>

      {/* Primary CTA Button with all required styling and transitions */}
      <motion.button
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut', delay: 0.4 }}
        onClick={handleScrollToMenu}
        className="bg-primary text-white rounded-full px-8 py-4 text-lg font-medium
                   transition-all duration-300 ease-in-out
                   hover:bg-primary-hover hover:shadow-md hover:scale-[1.03]
                   active:scale-[0.98]
                   focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        aria-label="Explore our menu"
      >
        Explore Our Menu
      </motion.button>
    </div>
  );
}
