import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { pool } from '@/lib/db';
import { getStorageAdapter } from '@/lib/storage';
import sharp from 'sharp';
import type { GalleryPhoto } from '@/types/gallery';

/**
 * Gallery API Route Handler
 * 
 * GET /api/gallery - Public endpoint to fetch all gallery photos ordered by sort_order
 * POST /api/gallery - Admin-only endpoint to upload multiple photos with WebP conversion
 * 
 * Requirements: 12.4, 12.5
 */

/**
 * GET /api/gallery
 * Public endpoint - no authentication required
 * Returns all gallery photos ordered by sort_order ascending
 */
export async function GET() {
  try {
    // Parameterized query to fetch gallery photos ordered by sort_order
    const result = await pool.query<GalleryPhoto>(
      `SELECT 
        id,
        image_url,
        alt_text,
        sort_order,
        created_at
      FROM gallery_photos
      ORDER BY sort_order ASC, created_at DESC`
    );

    return NextResponse.json(result.rows, { status: 200 });
  } catch (error) {
    console.error('Error fetching gallery photos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gallery photos' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/gallery
 * Admin-only endpoint - requires valid NextAuth session
 * Supports multi-file upload with Sharp WebP conversion
 * Auto-increments sort_order for new photos
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin session
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin session required' },
        { status: 401 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    
    // Extract all image files from FormData (field name: 'images')
    const imageFiles: File[] = [];
    for (const [key, value] of formData.entries()) {
      if (key === 'images' && value instanceof File) {
        imageFiles.push(value);
      }
    }

    // Validate that at least one image was provided
    if (imageFiles.length === 0) {
      return NextResponse.json(
        { error: 'No images provided - at least one image is required' },
        { status: 400 }
      );
    }

    // Get optional alt_text (can be a single value or comma-separated for multiple images)
    const altTextParam = formData.get('alt_text') as string | null;
    const altTexts = altTextParam ? altTextParam.split(',').map(t => t.trim()) : [];

    // Get current max sort_order to auto-increment
    const maxSortOrderResult = await pool.query<{ max: number | null }>(
      'SELECT MAX(sort_order) as max FROM gallery_photos'
    );
    let nextSortOrder = (maxSortOrderResult.rows[0]?.max ?? -1) + 1;

    // Process each image file
    const uploadedPhotos: GalleryPhoto[] = [];
    const storageAdapter = getStorageAdapter();

    for (let i = 0; i < imageFiles.length; i++) {
      const imageFile = imageFiles[i];
      const altText = altTexts[i] || null;

      try {
        // Convert File to Buffer
        const arrayBuffer = await imageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Convert image to WebP format using Sharp (quality: 85)
        const webpBuffer = await sharp(buffer)
          .webp({ quality: 85, lossless: false })
          .toBuffer();

        // Generate unique filename
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        const filename = `gallery-${timestamp}-${randomSuffix}.webp`;

        // Upload to storage adapter
        const imageUrl = await storageAdapter.upload(
          webpBuffer,
          filename,
          'image/webp'
        );

        // Insert photo record into database with auto-incremented sort_order
        const result = await pool.query<GalleryPhoto>(
          `INSERT INTO gallery_photos 
            (image_url, alt_text, sort_order)
          VALUES ($1, $2, $3)
          RETURNING *`,
          [imageUrl, altText, nextSortOrder]
        );

        uploadedPhotos.push(result.rows[0]);
        nextSortOrder++; // Increment for next photo

      } catch (imageError) {
        console.error(`Error processing image ${i + 1}:`, imageError);
        // Continue processing other images even if one fails
        continue;
      }
    }

    // Check if any photos were successfully uploaded
    if (uploadedPhotos.length === 0) {
      return NextResponse.json(
        { error: 'Failed to process any images' },
        { status: 500 }
      );
    }

    return NextResponse.json(uploadedPhotos, { status: 201 });
  } catch (error) {
    console.error('Error uploading gallery photos:', error);
    return NextResponse.json(
      { error: 'Failed to upload gallery photos' },
      { status: 500 }
    );
  }
}
