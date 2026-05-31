# Project Setup Documentation

## Task 1: Project Structure and Core Configuration - COMPLETED ✓

This document describes the initial project setup completed for the CompanyProfileCoffeeShop application.

## What Was Implemented

### 1. Next.js 14+ Project Initialization
- ✅ Initialized Next.js 16.2.6 with TypeScript and App Router
- ✅ Configured strict TypeScript mode in `tsconfig.json`
- ✅ Set up ES modules (`"type": "module"` in package.json)

### 2. Tailwind CSS Configuration
- ✅ Installed Tailwind CSS v4 with `@tailwindcss/postcss`
- ✅ Configured custom design tokens in `src/styles/globals.css` using `@theme` directive:
  - Colors: background, surface, primary, secondary, border, text variants
  - Fonts: Poppins (headings), Inter (body text)
  - Border radius, transitions
- ✅ Set up PostCSS configuration with ES module format

### 3. Project Directory Structure
Created complete directory structure:
```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with font loading
│   └── page.tsx           # Landing page placeholder
├── components/
│   ├── ui/                # Reusable UI components (empty, ready for implementation)
│   └── sections/          # Page section components (empty, ready for implementation)
├── lib/
│   ├── db.ts             # PostgreSQL connection pool
│   └── storage/          # Storage adapter pattern
│       ├── index.ts      # Factory and interface
│       ├── localAdapter.ts
│       ├── s3Adapter.ts
│       └── gdriveAdapter.ts
├── types/                # TypeScript interfaces
│   ├── menu.ts
│   ├── gallery.ts
│   └── testimonial.ts
└── styles/
    └── globals.css       # Tailwind imports and global styles

db/
├── migrations/
│   └── 001_init_schema.sql    # Complete database schema
└── seeds/
    └── 001_seed_admin.sql     # Initial data (categories, admin)

public/
├── images/               # Static image assets
└── icons/                # Icon assets
```

### 4. Configuration Files

#### next.config.ts
- ✅ Configured `output: 'standalone'` for Docker deployment
- ✅ Set up `remotePatterns` for external image optimization

#### tsconfig.json
- ✅ Enabled strict mode
- ✅ Configured path aliases (`@/*` → `./src/*`)
- ✅ Set up for Next.js App Router

#### .env.example
- ✅ Documented all required environment variables:
  - App configuration (NODE_ENV, NEXTAUTH_URL, NEXTAUTH_SECRET)
  - Database connection (DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD, DB_SSL)
  - WhatsApp integration (NEXT_PUBLIC_WHATSAPP_NUMBER)
  - Storage configuration (STORAGE_DRIVER, local/S3/Google Drive settings)
  - PostgreSQL Docker variables

### 5. Database Schema
Created `db/migrations/001_init_schema.sql` with 5 tables:
- ✅ `admins` - Admin user accounts with bcrypt passwords
- ✅ `categories` - Menu categories (Coffee, Non-Coffee, Light Bites)
- ✅ `menu_items` - Menu items with category FK, price, images, best seller flag
- ✅ `gallery_photos` - Gallery images with sort order
- ✅ `testimonials` - Customer reviews with 1-5 rating constraint

All tables include appropriate indexes for performance.

### 6. TypeScript Type Definitions
- ✅ `MenuItem`, `MenuItemWithCategory`, `Category` interfaces
- ✅ `GalleryPhoto` interface
- ✅ `Testimonial` interface

### 7. Storage Adapter Pattern
Implemented pluggable storage system:
- ✅ `StorageAdapter` interface with upload/delete/getPublicUrl methods
- ✅ `LocalAdapter` - Saves to local file system
- ✅ `S3Adapter` - Uploads to S3-compatible buckets (MinIO, R2, B2, AWS S3)
- ✅ `GDriveAdapter` - Uploads to Google Drive via service account
- ✅ Factory function resolves adapter from `STORAGE_DRIVER` env var

### 8. Docker Configuration

#### Dockerfile
- ✅ Multi-stage build (deps → builder → runner)
- ✅ Uses `node:20-alpine` for minimal image size
- ✅ Copies standalone build from Next.js
- ✅ Creates uploads directory with proper permissions
- ✅ Runs as non-root user

#### docker-compose.yml
- ✅ Two services: `db` (PostgreSQL 16) and `app` (Next.js)
- ✅ Health check for database
- ✅ Named volumes for persistence (postgres_data, uploads_data)
- ✅ Auto-initializes schema from `db/migrations/` on first start
- ✅ All configuration via `.env` file

### 9. Git Configuration
- ✅ `.gitignore` - Excludes node_modules, .next, .env, uploads
- ✅ `.dockerignore` - Excludes development files from Docker image

### 10. Font Loading
- ✅ Poppins (weights 600, 700, 800) via `next/font/google`
- ✅ Inter (weights 400, 500) via `next/font/google`
- ✅ CSS variables set in root layout: `--font-poppins`, `--font-inter`

## Dependencies Installed

### Core
- next@16.2.6
- react@latest
- react-dom@latest
- typescript@latest

### Styling & Animation
- tailwindcss@latest
- @tailwindcss/postcss@latest
- postcss@latest
- autoprefixer@latest
- framer-motion@latest

### Database & Auth
- pg@latest
- bcryptjs@latest
- next-auth@latest

### Image Processing & Storage
- sharp@latest
- @aws-sdk/client-s3@latest
- googleapis@latest

### Data Fetching
- swr@latest

### Type Definitions
- @types/react
- @types/react-dom
- @types/node
- @types/pg
- @types/bcryptjs

## Build Verification

✅ TypeScript compilation: `npx tsc --noEmit` - PASSED
✅ Next.js production build: `npm run build` - PASSED
✅ All configuration files valid
✅ No build errors or warnings

## Next Steps

The project structure is now ready for implementation of:
1. Landing page sections (Hero, About, Menu, Gallery, Testimonials, Contact, Footer)
2. Admin dashboard UI
3. API route handlers
4. Authentication setup
5. Component implementation

## Requirements Satisfied

This setup satisfies the following requirements from the spec:
- ✅ Requirement 15.1: Next.js 14+ with TypeScript and App Router
- ✅ Requirement 15.5: Docker configuration with standalone output
- ✅ Requirement 15.6: Environment variable configuration
- ✅ Requirement 16.6: Tailwind CSS with custom design tokens

## How to Run

### Development
```bash
npm install
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Docker Deployment
```bash
# Build image
docker build -t your-dockerhub-username/coffeeshop-app:latest .

# Start services
docker compose up -d

# View logs
docker compose logs -f app
```

## Notes

- The project uses Tailwind CSS v4 with CSS-based configuration (`@theme` directive in globals.css)
- All environment variables must be set before running (copy `.env.example` to `.env`)
- Database schema auto-initializes on first Docker Compose start
- Storage adapter is resolved at runtime based on `STORAGE_DRIVER` env var
