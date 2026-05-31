---
inclusion: always
---

# Tech Stack

## Architecture Overview

This project is a **Next.js full-stack application** — frontend, backend API routes, and server-side rendering all live in a single Next.js project. No separate Express server.

- **Frontend**: Next.js App Router (React Server Components + Client Components)
- **Backend**: Next.js Route Handlers (`app/api/**`) — replaces Express
- **Database**: PostgreSQL — connection configured entirely via environment variables
- **Image Storage**: Externally configurable — supports local volume, S3-compatible bucket (MinIO, Backblaze B2, Cloudflare R2, AWS S3), or Google Drive API
- **Deployment**: Docker container pushed to Docker Hub; orchestrated via Docker Compose

---

## Core Stack

| Layer              | Choice                        | Notes                                                                 |
|--------------------|-------------------------------|-----------------------------------------------------------------------|
| Framework          | Next.js 14+ (App Router)      | Full-stack: SSR, SSG, API routes, React Server Components             |
| Language           | TypeScript                    | Strict mode; shared types across app and API layers                   |
| Styling            | Tailwind CSS                  | Utility-first, fully responsive; design tokens in `tailwind.config.ts`            |
| Fonts              | Poppins + Inter (Google Fonts)| Via `next/font/google`; Poppins for headings, Inter for body text                 |
| Animation          | Framer Motion                 | `whileInView` scroll animations, stagger children, button hover transitions       |
| Database           | PostgreSQL                    | Relational; schema initialized via SQL scripts                        |
| DB Client          | `pg` (node-postgres)          | Direct SQL queries in Route Handlers; no ORM                          |
| Auth (Admin)       | NextAuth.js (Credentials)     | Session-based admin login; protects `/admin` routes via middleware    |
| Image Processing   | Sharp                         | Server-side WebP conversion and resizing before storage               |
| Image Storage      | Configurable (see below)      | Local volume / S3-compatible / Google Drive — set via env vars        |
| HTTP Client        | Native `fetch` / SWR          | Server Components use `fetch`; Client Components use SWR for revalidation |
| Containerization   | Docker + Docker Compose       | Single Next.js image + PostgreSQL service                             |

---

## Tailwind Design Tokens (`tailwind.config.ts`)

All brand colors and fonts must be registered as Tailwind tokens — never use raw hex values in component classes.

```ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#F5F0E8',       // soft beige — page background
        surface:    '#FFFFFF',       // white — cards, modals
        primary: {
          DEFAULT: '#3B1F0A',        // deep espresso brown
          hover:   '#5C3317',        // warm mid-brown
        },
        secondary:  '#C8A97E',       // caramel/gold — badges, accents
        border:     '#E2D9CC',       // warm light gray — card borders
        text: {
          primary: '#1C1C1C',        // near-black charcoal
          muted:   '#6B6B6B',        // warm gray — descriptions, captions
        },
      },
      fontFamily: {
        heading: ['var(--font-poppins)', 'sans-serif'],
        body:    ['var(--font-inter)',   'sans-serif'],
      },
      borderRadius: {
        card: '1rem',                // rounded-2xl equivalent for cards
      },
      transitionDuration: {
        DEFAULT: '300ms',
      },
      transitionTimingFunction: {
        DEFAULT: 'ease-in-out',
      },
    },
  },
  plugins: [],
};
export default config;
```

Use tokens in components: `bg-background`, `text-primary`, `font-heading`, `border-border`, etc.

---

## Image Storage Configuration

Storage driver is read from `STORAGE_DRIVER` env var at runtime. Never hardcode storage paths or credentials.

| `STORAGE_DRIVER` | Target                                | Required env vars                                                                  |
|------------------|---------------------------------------|------------------------------------------------------------------------------------|
| `local`          | Docker volume (mapped host directory) | `STORAGE_LOCAL_PATH=/app/uploads`                                                  |
| `s3`             | S3-compatible (MinIO, R2, B2, AWS S3) | `S3_ENDPOINT`, `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`         |
| `gdrive`         | Google Drive API                      | `GDRIVE_FOLDER_ID`, `GDRIVE_SERVICE_ACCOUNT_JSON` (path to service account file)  |

