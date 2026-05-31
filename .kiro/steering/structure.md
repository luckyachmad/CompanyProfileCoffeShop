---
inclusion: always
---

# Project Structure

## Overview

Single Next.js project — frontend, API routes, and admin dashboard all colocated. No separate backend service.

```
CompanyProfileCoffeeShop/
├── public/
│   ├── images/                        # Local static assets (logo, placeholders, icons)
│   └── icons/
│
├── src/
│   ├── app/                           # Next.js App Router
│   │   ├── layout.tsx                 # Root layout (fonts, global providers)
│   │   ├── page.tsx                   # Landing page — composes all 7 sections in order
│   │   │
│   │   ├── admin/                     # CMS dashboard (protected by NextAuth middleware)
│   │   │   ├── layout.tsx             # Admin shell layout (sidebar, auth guard)
│   │   │   ├── page.tsx               # Admin home / dashboard overview
│   │   │   ├── menu/
│   │   │   │   └── page.tsx           # Menu CRUD UI
│   │   │   └── gallery/
│   │   │       └── page.tsx           # Gallery upload / delete UI
│   │   │
│   │   └── api/                       # Next.js Route Handlers (backend)
│   │       ├── auth/
│   │       │   └── [...nextauth]/
│   │       │       └── route.ts       # NextAuth handler
│   │       ├── menu/
│   │       │   ├── route.ts           # GET (public), POST (admin)
│   │       │   └── [id]/
│   │       │       └── route.ts       # PUT, DELETE (admin)
│   │       ├── categories/
│   │       │   └── route.ts           # GET (public), POST/DELETE (admin)
│   │       ├── gallery/
│   │       │   ├── route.ts           # GET (public), POST (admin)
│   │       │   └── [id]/
│   │       │       └── route.ts       # DELETE (admin)
│   │       └── testimonials/
│   │           └── route.ts           # GET (public), POST/DELETE (admin)
│   │
│   ├── components/
│   │   ├── ui/                        # Generic reusable elements
│   │   │   ├── Button.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Lightbox.tsx           # Modal image viewer for Gallery section
│   │   │   └── WhatsAppButton.tsx     # Floating + inline WA CTA button
│   │   └── sections/                  # One component per landing page section
│   │       ├── Hero.tsx
│   │       ├── About.tsx
│   │       ├── Menu.tsx               # Fetches from /api/menu
│   │       ├── Gallery.tsx            # Fetches from /api/gallery
│   │       ├── Testimonials.tsx
│   │       ├── Contact.tsx
│   │       └── Footer.tsx
│   │
│   ├── lib/
│   │   ├── db.ts                      # pg Pool — initialized from env vars, used in Route Handlers only
│   │   ├── auth.ts                    # NextAuth config (Credentials provider, session callbacks)
│   │   └── storage/
│   │       ├── index.ts               # Factory: reads STORAGE_DRIVER, returns correct adapter
│   │       ├── localAdapter.ts        # Saves files to local volume
│   │       ├── s3Adapter.ts           # Uploads to S3-compatible bucket
│   │       └── gdriveAdapter.ts       # Uploads to Google Drive folder
│   │
│   ├── types/                         # Shared TypeScript interfaces
│   │   ├── menu.ts                    # MenuItem, Category
│   │   ├── gallery.ts                 # GalleryPhoto
│   │   └── testimonial.ts             # Testimonial
│   │
│   ├── styles/
│   │   └── globals.css                # Tailwind base imports, CSS font vars, global resets
│   │
│   └── middleware.ts                  # NextAuth middleware — protects /admin/* routes
│
├── db/
│   ├── migrations/
│   │   └── 001_init_schema.sql        # Full schema: all 5 tables
│   └── seeds/
│       └── 001_seed_admin.sql         # Initial admin account (bcrypt-hashed password)
│
├── .env                               # Runtime secrets — NEVER commit
├── .env.example                       # Template for all required env vars — safe to commit
├── .dockerignore
├── .gitignore                         # Must include: .env, node_modules, .next, uploads/
├── Dockerfile                         # Multi-stage Next.js build → standalone runtime
├── docker-compose.yml                 # Services: app + db; volumes: postgres_data, uploads_data
├── next.config.ts                     # Must include output: 'standalone' for Docker
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Naming Conventions

- **Components**: PascalCase filenames, one component per file (`MenuCard.tsx`, `GalleryGrid.tsx`)
- **Route Handlers**: `route.ts` inside descriptive folder names matching the resource
- **Lib / utilities**: camelCase (`db.ts`, `auth.ts`, `s3Adapter.ts`)
- **Types**: PascalCase interface names in dedicated files per domain (`MenuItem`, `GalleryPhoto`)
- **DB migration files**: zero-padded numeric prefix + description (`001_init_schema.sql`, `002_add_sort_order.sql`)
- **Public images**: kebab-case descriptive filenames (`hero-background.webp`, `menu-latte.webp`)
- **CSS**: Tailwind utility classes only; avoid custom CSS unless Tailwind cannot cover the case

---

## Routing & Page Rules

- `app/page.tsx` is the landing page — thin file that only imports and composes section components in order
- `app/admin/**` routes are protected — `src/middleware.ts` redirects unauthenticated requests to `/api/auth/signin`
- Public API routes (`GET /api/menu`, `GET /api/gallery`, etc.) require no auth
- Admin-mutating API routes (`POST`, `PUT`, `DELETE`) must verify the NextAuth session inside the Route Handler

---

## Data Fetching Rules

| Context | Method | Notes |
|---------|--------|-------|
| Server Components (landing page sections) | `fetch()` with `next: { revalidate }` | Cached, revalidated on interval or on-demand |
| Client Components (admin dashboard) | SWR or `fetch` in `useEffect` | For interactive CRUD UI |
| Route Handlers | `pool.query()` from `src/lib/db.ts` | Direct SQL — no ORM |

- Never import `src/lib/db.ts` in Client Components or edge middleware — it is Node.js only
- Never inline SQL in components — all queries go through Route Handlers

---

## Key Sections → Component & API Mapping

| Section            | Component                   | API Endpoint              | Data Source          |
|--------------------|-----------------------------|---------------------------|----------------------|
| Hero               | `sections/Hero.tsx`         | —                         | Static / hardcoded   |
| About Us           | `sections/About.tsx`        | —                         | Static / hardcoded   |
| Featured Menu      | `sections/Menu.tsx`         | `GET /api/menu`           | PostgreSQL (dynamic) |
| Gallery            | `sections/Gallery.tsx`      | `GET /api/gallery`        | PostgreSQL (dynamic) |
| Testimonials       | `sections/Testimonials.tsx` | `GET /api/testimonials`   | Static or PostgreSQL |
| Contact & Location | `sections/Contact.tsx`      | —                         | Static / hardcoded   |
| Footer             | `sections/Footer.tsx`       | —                         | Static / hardcoded   |
| WhatsApp Button    | `ui/WhatsAppButton.tsx`     | —                         | `NEXT_PUBLIC_WHATSAPP_NUMBER` |

---

## UI/UX Implementation Rules

These rules apply to every component. See `product.md` Design System section for the full spec.

- **Background**: Root `<body>` and all section wrappers use `bg-background` (`#F5F0E8`). Never use plain white as a page background.
- **Fonts**: Apply `font-heading` (Poppins) to all `<h1>`–`<h3>` elements. Apply `font-body` (Inter) to all `<p>`, descriptions, and labels. Font CSS vars are set in `src/app/layout.tsx` via `next/font/google`.
- **Buttons**: Every `<button>` and `<a>` styled as a button must include `transition-all duration-300 ease-in-out`. Primary CTAs use `rounded-full`. No button may have `transition-none`.
- **Cards**: Use `rounded-2xl shadow-sm bg-surface border border-border` as the base for all menu and testimonial cards.
- **Images**: All `<Image>` components use `object-cover` with explicit `width`/`height` or `fill`. Hero images have a `bg-black/40` overlay div for text contrast.
- **Animations**: Wrap animatable section content in Framer Motion `<motion.div whileInView>`. Use `viewport={{ once: true }}` to prevent re-triggering. Stagger card grids with `staggerChildren: 0.1`.
- **Spacing**: Section padding minimum `py-20 px-4 md:px-8 lg:px-16`. Never collapse sections together without visual breathing room.

---

## next.config.ts Requirements

```ts
const nextConfig = {
  output: 'standalone',          // required for Docker multi-stage build
  images: {
    remotePatterns: [
      // add storage domain patterns here (S3 endpoint, GDrive CDN, etc.)
    ],
  },
};
export default nextConfig;
```

---

## Environment Variables

All variables in `.env` at project root. See `tech.md` for the full reference.

**Critical rules:**
- `.env` is in `.gitignore` and `.dockerignore` — never committed, never copied into Docker image
- Client-accessible vars must be prefixed `NEXT_PUBLIC_`
- Server-only vars (DB, storage, auth secrets) have no prefix and are never exposed to the browser
- `.env.example` must be updated whenever a new variable is added
