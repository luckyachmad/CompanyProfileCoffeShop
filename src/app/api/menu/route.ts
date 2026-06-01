import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { pool } from '@/lib/db';
import { getStorageAdapter } from '@/lib/storage';
import sharp from 'sharp';
import type { MenuItemWithCategory } from '@/types/menu';

/**
 * Menu API Route Handler
 * 
 * GET /api/menu - Public endpoint to fetch all menu items with category names
 * POST /api/menu - Admin-only endpoint to create a new menu item with image upload
 * 
 * Requirements: 12.1, 12.2, 12.9
 */

/**
 * GET /api/menu
 * Public endpoint - no authentication required
 * Returns all menu items joined with category names, ordered by category then title
 */
export async function GET() {
  try {
    // Parameterized query to fetch menu items with category names
    const result = await pool.query<MenuItemWithCategory>(
      `SELECT 
        m.id,
        m.category_id,
        m.title,
        m.description,
        m.price,
        m.image_url,
        m.is_best_seller,
        m.created_at,
        m.updated_at,
        c.name as category_name
      FROM menu_items m
      LEFT JOIN categories c ON m.category_id = c.id
      ORDER BY c.name ASC, m.title ASC`
    );

    return NextResponse.json(result.rows, { status: 200 });
  } catch (error) {
    console.error('Error fetching menu items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch menu items' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/menu
 * Admin-only endpoint - requires valid NextAuth session
 * Creates a new menu item with image upload, WebP conversion, and storage
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
    
    const title = formData.get('title') as string;
    const categoryId = formData.get('category_id') as string;
    const description = formData.get('description') as string | null;
    const price = formData.get('price') as string;
    const isBestSeller = formData.get('is_best_seller') === 'true';
    const imageFile = formData.get('image') as File | null;

    // Validate required fields
    if (!title || !price) {
      return NextResponse.json(
        { error: 'Missing required fields: title and price are required' },
        { status: 400 }
      );
    }

    // Validate price is a positive number
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) {
      return NextResponse.json(
        { error: 'Invalid price: must be a non-negative number' },
        { status: 400 }
      );
    }

    // Handle image upload if provided
    let imageUrl: string | null = null;
    
    if (imageFile) {
      try {
        // Convert File to Buffer
        const arrayBuffer = await imageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Convert image to WebP format using Sharp
        const webpBuffer = await sharp(buffer)
          .webp({ quality: 85, lossless: false })
          .toBuffer();

        // Generate unique filename
        const timestamp = Date.now();
        const filename = `menu-${timestamp}.webp`;

        // Upload to storage adapter
        const storageAdapter = getStorageAdapter();
        imageUrl = await storageAdapter.upload(
          webpBuffer,
          filename,
          'image/webp'
        );
      } catch (imageError) {
        console.error('Error processing image:', imageError);
        return NextResponse.json(
          { error: 'Failed to process image upload' },
          { status: 500 }
        );
      }
    }

    // Insert menu item into database using parameterized query
    const result = await pool.query(
      `INSERT INTO menu_items 
        (category_id, title, description, price, image_url, is_best_seller)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [
        categoryId ? parseInt(categoryId) : null,
        title,
        description || null,
        priceNum,
        imageUrl,
        isBestSeller
      ]
    );

    const newMenuItem = result.rows[0];

    return NextResponse.json(newMenuItem, { status: 201 });
  } catch (error) {
    console.error('Error creating menu item:', error);
    return NextResponse.json(
      { error: 'Failed to create menu item' },
      { status: 500 }
    );
  }
}
