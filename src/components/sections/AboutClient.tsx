'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

/**
 * AboutClient - Client Component for About section animations
 * 
 * Handles:
 * - Framer Motion whileInView animation for the entire section content
 * - Fade-in and upward drift effect when section enters viewport
 * - Animation triggers once per page load (viewport.once: true)
 * 
 * **Validates: Requirement 3.3**
 */
interface AboutClientProps {
  children: ReactNode;
}

export default function AboutClient({ children }: AboutClientProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      viewport={{ once: true }}
    >
      {children}
    </motion.div>
  );
}
