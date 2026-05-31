# Requirements Document

## Introduction

CompanyProfileCoffeeShop is a full-stack, single-page branding and digital catalog website for a coffee shop, built with Next.js 14+ App Router. The site serves as the public-facing digital presence of the brand — conveying a cozy, warm, modern atmosphere — while also providing a CMS admin dashboard so the owner can manage menu items and gallery photos independently without developer involvement.

The site is a long-scroll single-page application (SPA) composed of seven ordered sections: Hero, About Us, Featured Menu, Gallery, Testimonials, Contact & Location, and Footer. Dynamic content (menu items and gallery photos) is served from a PostgreSQL database via Next.js Route Handlers. The admin dashboard is protected by NextAuth.js Credentials-based authentication. Images are processed server-side to WebP format via Sharp before being stored through a configurable Storage_Adapter. The entire application is containerized with Docker and deployed via Docker Compose.

## Glossary

- **App**: The Next.js 14+ full-stack application (frontend + API routes + admin dashboard)
- **Landing_Page**: The public-facing single-page application at the root route (`/`)
- **Admin_Dashboard**: The CMS interface at `/admin/*`, accessible only to authenticated Admin_Users
- **Admin_User**: The coffeeshop owner who logs into the Admin_Dashboard to manage content
- **End_User**: A member of the general public browsing the Landing_Page
- **Menu_API**: The Next.js Route Handler at `/api/menu` that serves menu item data
- **Gallery_API**: The Next.js Route Handler at `/api/gallery` that serves gallery photo data
- **Testimonials_API**: The Next.js Route Handler at `/api/testimonials` that serves testimonial data
- **Categories_API**: The Next.js Route Handler at `/api/categories` that serves category data
- **Storage_Adapter**: The configurable image storage module in `src/lib/storage/` that abstracts local, S3-compatible, and Google Drive storage backends
- **Storage_Driver**: The value of the `STORAGE_DRIVER` environment variable (`local`, `s3`, or `gdrive`) that determines which Storage_Adapter is used at runtime
- **MenuItem**: A database record in `menu_items` with fields: id, category_id, title, description, price, image_url, is_best_seller, created_at, updated_at
- **GalleryPhoto**: A database record in `gallery_photos` with fields: id, image_url, alt_text, sort_order, created_at
- **Testimonial**: A database record in `testimonials` with fields: id, author_name, content, rating (1–5), created_at
- **Category**: A database record in `categories` with fields: id, name
- **WhatsApp_CTA**: The WhatsApp call-to-action integration — a persistent floating button and per-menu-item inline button that open a pre-filled WhatsApp chat
- **Lightbox**: A modal overlay that displays a full-size GalleryPhoto when the End_User clicks a gallery thumbnail
- **Best_Seller_Badge**: A visual badge displayed on MenuItem cards where `is_best_seller` is `true`
- **WebP**: The image format that all uploaded images are converted to server-side before storage via Sharp
- **Middleware**: The Next.js middleware at `src/middleware.ts` that intercepts requests to `/admin/*` and redirects unauthenticated requests to the sign-in page
- **DB_Pool**: The `pg` connection pool initialized in `src/lib/db.ts` from environment variables, used exclusively in Route Handlers

---

## Requirements

### Requirement 1: Landing Page Structure and Navigation

**User Story:** As an End_User, I want to browse a single long-scroll page with clearly ordered sections, so that I can discover the coffeeshop's brand, menu, gallery, and contact information in one seamless experience.

#### Acceptance Criteria

