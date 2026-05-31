# Design Document

## Overview

CompanyProfileCoffeeShop is a full-stack Next.js 14+ application that serves as both a public-facing single-page website and an integrated CMS dashboard for a coffee shop. The application follows a monolithic architecture where frontend, backend API routes, and admin dashboard coexist within a single Next.js project, leveraging the App Router for server-side rendering and API route handlers for backend logic.

### Core Architecture Principles

1. **Single Codebase**: All components (public site, admin dashboard, API) live in one Next.js project
2. **Server-First Rendering**: Public pages use React Server Components for optimal performance
3. **Direct Database Access**: PostgreSQL queries via `pg` connection pool, no ORM abstraction
4. **Configurable Storage**: Pluggable storage adapters (local/S3/Google Drive) resolved at runtime
5. **Session-Based Auth**: NextAuth.js with Credentials provider for admin authentication
6. **Container-Native**: Docker multi-stage build with Docker Compose orchestration

### Technology Stack Summary

- **Framework**: Next.js 14+ (App Router, TypeScript strict mode)
- **Styling**: Tailwind CSS with custom design tokens
- **Database**: PostgreSQL 16 with direct SQL queries via `pg`
- **Authentication**: NextAuth.js (Credentials provider, httpOnly session cookies)
- **Image Processing**: Sharp (server-side WebP conversion)
- **Storage**: Configurable adapters (local volume, S3-compatible, Google Drive API)
- **Animation**: Framer Motion (scroll-triggered animations, stagger effects)
- **Deployment**: Docker + Docker Compose, image pushed to Docker Hub

### Key Design Decisions

**Why No ORM?**
Direct SQL queries provide explicit control over database operations, eliminate abstraction overhead, and make schema migrations transparent and version-controlled through SQL files.

**Why Configurable Storage?**
Different deployment environments have different storage constraints. Local volumes work for development, S3-compatible buckets for cloud deployments, and Google Drive for cost-conscious small businesses.

**Why NextAuth.js Credentials?**
Simple admin-only authentication doesn't require OAuth complexity. Credentials provider with bcrypt-hashed passwords stored in PostgreSQL provides sufficient security for a single-admin CMS.

**Why Monolithic Architecture?**
A coffee shop website doesn't require microservices complexity. Colocating frontend and backend in Next.js simplifies deployment, reduces latency, and enables code sharing between client and server.


---

## Architecture

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         End User Browser                         │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────────┐  │
│  │  Landing Page  │  │ Admin Dashboard│  │  WhatsApp Link   │  │
│  │  (Public SSR)  │  │  (Client SPA)  │  │  (External)      │  │
│  └────────┬───────┘  └────────┬───────┘  └──────────────────┘  │
└───────────┼──────────────────┼─────────────────────────────────┘
            │                  │
            │ HTTPS            │ HTTPS (authenticated)
            │                  │
