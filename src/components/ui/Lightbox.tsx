'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';

interface LightboxProps {
  isOpen: boolean;
  imageUrl: string;
  altText?: string;
  onClose: () => void;
}

const Lightbox: React.FC<LightboxProps> = ({ isOpen, imageUrl, altText = '', onClose }) => {
  // Handle Escape key press
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when lightbox is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Don't render if not open
  if (!isOpen) return null;

  // Handle click on overlay (outside image)
  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    // Only close if clicking the overlay itself, not the image container
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label="Image lightbox"
    >
      {/* Image container */}
      <div className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-all duration-300 ease-in-out z-10"
          aria-label="Close lightbox"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Image */}
        <div className="relative w-full h-full flex items-center justify-center">
          <Image
            src={imageUrl}
            alt={altText}
            fill
            className="object-contain"
            sizes="(max-width: 1536px) 100vw, 1536px"
            priority
          />
        </div>
      </div>
    </div>
  );
};

export default Lightbox;