1. THE App SHALL render the Landing_Page at the root route (`/`) by composing seven sections in this fixed order: Hero, About Us, Featured Menu, Gallery, Testimonials, Contact & Location, and Footer.
2. WHEN an End_User clicks the CTA button in the Hero section, THE App SHALL smooth-scroll the viewport to the Featured Menu section, which SHALL carry the HTML attribute `id="menu"` as its scroll target.
3. THE Landing_Page SHALL apply the `bg-background` Tailwind token as the background color on the root `<body>` element and all section wrapper elements — no raw hex values SHALL appear in class strings.
4. THE Landing_Page SHALL apply a minimum section padding of `py-20 px-4 md:px-8 lg:px-16` to every section wrapper.
5. THE App SHALL load Poppins (weights 600, 700, 800) and Inter (weights 400, 500) via `next/font/google` and apply them as CSS variables `--font-poppins` and `--font-inter` in the root layout — system fonts SHALL NOT be used for headings.
6. THE App SHALL apply `font-heading` (Poppins) to all `<h1>`, `<h2>`, and `<h3>` elements and `font-body` (Inter) to all `<p>`, `<span>`, `<label>`, `<figcaption>`, and `<caption>` elements.
7. THE App SHALL be fully responsive: layout SHALL be single-column at viewport widths below 768px, two-column at 768–1023px, and multi-column at 1024px and above.
8. THE `src/app/page.tsx` file SHALL only import and compose the seven section components in order — it SHALL NOT contain inline JSX markup, data-fetching logic, or business logic.

---

### Requirement 2: Hero Section

**User Story:** As an End_User, I want to see a visually impactful hero banner when I first land on the page, so that I immediately understand the coffeeshop's brand identity and am invited to explore the menu.

#### Acceptance Criteria

1. THE App SHALL render the Hero section as a full-width, full-viewport-height background image with a `bg-black/40` dark overlay to ensure text readability.
2. THE App SHALL display a headline (`<h1>`) and a sub-headline (`<p>`) within the Hero section using `font-heading` and `font-body` respectively.
3. THE App SHALL render a primary CTA button in the Hero section styled with `rounded-full`, `bg-primary`, `text-white`, `transition-all duration-300 ease-in-out`, `hover:bg-primary-hover`, `hover:shadow-md`, `hover:scale-[1.03]`, and `active:scale-[0.98]`.
4. WHEN the Hero section mounts, THE App SHALL animate the headline and sub-headline with a Framer Motion fade-in and upward drift (`initial: { opacity: 0, y: 30 }`, `animate: { opacity: 1, y: 0 }`, `transition: { duration: 0.5, ease: 'easeOut' }`) with `viewport={{ once: true }}`.
5. THE App SHALL render the Hero section using static, hardcoded content — no API call is required.
6. WHEN an End_User clicks the Hero CTA button, THE App SHALL smooth-scroll the viewport to the element with `id="menu"`.

---

### Requirement 3: About Us Section

**User Story:** As an End_User, I want to read the coffeeshop's brand story and philosophy, so that I can connect with the brand's identity and values before exploring the menu.

#### Acceptance Criteria

1. THE App SHALL render the About Us section with non-empty brand story text, a non-empty philosophy statement, a non-empty unique value proposition, and a supporting photo.
2. THE App SHALL render the supporting photo at a 16:9 aspect ratio using the Next.js `<Image>` component with `object-cover` and a non-empty `alt` attribute.
3. WHEN the About Us section enters the viewport, THE App SHALL animate its content with Framer Motion `whileInView` (`initial: { opacity: 0, y: 30 }`, `animate: { opacity: 1, y: 0 }`, `transition: { duration: 0.5, ease: 'easeOut' }`) with `viewport={{ once: true }}`.
4. THE App SHALL render the About Us section using static, hardcoded content — no API call is required.

---

### Requirement 4: Featured Menu Section

**User Story:** As an End_User, I want to browse the coffeeshop's menu items grouped by category, so that I can quickly find drinks and food that interest me and place an order via WhatsApp.

#### Acceptance Criteria