┌───────────▼──────────────────▼─────────────────────────────────┐
│                    Next.js Application (Port 3000)              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              App Router (src/app/)                       │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐  │  │
│  │  │   page.tsx  │  │  admin/**    │  │  api/**        │  │  │
│  │  │  (7 sections)│  │  (CMS UI)    │  │  (Route        │  │  │
│  │  │             │  │              │  │   Handlers)    │  │  │
│  │  └─────────────┘  └──────────────┘  └────────┬───────┘  │  │
│  └──────────────────────────────────────────────┼──────────┘  │
│  ┌──────────────────────────────────────────────▼──────────┐  │
│  │              Middleware (src/middleware.ts)             │  │
│  │         (NextAuth session verification)                 │  │
│  └──────────────────────────────────────────────┬──────────┘  │
│  ┌──────────────────────────────────────────────▼──────────┐  │
│  │                 Library Layer (src/lib/)                │  │
│  │  ┌──────────┐  ┌──────────┐  ┌────────────────────┐    │  │
│  │  │  db.ts   │  │ auth.ts  │  │  storage/          │    │  │
│  │  │ (pg Pool)│  │(NextAuth)│  │  (Adapters)        │    │  │
│  │  └────┬─────┘  └──────────┘  └─────────┬──────────┘    │  │
│  └───────┼──────────────────────────────────┼──────────────┘  │
└──────────┼──────────────────────────────────┼─────────────────┘
           │                                  │
           │ SQL over TCP                     │ File I/O / HTTP
           │                                  │
┌──────────▼──────────────┐      ┌───────────▼──────────────────┐
│   PostgreSQL 16         │      │   Storage Backend            │
│   (Port 5432)           │      │  ┌────────────────────────┐  │
│  ┌──────────────────┐   │      │  │ Local Volume           │  │
│  │ Tables:          │   │      │  │ /app/uploads           │  │
│  │ - admins         │   │      │  └────────────────────────┘  │
│  │ - categories     │   │      │  ┌────────────────────────┐  │
│  │ - menu_items     │   │      │  │ S3-Compatible Bucket   │  │
│  │ - gallery_photos │   │      │  │ (MinIO/R2/B2/AWS S3)   │  │
│  │ - testimonials   │   │      │  └────────────────────────┘  │
│  └──────────────────┘   │      │  ┌────────────────────────┐  │
└─────────────────────────┘      │  │ Google Drive API       │  │
                                 │  │ (Service Account)      │  │
                                 │  └────────────────────────┘  │
                                 └─────────────────────────────┘
```


### Request Flow Patterns

#### Public Page Request (Landing Page)

1. Browser requests `GET /`
2. Next.js App Router renders `src/app/page.tsx` as Server Component
3. Page imports and composes 7 section components (Hero, About, Menu, Gallery, Testimonials, Contact, Footer)
4. Server Components (Menu, Gallery, Testimonials) call `fetch()` to internal API routes
5. API routes query PostgreSQL via `pool.query()` with parameterized SQL
6. Data flows back through Server Components → HTML rendered on server
7. Next.js sends fully-rendered HTML + minimal hydration JS to browser
8. Client-side: Framer Motion animations trigger on scroll, WhatsApp buttons are interactive

#### Admin Dashboard Request (Protected)

1. Browser requests `GET /admin/menu`
2. Middleware (`src/middleware.ts`) intercepts request
3. Middleware verifies NextAuth session token from httpOnly cookie
4. If no valid session: redirect to `/api/auth/signin`
5. If valid session: request proceeds to `src/app/admin/menu/page.tsx`
6. Admin page renders as Client Component with SWR for data fetching
7. Client fetches `GET /api/menu` and renders CRUD UI
8. User submits form → `POST /api/menu` with session verification
9. Route Handler verifies session, validates input, executes SQL, returns JSON
10. SWR revalidates cache, UI updates without full page reload

#### Image Upload Flow

1. Admin uploads image via drag-and-drop in Gallery management UI
2. Client sends `POST /api/gallery` with multipart form data
3. Route Handler verifies NextAuth session
4. Route Handler extracts image buffer from request
5. Sharp converts image to WebP format (quality 85, lossless: false)
6. Storage adapter (resolved from `STORAGE_DRIVER` env var) uploads WebP buffer
7. Adapter returns publicly accessible URL
8. Route Handler inserts record into `gallery_photos` table with `image_url`
9. Route Handler returns JSON response with new photo object
10. Client UI updates gallery grid via SWR revalidation


### Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Docker Host                               │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              Docker Compose Network                        │ │
│  │                                                            │ │
│  │  ┌──────────────────────────┐  ┌─────────────────────┐   │ │
│  │  │  app (Next.js Container) │  │  db (PostgreSQL)    │   │ │
│  │  │  Image: user/coffeeshop  │  │  Image: postgres:16 │   │ │
│  │  │  Port: 3000:3000         │  │  Port: 5432 (internal)│ │
│  │  │                          │  │                     │   │ │
│  │  │  Env: .env (injected)    │  │  Env: .env (injected)│ │
│  │  │  Volumes:                │  │  Volumes:           │   │ │
│  │  │  - uploads_data:/app/    │  │  - postgres_data:   │   │ │
│  │  │    uploads (if local)    │  │    /var/lib/        │   │ │
│  │  │                          │  │    postgresql/data  │   │ │
│  │  └──────────┬───────────────┘  └──────────┬──────────┘   │ │
│  │             │                              │              │ │
│  │             └──────────────┬───────────────┘              │ │
│  │                            │                              │ │
│  └────────────────────────────┼──────────────────────────────┘ │
│                               │                                │
│  ┌────────────────────────────▼──────────────────────────────┐ │
│  │              Named Volumes (Persistent)                   │ │
│  │  - postgres_data (database files)                         │ │
│  │  - uploads_data (local images, if STORAGE_DRIVER=local)   │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                               │
                               │ Port 3000 exposed
                               │
                    ┌──────────▼──────────┐
                    │   Reverse Proxy     │
                    │   (Nginx/Caddy)     │
                    │   HTTPS termination │
                    └─────────────────────┘
```

**Deployment Steps:**

1. Build Next.js standalone image: `docker build -t user/coffeeshop:latest .`
2. Push to Docker Hub: `docker push user/coffeeshop:latest`
3. On target host: Pull image and start services: `docker compose up -d`
4. Database schema auto-initializes from `db/migrations/` on first start
5. Application reads all config from environment variables injected at runtime


---

## Components and Interfaces

### Component Hierarchy

```
src/app/layout.tsx (Root Layout)
├── Font Loading (Poppins, Inter via next/font/google)
├── Global CSS (Tailwind imports, design tokens)
└── {children}

src/app/page.tsx (Landing Page - Server Component)
├── sections/Hero.tsx (Server Component, static)
├── sections/About.tsx (Server Component, static)
├── sections/Menu.tsx (Server Component, fetches /api/menu)
├── sections/Gallery.tsx (Server Component, fetches /api/gallery)
├── sections/Testimonials.tsx (Server Component, static or fetches /api/testimonials)
├── sections/Contact.tsx (Server Component, static)
├── sections/Footer.tsx (Server Component, static)
└── ui/WhatsAppButton.tsx (Client Component, floating button)

src/app/admin/layout.tsx (Admin Layout - Client Component)
├── Authentication Guard (redirects if no session)
├── Sidebar Navigation
└── {children}

src/app/admin/page.tsx (Admin Dashboard - Client Component)
└── Dashboard Overview (stats, quick actions)

src/app/admin/menu/page.tsx (Menu Management - Client Component)
├── Menu Item List (SWR fetch from /api/menu)
├── Menu Item Form (create/edit modal)
└── Delete Confirmation Dialog

src/app/admin/gallery/page.tsx (Gallery Management - Client Component)
├── Gallery Grid (SWR fetch from /api/gallery)
├── Drag-and-Drop Upload Zone
└── Delete Confirmation Dialog
```

### Public Section Components

#### Hero Component (`src/components/sections/Hero.tsx`)

**Type**: Server Component (static content)

**Props**: None (all content hardcoded)

**Responsibilities**:
- Render full-viewport hero banner with background image
- Display headline (h1) and sub-headline (p) with Framer Motion fade-in animation
- Render primary CTA button that smooth-scrolls to `#menu` anchor
- Apply `bg-black/40` overlay for text contrast

**Key Classes**: `bg-background`, `font-heading`, `font-body`, `rounded-full`, `transition-all duration-300 ease-in-out`


#### Menu Component (`src/components/sections/Menu.tsx`)

**Type**: Server Component (dynamic data)

**Data Source**: `fetch('http://localhost:3000/api/menu', { next: { revalidate: 60 } })`

**Responsibilities**:
- Fetch menu items from API with 60-second revalidation
- Group items by category name (Coffee, Non-Coffee, Light Bites)
- Render category sections with labeled headings
- For each item: render card with image, title, description, price, Best Seller badge (if applicable), WhatsApp order button
- Apply Framer Motion stagger animation to card grid
- Handle empty/error states with fallback message

**Card Structure**:
```tsx
<motion.div className="rounded-2xl shadow-sm bg-surface border border-border p-6">
  <Image src={item.image_url} alt={item.title} className="object-cover" />
  {item.is_best_seller && <Badge>Best Seller</Badge>}
  <h3 className="font-heading">{item.title}</h3>
  <p className="font-body text-muted">{item.description}</p>
  <p className="font-body font-medium">{formatPrice(item.price)}</p>
  <WhatsAppButton itemTitle={item.title} />
</motion.div>
```

#### Gallery Component (`src/components/sections/Gallery.tsx`)

**Type**: Server Component (dynamic data)

**Data Source**: `fetch('http://localhost:3000/api/gallery', { next: { revalidate: 300 } })`

**Responsibilities**:
- Fetch gallery photos ordered by `sort_order` ascending
- Render responsive grid (1 col mobile, 2 col tablet, 3-4 col desktop)
- Each thumbnail is clickable and opens Lightbox modal
- Apply Framer Motion stagger animation
- Handle empty/error states

**Lightbox Integration**: Gallery passes selected photo to `ui/Lightbox.tsx` Client Component for modal display


### Admin Dashboard Components

#### Menu Management Page (`src/app/admin/menu/page.tsx`)

**Type**: Client Component (interactive CRUD)

**Data Fetching**: SWR hook for `GET /api/menu` with automatic revalidation

**State Management**:
- `selectedItem`: MenuItem | null (for edit mode)
- `isFormOpen`: boolean (modal visibility)
- `isDeleteDialogOpen`: boolean (confirmation dialog)

**Form Fields**:
- Title (text input, required)
- Category (select dropdown, fetched from `/api/categories`)
- Description (textarea, optional)
- Price (number input, required, min: 0, step: 0.01)
- Image (file upload, accepts image/*, converts to WebP)
- Best Seller (checkbox toggle)

**API Interactions**:
- Create: `POST /api/menu` with FormData
- Update: `PUT /api/menu/[id]` with FormData
- Delete: `DELETE /api/menu/[id]` (after confirmation)

**Validation**:
- Client-side: Required fields, price > 0, image file type
- Server-side: Duplicate validation in Route Handler

#### Gallery Management Page (`src/app/admin/gallery/page.tsx`)

**Type**: Client Component (interactive upload/delete)

**Data Fetching**: SWR hook for `GET /api/gallery`

**Features**:
- Drag-and-drop upload zone (react-dropzone or native)
- Multi-file upload support
- Image preview before upload
- Delete button on each photo with confirmation
- Sort order management (drag-to-reorder, updates `sort_order` field)

**API Interactions**:
- Upload: `POST /api/gallery` with FormData (single or multiple files)
- Delete: `DELETE /api/gallery/[id]`
- Reorder: `PATCH /api/gallery/reorder` with array of {id, sort_order}


### Shared UI Components

#### WhatsAppButton (`src/components/ui/WhatsAppButton.tsx`)

**Type**: Client Component

**Variants**:
1. **Floating Button**: Fixed bottom-right, visible on all pages, generic greeting message
2. **Inline Button**: Rendered on menu item cards, pre-filled with item title

**Props**:
```typescript
interface WhatsAppButtonProps {
  variant: 'floating' | 'inline';
  itemTitle?: string; // required for inline variant
  className?: string;
}
```

**Behavior**:
- Reads phone number from `process.env.NEXT_PUBLIC_WHATSAPP_NUMBER`
- Opens `https://wa.me/{number}?text={encodedMessage}` in new tab
- Floating variant: `hover:scale-110 transition-all duration-300`
- Inline variant: `rounded-full bg-primary hover:bg-primary-hover`

#### Lightbox (`src/components/ui/Lightbox.tsx`)

**Type**: Client Component

**Props**:
```typescript
interface LightboxProps {
  isOpen: boolean;
  imageUrl: string;
  altText: string;
  onClose: () => void;
}
```

**Features**:
- Full-screen modal overlay with `bg-black/90`
- Close button (X icon) in top-right corner
- Escape key listener for dismissal
- Click outside image to close
- Image centered with max dimensions, maintains aspect ratio


### API Route Handlers

#### Menu API (`src/app/api/menu/route.ts`)

**GET /api/menu** (Public)
- Query: `SELECT m.*, c.name as category_name FROM menu_items m LEFT JOIN categories c ON m.category_id = c.id ORDER BY c.name, m.title`
- Returns: `MenuItem[]` with category names joined
- Cache: Next.js automatic caching, revalidate on-demand via `revalidatePath('/')`

**POST /api/menu** (Admin only)
- Auth: Verify NextAuth session via `getServerSession(authOptions)`
- Body: FormData with title, category_id, description, price, image file, is_best_seller
- Process: Extract image → Sharp WebP conversion → Storage adapter upload → Get URL
- Query: `INSERT INTO menu_items (category_id, title, description, price, image_url, is_best_seller) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`
- Returns: Created MenuItem object
- Revalidate: `revalidatePath('/')` to update public page cache

#### Menu Item API (`src/app/api/menu/[id]/route.ts`)

**PUT /api/menu/[id]** (Admin only)
- Auth: Verify session
- Body: FormData (same as POST, all fields optional except id)
- Process: If new image provided → Sharp conversion → Upload → Update URL
- Query: `UPDATE menu_items SET category_id = $1, title = $2, description = $3, price = $4, image_url = $5, is_best_seller = $6, updated_at = NOW() WHERE id = $7 RETURNING *`
- Returns: Updated MenuItem
- Revalidate: `revalidatePath('/')`

**DELETE /api/menu/[id]** (Admin only)
- Auth: Verify session
- Query: `DELETE FROM menu_items WHERE id = $1 RETURNING image_url`
- Process: If image_url exists → Call storage adapter delete method
- Returns: `{ success: true }`
- Revalidate: `revalidatePath('/')`


#### Gallery API (`src/app/api/gallery/route.ts`)

**GET /api/gallery** (Public)
- Query: `SELECT * FROM gallery_photos ORDER BY sort_order ASC, created_at DESC`
- Returns: `GalleryPhoto[]`
- Cache: Next.js automatic caching, 5-minute revalidation

**POST /api/gallery** (Admin only)
- Auth: Verify session
- Body: FormData with one or multiple image files, optional alt_text array
- Process: For each file → Sharp WebP conversion → Storage upload → Get URL
- Query: `INSERT INTO gallery_photos (image_url, alt_text, sort_order) VALUES ($1, $2, $3) RETURNING *`
- Sort order: Auto-increment from max existing sort_order + 1
- Returns: Array of created GalleryPhoto objects
- Revalidate: `revalidatePath('/')`

#### Gallery Photo API (`src/app/api/gallery/[id]/route.ts`)

**DELETE /api/gallery/[id]** (Admin only)
- Auth: Verify session
- Query: `DELETE FROM gallery_photos WHERE id = $1 RETURNING image_url`
- Process: Call storage adapter delete method with image_url
- Returns: `{ success: true }`
- Revalidate: `revalidatePath('/')`

#### Categories API (`src/app/api/categories/route.ts`)

**GET /api/categories** (Public)
- Query: `SELECT * FROM categories ORDER BY name ASC`
- Returns: `Category[]`
- Cache: Long-lived (categories rarely change)

**POST /api/categories** (Admin only)
- Auth: Verify session
- Body: `{ name: string }`
- Query: `INSERT INTO categories (name) VALUES ($1) RETURNING *`
- Returns: Created Category

**DELETE /api/categories/[id]** (Admin only)
- Auth: Verify session
- Query: `DELETE FROM categories WHERE id = $1`
- Note: Foreign key constraint `ON DELETE SET NULL` handles orphaned menu items
- Returns: `{ success: true }`


#### Testimonials API (`src/app/api/testimonials/route.ts`)

**GET /api/testimonials** (Public)
- Query: `SELECT * FROM testimonials ORDER BY created_at DESC LIMIT 10`
- Returns: `Testimonial[]`
- Cache: 10-minute revalidation

**POST /api/testimonials** (Admin only)
- Auth: Verify session
- Body: `{ author_name: string, content: string, rating: number }`
- Validation: rating must be 1-5 (enforced by DB CHECK constraint)
- Query: `INSERT INTO testimonials (author_name, content, rating) VALUES ($1, $2, $3) RETURNING *`
- Returns: Created Testimonial
- Revalidate: `revalidatePath('/')`

**DELETE /api/testimonials/[id]** (Admin only)
- Auth: Verify session
- Query: `DELETE FROM testimonials WHERE id = $1`
- Returns: `{ success: true }`
- Revalidate: `revalidatePath('/')`

#### Authentication API (`src/app/api/auth/[...nextauth]/route.ts`)

**NextAuth Configuration** (`src/lib/auth.ts`):

```typescript
import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { pool } from '@/lib/db';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        const result = await pool.query(
          'SELECT * FROM admins WHERE email = $1',
          [credentials.email]
        );
        
        if (result.rows.length === 0) return null;
        
        const admin = result.rows[0];
        const isValid = await bcrypt.compare(credentials.password, admin.password);
        
        if (!isValid) return null;
        
        return { id: admin.id, email: admin.email };
      }
    })
  ],
  session: { strategy: 'jwt' },
  pages: { signIn: '/api/auth/signin' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user) session.user.id = token.id as string;
      return session;
    }
  }
};
```


### Storage Adapter Pattern

#### Interface Definition (`src/lib/storage/index.ts`)

```typescript
export interface StorageAdapter {
  upload(buffer: Buffer, filename: string, mimeType: string): Promise<string>;
  delete(url: string): Promise<void>;
  getPublicUrl(filename: string): string;
}

export function getStorageAdapter(): StorageAdapter {
  const driver = process.env.STORAGE_DRIVER;
  
  switch (driver) {
    case 'local':
      return new LocalAdapter();
    case 's3':
      return new S3Adapter();
    case 'gdrive':
      return new GDriveAdapter();
    default:
      throw new Error(`Invalid STORAGE_DRIVER: ${driver}. Must be 'local', 's3', or 'gdrive'.`);
  }
}
```

#### Local Adapter (`src/lib/storage/localAdapter.ts`)

```typescript
import fs from 'fs/promises';
import path from 'path';

export class LocalAdapter implements StorageAdapter {
  private basePath: string;
  
  constructor() {
    this.basePath = process.env.STORAGE_LOCAL_PATH || '/app/uploads';
  }
  
  async upload(buffer: Buffer, filename: string): Promise<string> {
    const filepath = path.join(this.basePath, filename);
    await fs.mkdir(this.basePath, { recursive: true });
    await fs.writeFile(filepath, buffer);
    return `/uploads/${filename}`;
  }
  
  async delete(url: string): Promise<void> {
    const filename = path.basename(url);
    const filepath = path.join(this.basePath, filename);
    await fs.unlink(filepath).catch(() => {}); // ignore if not exists
  }
  
  getPublicUrl(filename: string): string {
    return `/uploads/${filename}`;
  }
}
```


#### S3 Adapter (`src/lib/storage/s3Adapter.ts`)

```typescript
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

export class S3Adapter implements StorageAdapter {
  private client: S3Client;
  private bucket: string;
  private endpoint: string;
  
  constructor() {
    this.bucket = process.env.S3_BUCKET!;
    this.endpoint = process.env.S3_ENDPOINT!;
    
    this.client = new S3Client({
      endpoint: this.endpoint,
      region: process.env.S3_REGION || 'auto',
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY!,
        secretAccessKey: process.env.S3_SECRET_KEY!
      }
    });
  }
  
  async upload(buffer: Buffer, filename: string, mimeType: string): Promise<string> {
    await this.client.send(new PutObjectCommand({
      Bucket: this.bucket,
      Key: filename,
      Body: buffer,
      ContentType: mimeType,
      ACL: 'public-read'
    }));
    
    return this.getPublicUrl(filename);
  }
  
  async delete(url: string): Promise<void> {
    const filename = url.split('/').pop()!;
    await this.client.send(new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: filename
    }));
  }
  
  getPublicUrl(filename: string): string {
    return `${this.endpoint}/${this.bucket}/${filename}`;
  }
}
```


#### Google Drive Adapter (`src/lib/storage/gdriveAdapter.ts`)

```typescript
import { google } from 'googleapis';
import { Readable } from 'stream';

export class GDriveAdapter implements StorageAdapter {
  private drive: any;
  private folderId: string;
  
  constructor() {
    this.folderId = process.env.GDRIVE_FOLDER_ID!;
    const serviceAccountPath = process.env.GDRIVE_SERVICE_ACCOUNT_JSON!;
    
    const auth = new google.auth.GoogleAuth({
      keyFile: serviceAccountPath,
      scopes: ['https://www.googleapis.com/auth/drive.file']
    });
    
    this.drive = google.drive({ version: 'v3', auth });
  }
  
  async upload(buffer: Buffer, filename: string, mimeType: string): Promise<string> {
    const stream = Readable.from(buffer);
    
    const response = await this.drive.files.create({
      requestBody: {
        name: filename,
        parents: [this.folderId],
        mimeType
      },
      media: {
        mimeType,
        body: stream
      },
      fields: 'id, webViewLink, webContentLink'
    });
    
    // Make file publicly accessible
    await this.drive.permissions.create({
      fileId: response.data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone'
      }
    });
    
    return `https://drive.google.com/uc?id=${response.data.id}`;
  }
  
  async delete(url: string): Promise<void> {
    const fileId = url.match(/id=([^&]+)/)?.[1];
    if (fileId) {
      await this.drive.files.delete({ fileId });
    }
  }
  
  getPublicUrl(fileId: string): string {
    return `https://drive.google.com/uc?id=${fileId}`;
  }
}
```


---

## Data Models

### Database Schema

#### admins Table

```sql
CREATE TABLE IF NOT EXISTS admins (
  id          SERIAL PRIMARY KEY,
  email       VARCHAR(255) UNIQUE NOT NULL,
  password    TEXT NOT NULL,             -- bcrypt hash, cost factor 10
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_admins_email ON admins(email);
```

**TypeScript Interface**:
```typescript
interface Admin {
  id: number;
  email: string;
  password: string; // never exposed to client
  created_at: Date;
}
```

#### categories Table

```sql
CREATE TABLE IF NOT EXISTS categories (
  id    SERIAL PRIMARY KEY,
  name  VARCHAR(100) UNIQUE NOT NULL
);

CREATE INDEX idx_categories_name ON categories(name);
```

**TypeScript Interface**:
```typescript
interface Category {
  id: number;
  name: string;
}
```

**Seed Data**:
```sql
INSERT INTO categories (name) VALUES 
  ('Coffee'),
  ('Non-Coffee'),
  ('Light Bites')
ON CONFLICT (name) DO NOTHING;
```


#### menu_items Table

```sql
CREATE TABLE IF NOT EXISTS menu_items (
  id             SERIAL PRIMARY KEY,
  category_id    INT REFERENCES categories(id) ON DELETE SET NULL,
  title          VARCHAR(255) NOT NULL,
  description    TEXT,
  price          NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  image_url      TEXT,
  is_best_seller BOOLEAN DEFAULT FALSE,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_menu_items_category ON menu_items(category_id);
CREATE INDEX idx_menu_items_best_seller ON menu_items(is_best_seller) WHERE is_best_seller = TRUE;
```

**TypeScript Interface**:
```typescript
interface MenuItem {
  id: number;
  category_id: number | null;
  title: string;
  description: string | null;
  price: number; // stored as NUMERIC(10,2), no floating-point drift
  image_url: string | null;
  is_best_seller: boolean;
  created_at: Date;
  updated_at: Date;
}

// Extended interface for API responses with category name joined
interface MenuItemWithCategory extends MenuItem {
  category_name: string | null;
}
```

**Constraints**:
- `price` must be non-negative (CHECK constraint)
- `category_id` foreign key with `ON DELETE SET NULL` (orphaned items remain visible but uncategorized)
- `title` is required (NOT NULL)


#### gallery_photos Table

```sql
CREATE TABLE IF NOT EXISTS gallery_photos (
  id          SERIAL PRIMARY KEY,
  image_url   TEXT NOT NULL,
  alt_text    VARCHAR(255),
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_gallery_sort ON gallery_photos(sort_order, created_at);
```

**TypeScript Interface**:
```typescript
interface GalleryPhoto {
  id: number;
  image_url: string;
  alt_text: string | null;
  sort_order: number;
  created_at: Date;
}
```

**Sort Order Logic**:
- New photos default to `sort_order = 0`
- Admin can drag-to-reorder, which updates `sort_order` values
- Query always orders by `sort_order ASC, created_at DESC`

#### testimonials Table

```sql
CREATE TABLE IF NOT EXISTS testimonials (
  id          SERIAL PRIMARY KEY,
  author_name VARCHAR(255) NOT NULL,
  content     TEXT NOT NULL,
  rating      SMALLINT CHECK (rating BETWEEN 1 AND 5),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_testimonials_created ON testimonials(created_at DESC);
```

**TypeScript Interface**:
```typescript
interface Testimonial {
  id: number;
  author_name: string;
  content: string;
  rating: number; // 1-5, enforced by CHECK constraint
  created_at: Date;
}
```

**Constraints**:
- `rating` must be between 1 and 5 inclusive (CHECK constraint)
- `author_name` and `content` are required (NOT NULL)

