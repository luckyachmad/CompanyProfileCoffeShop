# Implementation Plan: Company Profile Coffee Shop

## Overview

This implementation plan breaks down the CompanyProfileCoffeeShop Next.js 14+ full-stack application into discrete, manageable coding tasks. The application is a single-page branding website with an integrated CMS dashboard, built with TypeScript, Tailwind CSS, PostgreSQL, and Docker deployment.

The implementation follows a bottom-up approach: infrastructure and shared utilities first, then data layer and API routes, followed by UI components, and finally integration and deployment configuration.

## Tasks

- [x] 1. Set up project structure and core configuration
  - Initialize Next.js 14+ project with TypeScript and App Router
  - Configure Tailwind CSS with custom design tokens (colors, fonts, transitions)
  - Set up project directory structure (`src/app`, `src/components`, `src/lib`, `src/types`, `db/migrations`, `db/seeds`)
  - Create `next.config.ts` with `output: 'standalone'` for Docker
  - Create `tsconfig.json` with strict mode enabled
  - Create `.env.example` with all required environment variables
  - Create `.gitignore` and `.dockerignore` files
  - _Requirements: 15.1, 15.5, 15.6, 16.6_

- [x] 2. Implement database layer and migrations
  - [x] 2.1 Create database connection pool
    - Write `src/lib/db.ts` with PostgreSQL connection pool using `pg` library
    - Read all connection parameters from environment variables
    - _Requirements: 14.1, 14.7_
  
  - [x] 2.2 Create database schema migration
    - Write `db/migrations/001_init_schema.sql` with all 5 tables (admins, categories, menu_items, gallery_photos, testimonials)
    - Include indexes, foreign keys, and CHECK constraints
    - _Requirements: 14.2, 14.3, 14.4, 14.5_
  
  - [x] 2.3 Create database seed file
    - Write `db/seeds/001_seed_admin.sql` with initial admin account (bcrypt-hashed password) and category data
    - _Requirements: 14.3_

- [x] 3. Implement TypeScript type definitions
  - [x] 3.1 Create shared type interfaces
    - Write `src/types/menu.ts` with MenuItem and Category interfaces
    - Write `src/types/gallery.ts` with GalleryPhoto interface
    - Write `src/types/testimonial.ts` with Testimonial interface
    - Write `src/types/admin.ts` with Admin interface
    - _Requirements: 4.1, 5.1, 6.1, 10.2_

- [ ] 4. Implement storage adapter system
  - [x] 4.1 Create storage adapter interface and factory
    - Write `src/lib/storage/index.ts` with StorageAdapter interface and getStorageAdapter() factory function
    - Implement runtime driver resolution based on STORAGE_DRIVER env var
    - _Requirements: 13.1, 13.2, 13.8_
  
  - [x] 4.2 Implement local storage adapter
    - Write `src/lib/storage/localAdapter.ts` with upload, delete, and getPublicUrl methods
    - Use fs/promises for file operations
    - _Requirements: 13.7_
  
  - [x] 4.3 Implement S3-compatible storage adapter
    - Write `src/lib/storage/s3Adapter.ts` using @aws-sdk/client-s3
    - Support MinIO, Cloudflare R2, Backblaze B2, AWS S3
    - _Requirements: 13.5_
  
  - [x] 4.4 Implement Google Drive storage adapter
    - Write `src/lib/storage/gdriveAdapter.ts` using googleapis library
    - Implement service account authentication and public file sharing
    - _Requirements: 13.6_