1. WHEN the Featured Menu section renders, THE App SHALL fetch MenuItem data from `GET /api/menu` and group the results by Category name, displaying one labeled group per Category (Coffee, Non-Coffee, Light Bites).
2. THE App SHALL render each MenuItem as a card styled with `rounded-2xl shadow-sm bg-surface border border-border` and inner padding `p-6`, displaying the item's photo, title, description, and price.
3. THE App SHALL render the MenuItem photo using the Next.js `<Image>` component with `object-cover`, a defined aspect ratio, and an `alt` attribute set to the MenuItem's `title` field.
4. WHEN a MenuItem's `is_best_seller` field is `true`, THE App SHALL render a Best_Seller_Badge on the MenuItem card styled with `bg-secondary text-white text-xs font-medium rounded-full px-3 py-1`.
5. THE App SHALL render a WhatsApp order button on each MenuItem card that, WHEN clicked, opens a new browser tab to `https://wa.me/{NEXT_PUBLIC_WHATSAPP_NUMBER}` with a pre-filled message containing the MenuItem's title.
6. WHEN the Featured Menu section enters the viewport, THE App SHALL animate the card grid using Framer Motion `whileInView` with `staggerChildren: 0.1` on the container and `viewport={{ once: true }}`.
7. IF `GET /api/menu` returns an error or empty array, THEN THE App SHALL render a non-empty fallback message in place of the card grid — the section SHALL NOT render a blank area.
8. THE App SHALL display the MenuItem price formatted as a currency string using the `font-body` Inter font at weight 500.

---

### Requirement 5: Gallery Section

**User Story:** As an End_User, I want to browse an aesthetic photo grid of the coffeeshop, so that I can get a visual feel for the atmosphere and products before visiting.

#### Acceptance Criteria

1. WHEN the Gallery section renders, THE App SHALL fetch GalleryPhoto data from `GET /api/gallery` and display the results as a responsive photo grid ordered by `sort_order` ascending.
2. THE App SHALL render each gallery thumbnail using the Next.js `<Image>` component with `object-cover`, a defined aspect ratio, and an `alt` attribute set to the GalleryPhoto's `alt_text` field.
3. WHEN an End_User clicks a gallery thumbnail, THE App SHALL open a Lightbox modal displaying the full-size version of the selected GalleryPhoto.
4. WHEN the Lightbox is open, THE App SHALL render a close button that, WHEN clicked, dismisses the Lightbox and returns focus to the gallery grid.
5. WHEN the Lightbox is open and the End_User presses the Escape key, THE App SHALL dismiss the Lightbox.
6. WHEN the Gallery section enters the viewport, THE App SHALL animate the photo grid using Framer Motion `whileInView` with `staggerChildren: 0.1` on the container and `viewport={{ once: true }}`.
7. IF `GET /api/gallery` returns an error or empty array, THEN THE App SHALL render a non-empty fallback message in place of the photo grid.

---

### Requirement 6: Testimonials Section

**User Story:** As an End_User, I want to read reviews from other customers, so that I can feel confident about the coffeeshop's quality before visiting.

#### Acceptance Criteria

1. WHEN the Testimonials section renders, THE App SHALL display customer Testimonial data either fetched from `GET /api/testimonials` or from static hardcoded content — at least three Testimonials SHALL be visible.
2. THE App SHALL render each Testimonial as a card styled with `rounded-2xl shadow-sm bg-surface border border-border` and inner padding `p-6`, displaying the `author_name`, `content`, and `rating` fields.
3. THE App SHALL render the `rating` field as a visual star indicator showing the numeric value (1–5).
4. THE App SHALL present Testimonials in either an auto-sliding carousel or a card grid layout — the layout SHALL be responsive and readable on mobile viewports.
5. WHEN the Testimonials section enters the viewport, THE App SHALL animate its content using Framer Motion `whileInView` with `viewport={{ once: true }}`.
6. IF Testimonial data is fetched from `GET /api/testimonials` and the request returns an error, THEN THE App SHALL fall back to rendering static hardcoded Testimonials — the section SHALL NOT render blank.

---

### Requirement 7: Contact & Location Section

**User Story:** As an End_User, I want to find the coffeeshop's address, operating hours, and contact details, so that I can plan a visit or get in touch.

#### Acceptance Criteria