Storage adapter is resolved once in `src/lib/storage/index.ts` — Route Handlers call the adapter interface, never a specific driver directly.

---

## Database Configuration

All DB connection parameters come from environment variables — no hardcoded values anywhere.

```env
DB_HOST=db
DB_PORT=5432
DB_NAME=coffeeshop
DB_USER=coffeeshop_user
DB_PASSWORD=your_secure_password
DB_SSL=false          # set to true for managed cloud DBs
```

DB pool initialization (`src/lib/db.ts`):
```ts
import { Pool } from 'pg';
export const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});
```

This pool is imported by Route Handlers only — never used in Client Components or Server Components that run on the edge.

---

## Database Initialization (SQL-First)

Schema is managed via plain SQL scripts in `db/migrations/`. No ORM, no auto-migration — all schema changes are explicit and version-controlled.

### Step-by-Step: First-Time Table Generation

1. **Start PostgreSQL** (via Docker Compose):
   ```bash
   docker compose up -d db
   ```

2. **Create the database and user** (run once, or let Docker init handle it):
   ```sql
   CREATE DATABASE coffeeshop;
   CREATE USER coffeeshop_user WITH ENCRYPTED PASSWORD 'your_secure_password';
   GRANT ALL PRIVILEGES ON DATABASE coffeeshop TO coffeeshop_user;
   ```

3. **Run the base schema**:
   ```bash
   psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f db/migrations/001_init_schema.sql
   ```

4. **Run seed data** (initial admin account + sample categories):
   ```bash
   psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f db/seeds/001_seed_admin.sql
   ```

5. **Verify tables**:
   ```bash
   psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "\dt"
   ```

### SQL Schema Reference (`db/migrations/001_init_schema.sql`)

```sql
-- Admin users for CMS dashboard
CREATE TABLE IF NOT EXISTS admins (
  id          SERIAL PRIMARY KEY,
  email       VARCHAR(255) UNIQUE NOT NULL,
  password    TEXT NOT NULL,             -- bcrypt hash
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Menu categories
CREATE TABLE IF NOT EXISTS categories (
  id    SERIAL PRIMARY KEY,
  name  VARCHAR(100) UNIQUE NOT NULL     -- 'Coffee', 'Non-Coffee', 'Light Bites'
);

-- Menu items
CREATE TABLE IF NOT EXISTS menu_items (
  id             SERIAL PRIMARY KEY,
  category_id    INT REFERENCES categories(id) ON DELETE SET NULL,
  title          VARCHAR(255) NOT NULL,
  description    TEXT,
  price          NUMERIC(10, 2) NOT NULL,
  image_url      TEXT,                   -- URL returned by storage adapter
  is_best_seller BOOLEAN DEFAULT FALSE,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Gallery photos
CREATE TABLE IF NOT EXISTS gallery_photos (
  id          SERIAL PRIMARY KEY,
  image_url   TEXT NOT NULL,
  alt_text    VARCHAR(255),
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Testimonials
CREATE TABLE IF NOT EXISTS testimonials (
  id          SERIAL PRIMARY KEY,
  author_name VARCHAR(255) NOT NULL,
  content     TEXT NOT NULL,
  rating      SMALLINT CHECK (rating BETWEEN 1 AND 5),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Docker Build & Push to Docker Hub

### Step-by-Step

1. **Build the Next.js production image**:
   ```bash
   docker build -t your-dockerhub-username/coffeeshop-app:latest .
   ```

2. **Login to Docker Hub**:
   ```bash
   docker login
   ```

3. **Push the image**:
   ```bash
   docker push your-dockerhub-username/coffeeshop-app:latest
   ```

4. **Tag a versioned release** (alongside `latest`):
   ```bash
   docker tag your-dockerhub-username/coffeeshop-app:latest your-dockerhub-username/coffeeshop-app:v1.0.0
   docker push your-dockerhub-username/coffeeshop-app:v1.0.0
   ```

### Dockerfile (`Dockerfile` at project root)

Multi-stage build — keeps the final image small:

```dockerfile
# Stage 1: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Stage 2: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Stage 3: Production runtime
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

