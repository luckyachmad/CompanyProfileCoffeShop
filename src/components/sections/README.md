# Hero Section Implementation

## Task 9.1 - Create Hero Section

### Overview
The Hero section is implemented as a full-viewport banner with a background image, dark overlay, and animated content. It follows Next.js 14+ App Router best practices by splitting Server and Client components.

### Component Structure

#### `Hero.tsx` (Server Component)
- Renders the structural layout and background image
- Uses Next.js `Image` component with `priority` for above-the-fold optimization
- Applies `bg-black/40` overlay for text readability
- Delegates interactive elements to `HeroClient`

#### `HeroClient.tsx` (Client Component)
- Handles Framer Motion animations
- Implements smooth scroll to `#menu` section
- Contains headline, sub-headline, and CTA button
- Applies all required styling with proper transitions

### Requirements Validated

✅ **Requirement 2.1**: Full-width, full-viewport-height background with `bg-black/40` overlay
✅ **Requirement 2.2**: Headline and sub-headline with proper font classes
✅ **Requirement 2.3**: CTA button with all required styling and hover effects
✅ **Requirement 2.4**: Framer Motion fade-in animations with correct parameters
✅ **Requirement 2.5**: Static, hardcoded content (no API calls)
✅ **Requirement 2.6**: Smooth scroll to `#menu` element on CTA click

### Design Tokens Used

- `bg-background`: Soft beige (#F5F0E8) - Not used in Hero (uses image)
- `bg-primary`: Deep espresso brown (#3B1F0A) - Button background
- `bg-primary-hover`: Warm mid-brown (#5C3317) - Button hover state
- `font-heading`: Poppins font family - For headline
- `font-body`: Inter font family - For sub-headline
- `rounded-full`: Full border radius - For CTA button
- `transition-all duration-300 ease-in-out`: Standard transition

### Animation Parameters

All animations follow Requirement 2.4 specification:
- Initial state: `{ opacity: 0, y: 30 }`
- Final state: `{ opacity: 1, y: 0 }`
- Duration: 0.5 seconds
- Easing: 'easeOut'
- Stagger delays: 0ms (h1), 200ms (p), 400ms (button)

### Accessibility

- Proper semantic HTML (`<section>`, `<h1>`, `<p>`, `<button>`)
- Alt text for background image
- `aria-label` on CTA button
- Focus-visible styles (defined in globals.css)

### Usage

```tsx
import Hero from '@/components/sections/Hero';

export default function Page() {
  return (
    <main>
      <Hero />
      {/* Other sections */}
    </main>
  );
}
```

### Image Requirements

The component expects a hero background image at:
- Path: `/public/images/hero-background.webp`
- Recommended dimensions: 1920x1080 or larger
- Format: WebP (optimized)
- Content: Coffee shop interior with warm lighting

**Note**: Currently a placeholder file exists. Replace with actual hero image before deployment.

### Testing

Run tests with:
```bash
npm test -- src/components/sections/Hero.test.tsx
npm test -- src/components/sections/Hero.integration.test.tsx
```

All tests verify:
- Component structure and exports
- Required styling classes
- Framer Motion configuration
- Smooth scroll implementation
- Font usage
- Accessibility attributes