1. THE App SHALL render the Contact & Location section with static, hardcoded content — no API call is required.
2. THE App SHALL embed an interactive Google Maps iframe in the Contact & Location section pointing to the coffeeshop's location.
3. THE App SHALL display the coffeeshop's full street address, operating hours (days and times), phone number, and social media links as static text content.
4. THE App SHALL render social media links as accessible `<a>` elements with `target="_blank"` and `rel="noopener noreferrer"` attributes.
5. WHEN the Contact & Location section enters the viewport, THE App SHALL animate its content using Framer Motion `whileInView` (`initial: { opacity: 0, y: 30 }`, `animate: { opacity: 1, y: 0 }`, `transition: { duration: 0.5, ease: 'easeOut' }`) with `viewport={{ once: true }}`.

---

### Requirement 8: Footer Section

**User Story:** As an End_User, I want to see a footer with copyright information and quick navigation links, so that I can easily jump to any section from the bottom of the page.

#### Acceptance Criteria

1. THE App SHALL render the Footer section with static, hardcoded content — no API call is required.
2. THE App SHALL display the coffeeshop logo, a copyright notice including the current year, and quick navigation links to each of the seven page sections.
3. WHEN an End_User clicks a quick navigation link in the Footer, THE App SHALL smooth-scroll the viewport to the corresponding section.
4. THE Footer SHALL use `bg-primary` (deep espresso brown) as its background color and `text-white` for all text and link elements to maintain brand contrast.

---

### Requirement 9: WhatsApp CTA Integration

**User Story:** As an End_User, I want a persistent and per-item WhatsApp button, so that I can quickly contact the coffeeshop to place an order at any point during my browsing.

#### Acceptance Criteria

1. THE App SHALL render a persistent floating WhatsApp button fixed to the bottom-right corner of the viewport on all pages, visible at all scroll positions.
2. THE App SHALL read the WhatsApp phone number exclusively from the `NEXT_PUBLIC_WHATSAPP_NUMBER` environment variable — the phone number SHALL NOT be hardcoded in any component or source file.
3. WHEN an End_User clicks the floating WhatsApp button, THE App SHALL open a new browser tab to `https://wa.me/{NEXT_PUBLIC_WHATSAPP_NUMBER}` with a pre-filled generic greeting message.
4. WHEN an End_User clicks the per-item WhatsApp button on a MenuItem card, THE App SHALL open a new browser tab to `https://wa.me/{NEXT_PUBLIC_WHATSAPP_NUMBER}` with a pre-filled message that includes the MenuItem's title.
5. THE floating WhatsApp button SHALL be styled as an icon button with `hover:scale-110` and `transition-all duration-300 ease-in-out` — it SHALL NOT use `transition-none`.
6. THE floating WhatsApp button SHALL include a non-empty `aria-label` attribute for screen reader accessibility.
7. IF the `NEXT_PUBLIC_WHATSAPP_NUMBER` environment variable is not set, THEN THE App SHALL NOT render either WhatsApp button — no broken or empty `wa.me` links SHALL appear.

---

### Requirement 10: CMS Admin Dashboard

**User Story:** As an Admin_User, I want a protected dashboard to manage menu items and gallery photos, so that I can update the site's content independently without developer involvement.

#### Acceptance Criteria

1. THE Admin_Dashboard SHALL be accessible only at routes under `/admin/*` — THE Middleware SHALL redirect any unauthenticated request to `/admin/*` to the NextAuth sign-in page at `/api/auth/signin`.
2. THE Admin_Dashboard SHALL provide a Menu management interface where the Admin_User can create, read, update, and delete MenuItems — each MenuItem form SHALL include fields for title, category, description, price, photo upload, and Best Seller toggle.
3. WHEN an Admin_User submits a new or edited MenuItem form with valid data, THE Admin_Dashboard SHALL call the appropriate Menu_API endpoint and reflect the updated data without requiring a full page reload.
4. IF an Admin_User submits a MenuItem form with a missing required field (title or price), THEN THE Admin_Dashboard SHALL display a field-level validation error message and SHALL NOT submit the request to the Menu_API.
5. THE Admin_Dashboard SHALL provide a Gallery management interface where the Admin_User can upload new GalleryPhotos via drag-and-drop and delete existing GalleryPhotos.
6. WHEN an Admin_User uploads a photo via the Gallery management interface, THE Admin_Dashboard SHALL send the file to the Gallery_API, which SHALL convert the image to WebP format via Sharp before passing it to the Storage_Adapter for storage.
7. WHEN an Admin_User deletes a MenuItem or GalleryPhoto, THE Admin_Dashboard SHALL display a confirmation prompt before sending the delete request to the API.
8. THE Admin_Dashboard SHALL use `rounded-lg` for secondary and admin action buttons — it SHALL NOT use `rounded-full` for admin-only UI buttons.
9. THE Admin_Dashboard SHALL apply `bg-surface` (`#FFFFFF`) as the background for admin panels, cards, and form containers.

