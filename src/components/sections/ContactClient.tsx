'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

/**
 * ContactClient - Client Component for Contact section animations
 * 
 * Handles:
 * - Framer Motion whileInView animation for the entire section content
 * - Fade-in and upward drift effect when section enters viewport
 * - Animation triggers once per page load (viewport.once: true)
 * 
 * **Validates: Requirement 7.5**
 */
interface ContactClientProps {
  children: ReactNode;
}

export default function ContactClient({ children }: ContactClientProps) {
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
