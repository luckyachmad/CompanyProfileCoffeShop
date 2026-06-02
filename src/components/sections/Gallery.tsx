import GalleryClient from './GalleryClient';
import type { GalleryPhoto } from '@/types/gallery';

/**
 * Gallery Section - Server Component
 * 
 * Renders an aesthetic photo grid of the coffee shop with:
 * - Data fetched from /api/gallery with 5-minute revalidation
 * - Photos ordered by sort_order ascending
 * - Responsive grid layout (1 col mobile, 2 col tablet, 3-4 col desktop)
 * - Lightbox modal for full-size image viewing
 * - Framer Motion stagger animation on photo grid
 * - Empty/error state fallback messages
 * - Uses semantic <section> element with proper structure
 * 
 * This component is a Server Component that fetches data server-side.
 * Animations and Lightbox interactions are delegated to GalleryClient.
 * 
 * **Validates: Requirements 5.1, 5.2, 5.3, 5.6, 5.7, 16.3, 16.5**
 */

/**
 * Fetches gallery photos from the API with 5-minute revalidation
 */
async function getGalleryPhotos(): Promise<GalleryPhoto[]> {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/gallery`, {
      next: { revalidate: 300 } // 5-minute (300 seconds) revalidation per requirement 5.1
    });

    if (!response.ok) {
      console.error('Failed to fetch gallery photos:', response.statusText);
      return [];
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching gallery photos:', error);
    return [];
  }
}

export default async function Gallery() {
  const photos = await getGalleryPhotos();
  
  // Handle empty state per requirement 5.7
  if (photos.length === 0) {
    return (
      <section id="gallery" className="bg-background py-20 px-4 md:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary text-center mb-12">
            Gallery
          </h2>
          <div className="text-center py-12">
            <p className="font-body text-lg text-text-muted">
              Our gallery is being updated. Please check back soon or visit us in person to experience our atmosphere.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="gallery" className="bg-background py-20 px-4 md:px-8 lg:px-16">
      <div className="max-w-7xl mx-auto">
        {/* Section Heading */}
        <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary text-center mb-12">
          Gallery
        </h2>

        {/* Gallery Grid with Client-side Interactions */}
        <GalleryClient photos={photos} />
      </div>
    </section>
  );
}
