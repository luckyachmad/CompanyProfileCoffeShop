/**
 * Lightbox Component Usage Example
 * 
 * This file demonstrates how to use the Lightbox component in the Gallery section.
 * This is NOT part of the production code - it's for documentation purposes only.
 */

'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Lightbox from './Lightbox';

interface GalleryPhoto {
  id: number;
  image_url: string;
  alt_text: string;
}

export default function GalleryExample() {
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);

  // Example gallery photos
  const photos: GalleryPhoto[] = [
    { id: 1, image_url: '/images/gallery/photo1.jpg', alt_text: 'Cozy coffee shop interior' },
    { id: 2, image_url: '/images/gallery/photo2.jpg', alt_text: 'Freshly brewed latte art' },
    { id: 3, image_url: '/images/gallery/photo3.jpg', alt_text: 'Barista preparing coffee' },
  ];

  return (
    <div className="container mx-auto px-4 py-20">
      <h2 className="text-3xl font-heading font-bold text-center mb-12">Gallery</h2>
      
      {/* Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {photos.map((photo) => (
          <button
            key={photo.id}
            onClick={() => setSelectedPhoto(photo)}
            className="relative aspect-square overflow-hidden rounded-2xl cursor-pointer transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg"
          >
            <Image
              src={photo.image_url}
              alt={photo.alt_text}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </button>
        ))}
      </div>

      {/* Lightbox Modal */}
      <Lightbox
        isOpen={selectedPhoto !== null}
        imageUrl={selectedPhoto?.image_url || ''}
        altText={selectedPhoto?.alt_text}
        onClose={() => setSelectedPhoto(null)}
      />
    </div>
  );
}

/**
 * Usage Notes:
 * 
 * 1. Import the Lightbox component:
 *    import Lightbox from '@/components/ui/Lightbox';
 * 
 * 2. Manage state for the selected photo:
 *    const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);
 * 
 * 3. Make gallery thumbnails clickable:
 *    <button onClick={() => setSelectedPhoto(photo)}>
 *      <Image src={photo.image_url} alt={photo.alt_text} />
 *    </button>
 * 
 * 4. Render the Lightbox with controlled state:
 *    <Lightbox
 *      isOpen={selectedPhoto !== null}
 *      imageUrl={selectedPhoto?.image_url || ''}
 *      altText={selectedPhoto?.alt_text}
 *      onClose={() => setSelectedPhoto(null)}
 *    />
 * 
 * Features:
 * - Click any gallery thumbnail to open the full-size image in the lightbox
 * - Click the X button in the top-right to close
 * - Press Escape key to close
 * - Click outside the image (on the dark overlay) to close
 * - Body scroll is prevented when lightbox is open
 * - Smooth transitions on all interactions (300ms ease-in-out)
 * - Fully accessible with ARIA attributes
 * - Responsive: image scales to fit viewport while maintaining aspect ratio
 */
