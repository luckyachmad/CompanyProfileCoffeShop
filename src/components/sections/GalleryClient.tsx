'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Lightbox from '@/components/ui/Lightbox';
import type { GalleryPhoto } from '@/types/gallery';

interface GalleryClientProps {
  photos: GalleryPhoto[];
}

/**
 * GalleryClient - Client Component for Framer Motion animations and Lightbox
 * 
 * Wraps gallery photo grid with:
 * - Framer Motion stagger animations
 * - Click handlers to open Lightbox modal
 * - Lightbox state management
 * 
 * **Validates: Requirements 5.2, 5.3, 5.4, 5.5, 5.6**
 */
export default function GalleryClient({ photos }: GalleryClientProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);

  /**
   * Opens the Lightbox with the selected photo
   */
  const openLightbox = (photo: GalleryPhoto) => {
    setSelectedPhoto(photo);
    setLightboxOpen(true);
  };

  /**
   * Closes the Lightbox
   */
  const closeLightbox = () => {
    setLightboxOpen(false);
    // Delay clearing selected photo to allow close animation
    setTimeout(() => setSelectedPhoto(null), 150);
  };

  return (
    <>
      {/* Animated Photo Grid */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }} // Animate once per requirement 5.6
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1 // Stagger child animations by 0.1s per requirement 5.6
            }
          }
        }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        {photos.map((photo) => (
          <motion.div
            key={photo.id}
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
            {/* Gallery Photo Card - Clickable */}
            <button
              onClick={() => openLightbox(photo)}
              className="relative w-full aspect-square rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 ease-in-out hover:scale-[1.02] cursor-pointer group"
              aria-label={`View full size: ${photo.alt_text || 'Gallery photo'}`}
            >
              <Image
                src={photo.image_url}
                alt={photo.alt_text || 'Gallery photo'}
                fill
                className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
              />
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 ease-in-out flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                  />
                </svg>
              </div>
            </button>
          </motion.div>
        ))}
      </motion.div>

      {/* Lightbox Modal - Requirements 5.3, 5.4, 5.5 */}
      {selectedPhoto && (
        <Lightbox
          isOpen={lightboxOpen}
          imageUrl={selectedPhoto.image_url}
          altText={selectedPhoto.alt_text || 'Gallery photo'}
          onClose={closeLightbox}
        />
      )}
    </>
  );
}