---

### Requirement 11: Authentication

**User Story:** As an Admin_User, I want to log in with my email and password, so that only I can access and modify the CMS dashboard.

#### Acceptance Criteria

1. THE App SHALL implement authentication using NextAuth.js with the Credentials provider, accepting an email address and a bcrypt-hashed password stored in the `admins` database table.
2. WHEN an Admin_User submits valid credentials on the sign-in page, THE App SHALL create a server-side session stored in an httpOnly cookie and redirect the Admin_User to `/admin`.
3. IF an Admin_User submits invalid credentials, THEN THE App SHALL display a non-empty error message on the sign-in page and SHALL NOT create a session.
4. THE Middleware SHALL protect all routes matching `/admin/*` by verifying the NextAuth session token — unauthenticated requests SHALL be redirected to `/api/auth/signin`.
5. WHEN an Admin_User clicks the sign-out action, THE App SHALL invalidate the session and redirect the Admin_User to the Landing_Page at `/`.
6. THE App SHALL store the `NEXTAUTH_SECRET` value exclusively in the `.env` file — it SHALL NOT be hardcoded in any source file or committed to version control.

---

### Requirement 12: API Route Handlers

**User Story:** As a developer, I want well-defined API endpoints for all data resources, so that the frontend and admin dashboard can reliably fetch and mutate content.

#### Acceptance Criteria

1. THE Menu_API SHALL handle `GET /api/menu` requests without authentication and return a JSON array of all MenuItems joined with their Category name, ordered by category then by title.
2. THE Menu_API SHALL handle `POST /api/menu` requests and `PUT /api/menu/[id]` requests only after verifying a valid NextAuth session — IF no valid session exists, THEN THE Menu_API SHALL return HTTP 401.
3. THE Menu_API SHALL handle `DELETE /api/menu/[id]` requests only after verifying a valid NextAuth session — IF no valid session exists, THEN THE Menu_API SHALL return HTTP 401.
4. THE Gallery_API SHALL handle `GET /api/gallery` requests without authentication and return a JSON array of all GalleryPhotos ordered by `sort_order` ascending.
5. THE Gallery_API SHALL handle `POST /api/gallery` and `DELETE /api/gallery/[id]` requests only after verifying a valid NextAuth session — IF no valid session exists, THEN THE Gallery_API SHALL return HTTP 401.
6. THE Testimonials_API SHALL handle `GET /api/testimonials` requests without authentication and return a JSON array of all Testimonials ordered by `created_at` descending.
7. THE Categories_API SHALL handle `GET /api/categories` requests without authentication and return a JSON array of all Categories ordered by name ascending.
8. IF any Route Handler encounters a database error, THEN THE Route Handler SHALL return HTTP 500 with a JSON error body — it SHALL NOT expose raw SQL error messages or stack traces in the response.
9. THE App SHALL execute all database queries through the DB_Pool in `src/lib/db.ts` using parameterized queries — no Route Handler SHALL construct SQL strings by concatenating user-supplied input.

---

### Requirement 13: Image Storage

**User Story:** As a developer, I want image storage to be configurable via environment variables, so that the application can run on local Docker volumes, S3-compatible buckets, or Google Drive without code changes.

#### Acceptance Criteria

