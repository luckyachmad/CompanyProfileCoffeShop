---
inclusion: always
---

# Product Overview

**CompanyProfileCoffeeShop** is a single-page branding and digital catalog website for a coffee shop. It is the public-facing digital presence of the brand, integrated with a headless CMS so the owner can manage content independently without developer involvement.

## Purpose

- Convey the coffeeshop's cozy, warm, modern atmosphere in digital form
- Attract new customers through dynamic visuals and clear location info
- Drive conversions via WhatsApp CTA (floating button + per-menu-item button)
- Let the owner update menu items and gallery photos in real-time via CMS dashboard

## Target Audience

- **End users**: General public, coffee enthusiasts, potential customers browsing the site
- **Admin users**: Coffeeshop owner managing content through the CMS dashboard

## Page Sections (Single Long-Scroll SPA)

Sections must be composed in this order in `src/app/page.tsx`:

| # | Section | Component | Data Source |
|---|---------|-----------|-------------|
| 1 | Hero / Banner | `Hero.tsx` | Static / hardcoded |
| 2 | About Us (Tentang Kami) | `About.tsx` | Static / hardcoded |
| 3 | Featured Menu (Menu Unggulan) | `Menu.tsx` | CMS (dynamic) |
| 4 | Gallery (Galeri Foto) | `Gallery.tsx` | CMS (dynamic) |
| 5 | Testimonials (Testimoni) | `Testimonials.tsx` | Static or CMS |
| 6 | Contact & Location | `Contact.tsx` | Static / hardcoded |
| 7 | Footer | `Footer.tsx` | Static / hardcoded |

### Section Details

- **Hero**: Full-width background image, headline, sub-headline, CTA button that smooth-scrolls to the Menu section
- **About**: Brand story, philosophy, unique value proposition, supporting photo
- **Menu**: Items grouped by category (Coffee, Non-Coffee, Light Bites); each card shows photo, name, description, price, Best Seller badge, and a WhatsApp order button
- **Gallery**: Aesthetic photo grid; clicking a photo opens a lightbox/modal
- **Testimonials**: Customer reviews in an auto-sliding carousel or card grid
- **Contact**: Google Maps embed, full address, operating hours, phone number, social media links
- **Footer**: Copyright, quick nav links, logo

## CMS Admin Dashboard

- Login protected by email & password
- **Menu management**: add / edit / delete items — fields: title, category, description, price, photo, Best Seller toggle
- **Gallery management**: drag-and-drop photo upload, delete photos
- CMS must support image CDN with automatic WebP conversion

## Key Integrations

- **WhatsApp CTA**: Persistent floating button (bottom-right) + per-menu-item button; both use pre-filled message text; phone number sourced from env var `NEXT_PUBLIC_WHATSAPP_NUMBER`
- **Google Maps Embed**: Interactive map in the Contact section
- **Headless CMS API**: Dynamic data for Menu and Gallery sections served by Next.js Route Handlers (`/api/menu`, `/api/gallery`); data stored in PostgreSQL

## Design System

### Visual Direction

Combine the **layout cleanliness of % Arabica** (minimal, airy, lots of whitespace, restrained color use) with the **warm, rich asset photography style of Starbucks Reserve** (full-bleed hero images, moody close-up product shots, deep warm tones). The result is a site that feels premium and editorial without being cluttered.

### Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `background` | `#F5F0E8` — soft beige | Page background, section backgrounds |
| `surface` | `#FFFFFF` — white | Cards, modals, admin panels |
| `primary` | `#3B1F0A` — deep espresso brown | Primary buttons, active nav, headings accent |
| `primary-hover` | `#5C3317` — warm mid-brown | Button hover state |
| `secondary` | `#C8A97E` — caramel/gold | Badges, Best Seller highlight, decorative accents |
| `text-primary` | `#1C1C1C` — near-black charcoal | Body text, headings |
| `text-muted` | `#6B6B6B` — warm gray | Descriptions, captions, secondary labels |
| `border` | `#E2D9CC` — warm light gray | Card borders, dividers |

Never use pure `#FFFFFF` as a page background — always use the soft beige `#F5F0E8`.

### Typography

| Role | Font | Weight | Notes |
|------|------|--------|-------|
| Display / Hero heading | Poppins | 700–800 (Bold/ExtraBold) | Large, impactful; use for H1 and hero text only |
| Section headings | Poppins | 600 (SemiBold) | H2, H3 |
| Body / descriptions | Inter | 400 (Regular) | Menu descriptions, about text, testimonials |
| Price / labels | Inter | 500 (Medium) | Menu prices, badges, nav links |

Load both fonts via `next/font/google`. Never use system fonts for headings.

```ts
// src/app/layout.tsx
import { Poppins, Inter } from 'next/font/google';
const poppins = Poppins({ subsets: ['latin'], weight: ['600', '700', '800'] });
const inter = Inter({ subsets: ['latin'], weight: ['400', '500'] });
```

### Component Style Rules

- **Cards** (menu items, testimonials): `rounded-2xl`, `shadow-sm`, `bg-white`, `border border-[#E2D9CC]`
- **Buttons**: `rounded-full` for primary CTAs; `rounded-lg` for secondary/admin buttons
- **Images**: Always use `object-cover` with a defined aspect ratio; hero images are full-bleed with a warm dark overlay (`bg-black/40`) to keep text readable
- **Spacing**: Generous — section padding minimum `py-20`; card inner padding `p-6`
- **Badges** (Best Seller): `bg-[#C8A97E] text-white text-xs font-medium rounded-full px-3 py-1`

### Button Hover Transitions

Every button **must** have a gentle, satisfying hover transition. No abrupt color jumps.

```ts
// Standard primary button — use this as the base for all CTAs
className="bg-[#3B1F0A] text-white rounded-full px-6 py-3 font-medium
           transition-all duration-300 ease-in-out
           hover:bg-[#5C3317] hover:shadow-md hover:scale-[1.03]
           active:scale-[0.98]"
```

Rules:
- All transitions use `duration-300` and `ease-in-out` — never instant, never slow
- Primary buttons: background color shift + subtle scale up (`scale-[1.03]`) + shadow lift
- Ghost/outline buttons: border color shift + background fill fade-in
- Icon buttons (WhatsApp float): `hover:scale-110` + shadow deepen
- Never use `transition-none` on interactive elements

### Animation

- **Scroll animations**: Framer Motion `whileInView` with `{ opacity: 0, y: 30 }` → `{ opacity: 1, y: 0 }`, `transition: { duration: 0.5, ease: 'easeOut' }`
- **Stagger children** (menu cards, gallery grid): use `staggerChildren: 0.1` on the container
- **Page load**: Hero text fades in with a slight upward drift on mount
- Keep animations subtle — they should feel natural, not distracting

## Out of Scope

Do not implement or suggest any of the following — they are explicitly excluded:

- E-commerce (shopping cart, payment gateway, stock management)
- Table reservation or booking system
- Customer account or login system
