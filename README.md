# CompanyProfileCoffeeShop

A modern branding and digital catalog website for a coffee shop, built with **Next.js 14+ (App Router)** as a full-stack application. The owner can manage menu items and gallery photos independently via a built-in CMS dashboard — no developer needed for content updates.

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 14+ (App Router, TypeScript) |
| Styling | Tailwind CSS |
| Fonts | Poppins (headings) + Inter (body) via `next/font/google` |
| Animation | Framer Motion |
| Database | PostgreSQL |
| Auth | NextAuth.js (Credentials) |
| Image Storage | Configurable — local volume / S3-compatible / Google Drive |
| Containerization | Docker + Docker Compose |

---

## Prerequisites

- [Node.js 20+](https://nodejs.org/)
- [Docker](https://www.docker.com/) and Docker Compose
- [psql](https://www.postgresql.org/docs/current/app-psql.html) CLI (for manual DB init)
- A Docker Hub account (for pushing images)

---

## Quick Start (Local Development)

### 1. Clone and install dependencies

```bash
git clone https://github.com/your-username/CompanyProfileCoffeeShop.git
cd CompanyProfileCoffeeShop
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in all required values. At minimum for local dev:

```env
NODE_ENV=development
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=any_random_string_min_32_chars

DB_HOST=localhost
DB_PORT=5432
DB_NAME=coffeeshop
DB_USER=coffeeshop_user
DB_PASSWORD=your_password
DB_SSL=false

NEXT_PUBLIC_WHATSAPP_NUMBER=628xxxxxxxxxx

STORAGE_DRIVER=local
STORAGE_LOCAL_PATH=./uploads
```

### 3. Start the database

```bash
docker compose up -d db
```

### 4. Initialize the database schema

Run this once on first setup:

```bash
psql -h localhost -U coffeeshop_user -d coffeeshop -f db/migrations/001_init_schema.sql
```

Seed the initial admin account:

```bash
psql -h localhost -U coffeeshop_user -d coffeeshop -f db/seeds/001_seed_admin.sql
```

Verify tables were created:

```bash
psql -h localhost -U coffeeshop_user -d coffeeshop -c "\dt"
```

### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — landing page.  
Open [http://localhost:3000/admin](http://localhost:3000/admin) — CMS dashboard.

---

## Deployment (Docker)

### 1. Configure production environment

Copy and fill in `.env` with production values — especially:

```env
NODE_ENV=production
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=strong_random_secret_min_32_chars
DB_HOST=db
DB_PASSWORD=strong_production_password
STORAGE_DRIVER=s3   # or local / gdrive
```

> Never commit `.env` to version control. It is listed in `.gitignore` and `.dockerignore`.

### 2. Build the Docker image

```bash
docker build -t your-dockerhub-username/coffeeshop-app:latest .
```

### 3. Push to Docker Hub

```bash
docker login
docker push your-dockerhub-username/coffeeshop-app:latest

# Optional: tag a versioned release
docker tag your-dockerhub-username/coffeeshop-app:latest your-dockerhub-username/coffeeshop-app:v1.0.0
docker push your-dockerhub-username/coffeeshop-app:v1.0.0
```

### 4. Deploy with Docker Compose

Update the image name in `docker-compose.yml` to match your Docker Hub username, then run:

```bash
docker compose up -d
```

This starts two services:
- `db` — PostgreSQL 16 (data persisted in `postgres_data` volume)
- `app` — Next.js app on port `3000`

### 5. Initialize the database (first deploy only)

The `db/migrations/` folder is mounted to PostgreSQL's `docker-entrypoint-initdb.d/` — the schema runs automatically on the very first container start.

To run it manually if needed:

```bash
docker compose exec db psql -U coffeeshop_user -d coffeeshop -f /docker-entrypoint-initdb.d/001_init_schema.sql
```

Seed the admin account:

```bash
docker compose exec db psql -U coffeeshop_user -d coffeeshop -f /docker-entrypoint-initdb.d/../seeds/001_seed_admin.sql
```

### 6. Verify the deployment

```bash
docker compose ps          # check both services are running
docker compose logs -f app # tail app logs
```

Open `https://yourdomain.com` in a browser.

---

## Image Storage Options

Set `STORAGE_DRIVER` in `.env` to one of:

| Driver | Description | Required vars |
|--------|-------------|---------------|
| `local` | Saves to a Docker volume on the host | `STORAGE_LOCAL_PATH=/app/uploads` |
| `s3` | Any S3-compatible bucket (AWS S3, Cloudflare R2, MinIO, Backblaze B2) | `S3_ENDPOINT`, `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY`, `S3_SECRET_KEY` |
| `gdrive` | Google Drive folder via service account | `GDRIVE_FOLDER_ID`, `GDRIVE_SERVICE_ACCOUNT_JSON` |

For production, `s3` is recommended — images are served via CDN and don't consume server disk space.

---

## Common Commands

```bash
# Development
npm run dev              # start dev server
npm run build            # production build
npm run start            # start production server locally
npm run lint             # lint
npx tsc --noEmit         # type check

# Docker
docker compose up -d     # start all services
docker compose down      # stop all services
docker compose logs -f   # tail all logs

# Database
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f db/migrations/001_init_schema.sql
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f db/seeds/001_seed_admin.sql
```

---

## Project Structure

```
CompanyProfileCoffeeShop/
├── src/
│   ├── app/                  # Next.js App Router (pages + API routes)
│   │   ├── page.tsx          # Landing page (7 sections)
│   │   ├── admin/            # CMS dashboard (protected)
│   │   └── api/              # Route Handlers (menu, gallery, auth, etc.)
│   ├── components/
│   │   ├── sections/         # Hero, About, Menu, Gallery, Testimonials, Contact, Footer
│   │   └── ui/               # Button, Card, Badge, Lightbox, WhatsAppButton
│   ├── lib/
│   │   ├── db.ts             # PostgreSQL pool
│   │   ├── auth.ts           # NextAuth config
│   │   └── storage/          # Pluggable image storage adapters
│   └── types/                # Shared TypeScript interfaces
├── db/
│   ├── migrations/           # SQL schema scripts (run in order)
│   └── seeds/                # Initial data (admin account, categories)
├── public/                   # Static assets
├── .env.example              # Environment variable template
├── Dockerfile                # Multi-stage Next.js build
└── docker-compose.yml        # App + DB services
```

---

## Environment Variables Reference

See `.env.example` for the full list. Key variables:

| Variable | Description |
|----------|-------------|
| `NEXTAUTH_SECRET` | Random secret for NextAuth session encryption (min 32 chars) |
| `NEXTAUTH_URL` | Full public URL of the app (e.g. `https://yourdomain.com`) |
| `DB_HOST` / `DB_PORT` / `DB_NAME` / `DB_USER` / `DB_PASSWORD` | PostgreSQL connection |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | WhatsApp number for CTA buttons (e.g. `628xxxxxxxxxx`) |
| `STORAGE_DRIVER` | `local` \| `s3` \| `gdrive` |
| `S3_*` | S3-compatible storage credentials (when `STORAGE_DRIVER=s3`) |
| `GDRIVE_*` | Google Drive credentials (when `STORAGE_DRIVER=gdrive`) |

---

## Design

The UI combines the **layout cleanliness of % Arabica** with the **warm, rich photography style of Starbucks Reserve** — minimal and airy structure, full-bleed hero imagery, earth tone palette (`#F5F0E8` soft beige background), Poppins for bold headings, and smooth `300ms ease-in-out` hover transitions on all interactive elements.