1. THE Storage_Adapter SHALL be resolved at runtime by reading the `STORAGE_DRIVER` environment variable — the value `local` SHALL use the local volume adapter, `s3` SHALL use the S3-compatible adapter, and `gdrive` SHALL use the Google Drive adapter.
2. THE App SHALL resolve the Storage_Adapter exactly once in `src/lib/storage/index.ts` — Route Handlers SHALL call the Storage_Adapter interface and SHALL NOT import or reference a specific adapter implementation directly.
3. WHEN an image is uploaded through any Route Handler, THE Route Handler SHALL pass the raw image buffer to Sharp for conversion to WebP format before passing the converted buffer to the Storage_Adapter.
4. THE Storage_Adapter SHALL return a publicly accessible URL string after a successful upload — this URL SHALL be stored in the `image_url` field of the corresponding database record.
5. IF the `STORAGE_DRIVER` environment variable is set to `s3`, THEN THE Storage_Adapter SHALL read `S3_ENDPOINT`, `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY`, and `S3_SECRET_KEY` exclusively from environment variables — no S3 credentials SHALL be hardcoded.
6. IF the `STORAGE_DRIVER` environment variable is set to `gdrive`, THEN THE Storage_Adapter SHALL read `GDRIVE_FOLDER_ID` and `GDRIVE_SERVICE_ACCOUNT_JSON` exclusively from environment variables.
7. IF the `STORAGE_DRIVER` environment variable is set to `local`, THEN THE Storage_Adapter SHALL read `STORAGE_LOCAL_PATH` from environment variables and write files to that path — it SHALL NOT use a hardcoded file system path.
8. IF the `STORAGE_DRIVER` environment variable is absent or set to an unrecognized value, THEN THE App SHALL throw a descriptive configuration error at startup — it SHALL NOT silently fall back to any default driver.

---

### Requirement 14: Database

**User Story:** As a developer, I want a PostgreSQL database with a version-controlled schema, so that all data is persisted reliably and schema changes are explicit and auditable.

#### Acceptance Criteria

1. THE App SHALL use PostgreSQL as its sole database, with all connection parameters (`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_SSL`) read exclusively from environment variables — no connection parameter SHALL be hardcoded.
2. THE App SHALL initialize the database schema by executing the SQL migration file at `db/migrations/001_init_schema.sql`, which SHALL create five tables: `admins`, `categories`, `menu_items`, `gallery_photos`, and `testimonials` using `CREATE TABLE IF NOT EXISTS` statements.
3. THE `admins` table SHALL store admin email addresses and bcrypt-hashed passwords — plaintext passwords SHALL NOT be stored.
4. THE `menu_items` table SHALL reference `categories` via a foreign key (`category_id`) with `ON DELETE SET NULL` behavior.
5. THE `testimonials` table SHALL enforce a `CHECK` constraint on the `rating` column restricting values to integers between 1 and 5 inclusive.
6. THE App SHALL manage all schema changes through versioned SQL migration files in `db/migrations/` — no ORM or auto-migration tool SHALL be used.
7. THE DB_Pool SHALL be imported and used exclusively in Route Handlers — it SHALL NOT be imported in Client Components, Server Components, or edge middleware.

---

### Requirement 15: Docker and Deployment

**User Story:** As a developer, I want the application containerized with Docker and orchestrated via Docker Compose, so that it can be deployed consistently across environments without manual server configuration.

#### Acceptance Criteria

1. THE App SHALL include a multi-stage `Dockerfile` at the project root with three stages: `deps` (install dependencies), `builder` (Next.js production build), and `runner` (production runtime using `node:20-alpine`).
2. THE `next.config.ts` file SHALL include `output: 'standalone'` to enable the standalone build required by the multi-stage Dockerfile.
3. THE `docker-compose.yml` file SHALL define two services: `db` (using `postgres:16-alpine`) and `app` (using the built Next.js image), with the `app` service declaring `depends_on: [db]`.
4. THE `docker-compose.yml` file SHALL inject all configuration via `env_file: .env` — no environment variable values SHALL be hardcoded in `docker-compose.yml`.
5. THE Dockerfile SHALL NOT copy the `.env` file into the Docker image — all environment variables SHALL be injected at container runtime.
6. THE `.gitignore` and `.dockerignore` files SHALL both include `.env`, `node_modules`, `.next`, and `uploads/` to prevent secrets and build artifacts from being committed or copied into the image.
7. WHEN `STORAGE_DRIVER` is set to `local`, THE `docker-compose.yml` SHALL mount a named volume `uploads_data` to `/app/uploads` in the `app` service to persist uploaded files across container restarts.
8. THE `docker-compose.yml` SHALL mount a named volume `postgres_data` to `/var/lib/postgresql/data` in the `db` service to persist database data across container restarts.

