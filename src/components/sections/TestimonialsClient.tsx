'use client';

import { motion } from 'framer-motion';

interface TestimonialsClientProps {
  children: React.ReactNode;
}

/**
 * TestimonialsClient - Client Component for Framer Motion animations
 * 
 * Wraps testimonial card grids with Framer Motion stagger animations.
 * Animates cards on scroll with staggered entrance effect.
 * 
 * **Validates: Requirement 6.5**
 */
export default function TestimonialsClient({ children }: TestimonialsClientProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }} // Animate once per requirement 6.5
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1 // Stagger child animations by 0.1s per requirement 6.5
          }
        }
      }}
    >
      {/* Wrap each card with motion variants */}
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 30 },
          visible: {
            opacity: 1,
            y: 0,
            transition: {
              duration: 0.5,
              ease: 'easeOut'
            }
          }
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