> Requires `output: 'standalone'` in `next.config.ts` for the standalone build to work.

Never copy `.env` into the image — inject all env vars at runtime.

---

## Docker Compose

`docker-compose.yml` at project root. All config injected via `.env` — nothing hardcoded.

```yaml
services:
  db:
    image: postgres:16-alpine
    env_file: .env
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./db/migrations:/docker-entrypoint-initdb.d   # auto-runs schema on first start

  app:
    image: your-dockerhub-username/coffeeshop-app:latest
    env_file: .env
    depends_on: [db]
    ports: ["3000:3000"]
    volumes:
      - uploads_data:/app/uploads       # only active when STORAGE_DRIVER=local

volumes:
  postgres_data:
  uploads_data:
```

---

## Common Commands

```bash
# --- Development ---
npm install                  # install dependencies
npm run dev                  # start Next.js dev server (http://localhost:3000)

# --- Database ---
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f db/migrations/001_init_schema.sql
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f db/seeds/001_seed_admin.sql
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "\dt"

# --- Build ---
npm run build                # Next.js production build
npm run start                # start production server locally

# --- Lint / Type check ---
npm run lint
npx tsc --noEmit

# --- Docker ---
docker compose up -d         # start all services (db + app)
docker compose down          # stop all services
docker compose logs -f app   # tail app logs
docker build -t <hub-user>/coffeeshop-app:latest .
docker push <hub-user>/coffeeshop-app:latest
```

---

## Quality Targets

- **Lighthouse score**: 85+ — Next.js Image component handles WebP conversion and lazy loading
- **Responsive**: Mobile, Tablet, Desktop breakpoints via Tailwind
- **SEO**: Next.js `metadata` API for meta title, description, Open Graph; semantic HTML5; `alt` on menu images from `menu_items.title`
- **Security**: HTTPS enforced; NextAuth sessions in httpOnly cookies; DB credentials and storage keys in env vars only; no secrets in Docker image

---

## Environment Variables Reference

All variables in `.env` (never committed). Keep `.env.example` in sync.

```env
# App
NODE_ENV=production
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your_nextauth_secret_min_32_chars

# Database
DB_HOST=db
DB_PORT=5432
DB_NAME=coffeeshop
DB_USER=coffeeshop_user
DB_PASSWORD=your_secure_password
DB_SSL=false

# WhatsApp
NEXT_PUBLIC_WHATSAPP_NUMBER=628xxxxxxxxxx

# Storage
STORAGE_DRIVER=local              # local | s3 | gdrive
STORAGE_LOCAL_PATH=/app/uploads

# S3-compatible (if STORAGE_DRIVER=s3)
S3_ENDPOINT=https://s3.example.com
S3_BUCKET=coffeeshop-media
S3_REGION=auto
S3_ACCESS_KEY=your_access_key
S3_SECRET_KEY=your_secret_key

# Google Drive (if STORAGE_DRIVER=gdrive)
GDRIVE_FOLDER_ID=your_folder_id
GDRIVE_SERVICE_ACCOUNT_JSON=/run/secrets/gdrive_sa.json

# PostgreSQL Docker image vars
POSTGRES_DB=coffeeshop
POSTGRES_USER=coffeeshop_user
POSTGRES_PASSWORD=your_secure_password
```

> Frontend-accessible vars must be prefixed `NEXT_PUBLIC_`. All others are server-only.