---

### Requirement 16: SEO and Performance

**User Story:** As a developer, I want the site to achieve a Lighthouse score of 85 or above and follow SEO best practices, so that the coffeeshop is discoverable and loads quickly for all users.

#### Acceptance Criteria

1. THE App SHALL achieve a Lighthouse performance score of 85 or above on the Landing_Page when measured in a production build.
2. THE App SHALL use the Next.js `metadata` API in `src/app/layout.tsx` to define a non-empty `title`, `description`, and Open Graph `og:title` and `og:description` for the Landing_Page.
3. THE App SHALL use semantic HTML5 elements — `<header>`, `<main>`, `<section>`, `<article>`, `<footer>`, `<nav>` — in the appropriate structural roles throughout the Landing_Page.
4. THE App SHALL render all images using the Next.js `<Image>` component, which SHALL handle WebP format delivery and lazy loading automatically — raw `<img>` tags SHALL NOT be used for content images.
5. THE App SHALL provide a non-empty `alt` attribute on every `<Image>` component — for MenuItem images the `alt` SHALL be set to the MenuItem's `title` field; for GalleryPhoto images the `alt` SHALL be set to the GalleryPhoto's `alt_text` field.
6. THE App SHALL register all brand colors and fonts as Tailwind design tokens in `tailwind.config.ts` — raw hex color values SHALL NOT appear in component class strings.
7. THE `next.config.ts` file SHALL include `remotePatterns` entries for all configured storage domains (S3 endpoint, Google Drive CDN) to allow the Next.js `<Image>` component to optimize remote images.

---

### Requirement 17: Property-Based Testing

**User Story:** As a developer, I want property-based tests for API response shapes, data integrity rules, and storage adapter behavior, so that correctness is verified across a wide range of inputs rather than only hand-picked examples.

#### Acceptance Criteria

1. THE App SHALL include property-based tests verifying that for any valid array of MenuItem objects returned by `GET /api/menu`, each object contains the required fields: `id` (integer), `title` (non-empty string), `price` (positive number), `category_id` (integer), `is_best_seller` (boolean).
2. THE App SHALL include property-based tests verifying that for any valid array of GalleryPhoto objects returned by `GET /api/gallery`, the array is ordered by `sort_order` ascending — that is, for any two consecutive items `a` and `b`, `a.sort_order <= b.sort_order`.
3. THE App SHALL include property-based tests verifying that for any Testimonial object, the `rating` field is an integer satisfying `1 <= rating <= 5`.
4. THE App SHALL include a round-trip property test for the Storage_Adapter interface: for any valid image buffer input, uploading the buffer and then fetching the returned URL SHALL yield a response with HTTP 200 and a non-empty body — `upload(buffer)` followed by `fetch(url)` SHALL succeed.
5. THE App SHALL include property-based tests verifying that the Sharp WebP conversion function is idempotent with respect to output format: for any input image buffer, converting to WebP and then converting the result to WebP again SHALL produce an output with the same MIME type (`image/webp`) as the first conversion.
6. THE App SHALL include property-based tests verifying that parameterized SQL queries in Route Handlers correctly reject SQL injection payloads — for any string input containing SQL metacharacters, the query SHALL return zero rows or a validation error rather than executing injected SQL.
7. THE App SHALL include property-based tests verifying the MenuItem price invariant: for any MenuItem record stored and then retrieved from the database, the retrieved `price` value SHALL equal the stored value with no floating-point drift (stored as `NUMERIC(10,2)`).