- [x] 5. Implement authentication system
  - [x] 5.1 Configure NextAuth.js
    - Write `src/lib/auth.ts` with NextAuth configuration
    - Implement Credentials provider with bcrypt password verification
    - Configure JWT session strategy and callbacks
    - _Requirements: 11.1, 11.2, 11.6_
  
  - [x] 5.2 Create NextAuth API route handler
    - Write `src/app/api/auth/[...nextauth]/route.ts` with NextAuth handler
    - _Requirements: 11.1_
  
  - [x] 5.3 Implement authentication middleware
    - Write `src/middleware.ts` to protect /admin/* routes
    - Redirect unauthenticated requests to sign-in page
    - _Requirements: 11.4_

- [x] 6. Implement API route handlers
  - [x] 6.1 Create Menu API routes
    - Write `src/app/api/menu/route.ts` with GET (public) and POST (admin) handlers
    - Implement session verification for POST requests
    - Handle image upload with Sharp WebP conversion and storage adapter integration
    - Use parameterized SQL queries
    - _Requirements: 12.1, 12.2, 12.9_
  
  - [x] 6.2 Create Menu Item detail API routes
    - Write `src/app/api/menu/[id]/route.ts` with PUT and DELETE handlers
    - Verify session for both operations
    - Handle image updates and deletions through storage adapter
    - _Requirements: 12.3_
  
  - [x] 6.3 Create Categories API routes
    - Write `src/app/api/categories/route.ts` with GET (public), POST (admin), and DELETE (admin) handlers
    - _Requirements: 12.7_
  
  - [x] 6.4 Create Gallery API routes
    - Write `src/app/api/gallery/route.ts` with GET (public) and POST (admin) handlers
    - Support multi-file upload with Sharp WebP conversion
    - Auto-increment sort_order for new photos
    - _Requirements: 12.4, 12.5_
  
  - [x] 6.5 Create Gallery Photo detail API routes
    - Write `src/app/api/gallery/[id]/route.ts` with DELETE handler
    - Clean up storage files when deleting photos
    - _Requirements: 12.5_
  
  - [x] 6.6 Create Testimonials API routes
    - Write `src/app/api/testimonials/route.ts` with GET (public), POST (admin), and DELETE (admin) handlers
    - Enforce rating constraint (1-5)
    - _Requirements: 12.6_
  
  - [x]* 6.7 Write API error handling tests
    - Test database error responses return HTTP 500 without exposing SQL details
    - Test SQL injection protection with parameterized queries
    - _Requirements: 12.8, 12.9_

- [x] 7. Checkpoint - Verify API layer
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Implement shared UI components
  - [x] 8.1 Create Button component
    - Write `src/components/ui/Button.tsx` with primary and secondary variants
    - Apply transition-all duration-300 ease-in-out to all buttons
    - _Requirements: 2.3, 16.6_
  
  - [x] 8.2 Create Badge component
    - Write `src/components/ui/Badge.tsx` for Best Seller badges
    - Use bg-secondary, rounded-full styling
    - _Requirements: 4.4_
  
  - [x] 8.3 Create Card component
    - Write `src/components/ui/Card.tsx` with rounded-2xl, shadow-sm, bg-surface, border-border
    - _Requirements: 4.2, 6.2_
  
  - [x] 8.4 Create WhatsAppButton component
    - Write `src/components/ui/WhatsAppButton.tsx` with floating and inline variants
    - Read phone number from NEXT_PUBLIC_WHATSAPP_NUMBER env var
    - Implement hover:scale-110 animation for floating variant
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7_
  
  - [x] 8.5 Create Lightbox component
    - Write `src/components/ui/Lightbox.tsx` for full-screen image modal
    - Implement close button, Escape key handler, and click-outside-to-close
    - _Requirements: 5.3, 5.4, 5.5_

- [ ] 9. Implement landing page section components
  - [ ] 9.1 Create Hero section
    - Write `src/components/sections/Hero.tsx` as Server Component
    - Implement full-viewport background image with bg-black/40 overlay
    - Add Framer Motion fade-in animation for headline and sub-headline
    - Implement smooth scroll to #menu on CTA button click
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_
  
  - [ ] 9.2 Create About Us section
    - Write `src/components/sections/About.tsx` as Server Component
    - Display brand story, philosophy, value proposition, and supporting photo
    - Apply Framer Motion whileInView animation
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  
  - [ ] 9.3 Create Featured Menu section
    - Write `src/components/sections/Menu.tsx` as Server Component
    - Fetch data from /api/menu with 60-second revalidation
    - Group items by category and render cards with image, title, description, price, Best Seller badge, WhatsApp button
    - Apply Framer Motion stagger animation to card grid
    - Handle empty/error states with fallback message
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8_
  
  - [ ] 9.4 Create Gallery section
    - Write `src/components/sections/Gallery.tsx` as Server Component
    - Fetch data from /api/gallery with 5-minute revalidation
    - Render responsive photo grid ordered by sort_order
    - Integrate Lightbox for full-size image viewing
    - Apply Framer Motion stagger animation
    - Handle empty/error states
    - _Requirements: 5.1, 5.2, 5.3, 5.6, 5.7_
  
  - [ ] 9.5 Create Testimonials section
    - Write `src/components/sections/Testimonials.tsx` as Server Component
    - Display testimonials with author_name, content, and star rating
    - Implement card grid or carousel layout
    - Apply Framer Motion whileInView animation
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_
  
  - [ ] 9.6 Create Contact & Location section
    - Write `src/components/sections/Contact.tsx` as Server Component
    - Embed Google Maps iframe
    - Display address, operating hours, phone number, and social media links
    - Apply Framer Motion whileInView animation
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
  
  - [ ] 9.7 Create Footer section
    - Write `src/components/sections/Footer.tsx` as Server Component
    - Display logo, copyright notice, and quick navigation links
    - Implement smooth scroll for navigation links
    - Use bg-primary background with text-white
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ] 10. Implement root layout and landing page
  - [ ] 10.1 Create root layout
    - Write `src/app/layout.tsx` with font loading (Poppins, Inter via next/font/google)
    - Apply CSS variables for fonts (--font-poppins, --font-inter)
    - Set up global Tailwind CSS imports
    - Configure metadata API with title, description, Open Graph tags
    - _Requirements: 1.5, 1.6, 16.2_
  
  - [ ] 10.2 Create landing page
    - Write `src/app/page.tsx` composing all 7 sections in order
    - Apply bg-background to body and section wrappers
    - Apply minimum section padding (py-20 px-4 md:px-8 lg:px-16)
    - _Requirements: 1.1, 1.3, 1.4, 1.7, 1.8_
  
  - [ ] 10.3 Create global styles
    - Write `src/styles/globals.css` with Tailwind imports and font CSS variables
    - Apply font-heading to h1-h3 elements
    - Apply font-body to p, span, label, figcaption, caption elements
    - _Requirements: 1.6, 16.3_

- [ ] 11. Checkpoint - Verify landing page
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. Implement admin dashboard
  - [ ] 12.1 Create admin layout
    - Write `src/app/admin/layout.tsx` as Client Component
    - Implement authentication guard with session check
    - Create sidebar navigation
    - _Requirements: 10.1, 10.9_
  
  - [ ] 12.2 Create admin dashboard home
    - Write `src/app/admin/page.tsx` with dashboard overview
    - Display stats and quick action links
    - _Requirements: 10.1_
  
  - [ ] 12.3 Create Menu management page
    - Write `src/app/admin/menu/page.tsx` as Client Component
    - Implement SWR data fetching for menu items
    - Create form modal for create/edit with all fields (title, category, description, price, image upload, Best Seller toggle)
    - Implement client-side validation (required fields, price > 0)
    - Add delete confirmation dialog
    - _Requirements: 10.2, 10.3, 10.4, 10.7, 10.8, 10.9_
  
  - [ ] 12.4 Create Gallery management page
    - Write `src/app/admin/gallery/page.tsx` as Client Component
    - Implement SWR data fetching for gallery photos
    - Create drag-and-drop upload zone with multi-file support
    - Add delete confirmation dialog
    - Implement drag-to-reorder for sort_order management
    - _Requirements: 10.5, 10.6, 10.7, 10.9_

- [ ] 13. Implement Docker deployment configuration
  - [ ] 13.1 Create Dockerfile
    - Write multi-stage Dockerfile with deps, builder, and runner stages
    - Use node:20-alpine base images
    - Copy standalone build output to runner stage
    - _Requirements: 15.1_
  
  - [ ] 13.2 Create Docker Compose configuration
    - Write `docker-compose.yml` with db (postgres:16-alpine) and app services
    - Configure named volumes for postgres_data and uploads_data
    - Set up env_file injection for all environment variables
    - Configure depends_on relationship
    - Mount db/migrations to /docker-entrypoint-initdb.d for auto-initialization
    - _Requirements: 15.3, 15.4, 15.5, 15.7, 15.8_

- [ ] 14. Implement SEO and performance optimizations
  - [ ] 14.1 Configure Next.js Image optimization
    - Update `next.config.ts` with remotePatterns for storage domains
    - Ensure all images use Next.js Image component with object-cover
    - _Requirements: 16.4, 16.7_
  
  - [ ] 14.2 Add semantic HTML and accessibility
    - Ensure all sections use semantic HTML5 elements (header, main, section, article, footer, nav)
    - Add non-empty alt attributes to all images
    - Add aria-label to WhatsApp floating button
    - _Requirements: 16.3, 16.5_

- [ ] 15. Final integration and testing
  - [ ] 15.1 Test complete user flows
    - Test landing page rendering with all 7 sections
    - Test smooth scroll navigation
    - Test WhatsApp button integration (floating and inline)
    - Test Lightbox modal functionality
    - _Requirements: 1.1, 1.2, 2.6, 5.3, 9.3, 9.4_
  
  - [ ] 15.2 Test admin authentication flow
    - Test sign-in with valid credentials
    - Test sign-in with invalid credentials
    - Test middleware protection of /admin/* routes
    - Test sign-out functionality
    - _Requirements: 11.2, 11.3, 11.4, 11.5_
  
  - [ ] 15.3 Test admin CRUD operations
    - Test menu item create, read, update, delete
    - Test gallery photo upload and delete
    - Test category management
    - Test testimonial management
    - _Requirements: 10.2, 10.3, 10.5, 10.6_
  
  - [ ] 15.4 Test storage adapter switching
    - Test local storage adapter with STORAGE_DRIVER=local
    - Test S3 adapter configuration validation
    - Test Google Drive adapter configuration validation
    - Test error handling for invalid STORAGE_DRIVER
    - _Requirements: 13.1, 13.5, 13.6, 13.8_
  
  - [ ]* 15.5 Run Lighthouse performance audit
    - Verify Lighthouse performance score >= 85
    - Check for proper WebP image delivery
    - Verify lazy loading is working
    - _Requirements: 16.1, 16.4_

- [ ] 16. Checkpoint - Final verification
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at major milestones
- The implementation uses TypeScript throughout with strict mode enabled
- All environment variables must be configured before running the application
- Database schema auto-initializes on first Docker Compose startup
- Storage adapter is configurable at runtime via STORAGE_DRIVER env var
- NextAuth sessions use httpOnly cookies for security
- All images are converted to WebP format server-side via Sharp
- Property-based tests are not included as the design document does not contain a Correctness Properties section

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1", "2.1", "3.1"] },
    { "id": 1, "tasks": ["2.2", "2.3", "4.1"] },
    { "id": 2, "tasks": ["4.2", "4.3", "4.4", "5.1"] },
    { "id": 3, "tasks": ["5.2", "5.3", "6.1", "6.3", "6.4", "6.6"] },
    { "id": 4, "tasks": ["6.2", "6.5", "6.7", "8.1", "8.2", "8.3"] },
    { "id": 5, "tasks": ["8.4", "8.5", "9.1", "9.2", "9.6", "9.7"] },
    { "id": 6, "tasks": ["9.3", "9.4", "9.5", "10.1", "10.3"] },
    { "id": 7, "tasks": ["10.2", "12.1"] },
    { "id": 8, "tasks": ["12.2", "12.3", "12.4", "13.1"] },
    { "id": 9, "tasks": ["13.2", "14.1", "14.2"] },
    { "id": 10, "tasks": ["15.1", "15.2", "15.3", "15.4", "15.5"] }
  ]
}
```
