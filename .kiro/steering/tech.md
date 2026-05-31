# Tech Stack

## Core Stack

| Layer            | Choice                              | Notes                                                                 |
|------------------|-------------------------------------|-----------------------------------------------------------------------|
| UI Library       | React.js (latest stable)            | Component-based UI                                                    |
| Build Tool       | Vite.js (recommended) or Next.js    | Vite for SPA/CSR; Next.js if SSG pre-rendering from CMS is needed    |
| Language         | JavaScript / TypeScript             | TypeScript preferred for type safety                                  |
| Styling          | Tailwind CSS                        | Utility-first, fully responsive                                       |
| Headless CMS     | Sanity.io / Strapi / Contentful     | Serverless/cloud-managed; owner manages menu & gallery independently  |
| Data Fetching    | Axios or CMS SDK (GraphQL/REST)     | With caching to keep load times fast                                  |
| Animation        | Framer Motion or AOS                | Scroll-triggered fade-in/slide-up animations, hover micro-interactions|
| Deployment       | Vercel or Netlify                   | CI/CD auto-deploy from GitHub/GitLab                                  |

## CMS Notes

- Use **read-only API tokens** on the frontend — store in environment variables (`.env`), never hardcode
- CMS must support image CDN with automatic WebP conversion/optimization
- CMS dashboard secured with HTTPS + token-based auth (JWT or provider session)
- On content change: SSG (Next.js) triggers rebuild webhook; SPA (Vite) reflects on next client fetch

## Common Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview        # Vite
# or
npm run start          # Next.js

# Lint
npm run lint
```

## Quality Targets

- **Lighthouse score**: 85+ (Performance) even with dynamic CMS data
- **Responsive**: Must pass layout checks at Mobile, Tablet, and Desktop breakpoints
- **SEO**: Semantic HTML5 tags; `alt` attributes on menu images auto-populated from CMS item name
- **Security**: HTTPS enforced; CMS API tokens in env vars; admin dashboard login protected

## Deployment Pipeline

1. Push source code to GitHub / GitLab
2. Vercel / Netlify auto-deploys on push to main branch
3. CMS webhook triggers rebuild (SSG) or frontend fetches fresh data on load (SPA)
