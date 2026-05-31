# Project Structure

## Folder Layout

```
CompanyProfileCoffeeShop/
├── public/                        # Static assets
│   ├── images/                    # Local fallback images (logo, placeholders)
│   └── icons/
├── src/
│   ├── components/
│   │   ├── ui/                    # Generic reusable elements (Button, Badge, Card, Modal)
│   │   └── sections/              # One component per landing page section
│   │       ├── Hero.tsx
│   │       ├── About.tsx
│   │       ├── Menu.tsx           # Fetches & renders menu data from CMS
│   │       ├── Gallery.tsx        # Fetches & renders gallery photos from CMS
│   │       ├── Testimonials.tsx
│   │       ├── Contact.tsx
│   │       └── Footer.tsx
│   ├── lib/                       # CMS client setup, API helpers, data fetching utilities
│   │   └── cms.ts                 # CMS SDK init and query functions
│   ├── data/                      # Static/fallback content (e.g. testimonials if not in CMS)
│   ├── types/                     # Shared TypeScript interfaces (MenuItem, GalleryPhoto, etc.)
│   ├── styles/
│   │   └── globals.css            # Global styles, Tailwind base imports
│   ├── App.tsx                    # Root component, assembles all sections (SPA/Vite)
│   └── main.tsx                   # Entry point
├── .env                           # Environment variables (CMS API tokens — never commit)
├── .env.example                   # Template for required env vars (safe to commit)
├── .kiro/                         # Kiro specs and steering docs
├── vite.config.ts                 # (or next.config.ts if using Next.js)
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

> If using **Next.js**, replace `src/App.tsx` + `src/main.tsx` with `src/app/` (App Router) and move sections into `src/app/page.tsx` composed from section components.

## Naming Conventions

- **Components**: PascalCase filenames, one component per file (`MenuCard.tsx`, `GalleryGrid.tsx`)
- **Utilities / helpers**: camelCase (`fetchMenuItems.ts`)
- **Types / interfaces**: PascalCase prefixed with `I` or descriptive name (`MenuItem`, `GalleryPhoto`)
- **Images**: kebab-case descriptive filenames (`hero-background.webp`, `menu-latte.webp`)
- **CSS classes**: Tailwind utilities only; avoid custom CSS unless Tailwind cannot cover the case

## Component Guidelines

- Keep `App.tsx` (or `page.tsx`) thin — just compose section components in order
- Section components own their own data fetching (call CMS lib functions internally)
- `components/ui/` holds generic, stateless elements reused across sections (e.g. `Badge`, `Button`, `Lightbox`)
- CMS query logic lives in `src/lib/cms.ts` — never inline API calls inside components
- All CMS API tokens must be read from `import.meta.env` (Vite) or `process.env` (Next.js) — never hardcoded

## Environment Variables

```
# .env.example
VITE_CMS_PROJECT_ID=your_project_id
VITE_CMS_DATASET=production
VITE_CMS_API_TOKEN=your_read_only_token
VITE_WHATSAPP_NUMBER=628xxxxxxxxxx
```

## Key Sections → Component Mapping

| Section            | Component File              | Data Source         |
|--------------------|-----------------------------|---------------------|
| Hero               | `sections/Hero.tsx`         | Static / hardcoded  |
| About Us           | `sections/About.tsx`        | Static / hardcoded  |
| Featured Menu      | `sections/Menu.tsx`         | CMS (dynamic)       |
| Gallery            | `sections/Gallery.tsx`      | CMS (dynamic)       |
| Testimonials       | `sections/Testimonials.tsx` | Static or CMS       |
| Contact & Location | `sections/Contact.tsx`      | Static / hardcoded  |
| Footer             | `sections/Footer.tsx`       | Static / hardcoded  |
| WhatsApp Button    | `ui/WhatsAppButton.tsx`     | Env var (WA number) |
