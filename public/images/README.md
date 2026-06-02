# Static Image Assets

This directory contains static image assets for the coffee shop website.

## Current Files

### Hero Section
- **File:** `hero-background.webp`
- **Usage:** Full-width background image for the hero banner section
- **Recommended dimensions:** 1920x1080px or higher (16:9 aspect ratio)
- **Format:** WebP (for optimal compression)
- **Description:** Should showcase the coffee shop's warm, inviting atmosphere with professional product photography

### About Section
- **File:** `about-coffee-shop.webp`
- **Usage:** Supporting image for the "About Us" section
- **Recommended dimensions:** 1200x675px or higher (16:9 aspect ratio)
- **Format:** WebP (for optimal compression)
- **Description:** Should show the coffee shop interior, cozy seating, or artisanal coffee preparation

## Adding New Images

When adding new static images to this directory:

1. **Format:** Use WebP format for optimal compression and performance
2. **Naming:** Use kebab-case naming (e.g., `coffee-beans-roasting.webp`)
3. **Dimensions:** Provide images at 2x the display size to support retina displays
4. **Compression:** Optimize images before committing (aim for < 500KB for hero images)

## Image Optimization

Next.js automatically optimizes images served through the `<Image>` component:
- Serves images in modern formats (WebP, AVIF) based on browser support
- Lazy loads images below the fold
- Generates responsive image sizes
- Provides blur placeholder during loading

## Dynamic Images

Dynamic images (menu items, gallery photos) are **not** stored in this directory. They are managed through the CMS dashboard and stored according to the `STORAGE_DRIVER` environment variable:
- `local`: Stored in `/app/uploads` volume
- `s3`: Stored in S3-compatible bucket
- `gdrive`: Stored in Google Drive folder

See the main README.md for more information about image storage configuration.

## Notes

⚠️ **Current Status:** The existing files are empty placeholders and should be replaced with actual high-quality images of the coffee shop before deployment.

To replace a placeholder:
1. Prepare a high-quality image in WebP format
2. Ensure it meets the recommended dimensions
3. Overwrite the placeholder file with the same name
4. Commit and deploy
