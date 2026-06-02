# Docker Deployment Guide

This guide explains how to build, push, and deploy the CompanyProfileCoffeeShop application using Docker.

## Prerequisites

- Docker 20.10+ installed
- Docker Compose 2.0+ installed
- Docker Hub account (or other container registry)
- `.env` file configured with all required variables (see `.env.example`)

## Dockerfile Architecture

The application uses a **multi-stage build** with three stages:

### Stage 1: deps
- Base: `node:20-alpine`
- Installs production dependencies
- Includes `libc6-compat` for native modules (Sharp, pg)
- Cleans npm cache to reduce layer size

### Stage 2: builder
- Base: `node:20-alpine`
- Copies dependencies from deps stage
- Builds Next.js application
- Generates standalone output (configured in `next.config.ts`)

### Stage 3: runner (Production)
- Base: `node:20-alpine`
- Minimal production runtime
- Runs as non-root user (`nextjs:nodejs` UID/GID 1001)
- Copies only necessary files:
  - `.next/standalone` → `/app`
  - `.next/static` → `/app/.next/static`
  - `public` → `/app/public`
- Creates `/app/uploads` directory for local storage

## Building the Docker Image

### 1. Build locally

```bash
docker build -t coffeeshop-app:latest .
```

### 2. Tag for Docker Hub

```bash
docker tag coffeeshop-app:latest your-dockerhub-username/coffeeshop-app:latest
docker tag coffeeshop-app:latest your-dockerhub-username/coffeeshop-app:v1.0.0
```

### 3. Push to Docker Hub

```bash
# Login to Docker Hub
docker login

# Push images
docker push your-dockerhub-username/coffeeshop-app:latest
docker push your-dockerhub-username/coffeeshop-app:v1.0.0
```

## Docker Compose Deployment

### Configuration

The `docker-compose.yml` defines two services:

1. **db** (PostgreSQL 16)
   - Auto-initializes schema from `db/migrations/`
   - Data persisted in `postgres_data` volume
   - Health check ensures database is ready before app starts

2. **app** (Next.js Application)
   - Depends on `db` service (waits for health check)
   - Uploads persisted in `uploads_data` volume
   - Restarts automatically unless stopped manually

### Deployment Steps

1. **Update docker-compose.yml** with your image name:

```yaml
app:
  image: your-dockerhub-username/coffeeshop-app:latest
```

2. **Ensure .env file exists** with all required variables:

```bash
cp .env.example .env
# Edit .env with your actual values
```

3. **Start services**:

```bash
docker compose up -d
```

4. **Verify deployment**:

```bash
# Check service status
docker compose ps

# View logs
docker compose logs -f app

# Check database is ready
docker compose logs db
```

5. **Initialize database** (if migrations didn't auto-run):

```bash
docker compose exec db psql -U coffeeshop_user -d coffeeshop -f /docker-entrypoint-initdb.d/001_init_schema.sql
```

6. **Access application**:
   - Frontend: http://localhost:3000
   - Admin: http://localhost:3000/admin

## Environment Variables

All configuration is injected at runtime via `.env` file. **Never** copy `.env` into the Docker image.

Required variables (see `.env.example` for complete list):

```env
# Application
NODE_ENV=production
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your_nextauth_secret_min_32_chars

# Database
DB_HOST=db
DB_PORT=5432
DB_NAME=coffeeshop
DB_USER=coffeeshop_user
DB_PASSWORD=your_secure_password

# Storage
STORAGE_DRIVER=local
STORAGE_LOCAL_PATH=/app/uploads

# WhatsApp
NEXT_PUBLIC_WHATSAPP_NUMBER=628xxxxxxxxxx
```

## Storage Configuration

### Local Storage (Default)
```env
STORAGE_DRIVER=local
STORAGE_LOCAL_PATH=/app/uploads
```

Volume is automatically mounted in docker-compose.yml.

### S3-Compatible Storage
```env
STORAGE_DRIVER=s3
S3_ENDPOINT=https://s3.example.com
S3_BUCKET=coffeeshop-media
S3_REGION=auto
S3_ACCESS_KEY=your_access_key
S3_SECRET_KEY=your_secret_key
```

### Google Drive Storage
```env
STORAGE_DRIVER=gdrive
GDRIVE_FOLDER_ID=your_folder_id
GDRIVE_SERVICE_ACCOUNT_JSON=/run/secrets/gdrive_sa.json
```

## Common Operations

### View Logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f app
docker compose logs -f db
```

### Restart Services
```bash
# All services
docker compose restart

# Specific service
docker compose restart app
```

### Stop Services
```bash
docker compose down
```

### Stop and Remove Volumes
```bash
# WARNING: This deletes all data
docker compose down -v
```

### Update Application
```bash
# Pull latest image
docker compose pull app

# Recreate container with new image
docker compose up -d app
```

### Database Backup
```bash
docker compose exec db pg_dump -U coffeeshop_user coffeeshop > backup.sql
```

### Database Restore
```bash
cat backup.sql | docker compose exec -T db psql -U coffeeshop_user -d coffeeshop
```

## Troubleshooting

### App won't start
1. Check logs: `docker compose logs app`
2. Verify `.env` file exists and has all required variables
3. Ensure database is healthy: `docker compose ps`

### Database connection errors
1. Check DB_HOST is set to `db` (service name)
2. Verify database is running: `docker compose ps db`
3. Check database logs: `docker compose logs db`

### Image upload errors
1. Verify STORAGE_DRIVER is set correctly
2. Check uploads directory permissions: `docker compose exec app ls -la /app/uploads`
3. For S3/GDrive, verify credentials are correct

### Permission denied errors
1. The app runs as user `nextjs` (UID 1001)
2. Volumes are automatically created with correct permissions
3. If issues persist, check volume permissions: `docker volume inspect companyprofilecoffeshop_uploads_data`

## Security Best Practices

✅ **Implemented:**
- Multi-stage build (minimal production image)
- Non-root user execution
- No secrets in image (injected at runtime)
- `.env` excluded from image via `.dockerignore`
- Health checks for dependent services
- Automatic restart on failure

⚠️ **Additional Recommendations:**
- Use Docker secrets for sensitive values in production
- Enable HTTPS with reverse proxy (nginx/Traefik)
- Implement rate limiting
- Regular security updates for base images
- Use specific version tags (not `latest`) in production

## Production Deployment Checklist

- [ ] Configure `.env` with production values
- [ ] Set strong NEXTAUTH_SECRET (min 32 characters)
- [ ] Set secure DB_PASSWORD
- [ ] Configure NEXTAUTH_URL with production domain
- [ ] Update NEXT_PUBLIC_WHATSAPP_NUMBER
- [ ] Configure storage (S3/GDrive recommended for production)
- [ ] Set up HTTPS/SSL (reverse proxy)
- [ ] Configure backup strategy for database and uploads
- [ ] Test all admin CMS functions
- [ ] Run Lighthouse audit (target score 85+)
- [ ] Monitor logs for errors after deployment

## Image Size Optimization

Current optimizations:
- Alpine Linux base (minimal footprint)
- Multi-stage build (only production artifacts)
- npm cache cleaning in deps stage
- Standalone Next.js output (excludes dev dependencies)

Expected image size: **~200-300 MB** (depending on dependencies)

## Next Steps

After successful deployment:
1. Access admin dashboard: `http://yourdomain.com/admin`
2. Login with seeded admin credentials
3. Upload menu items and gallery photos
4. Test WhatsApp CTA integration
5. Verify all sections render correctly
6. Run Lighthouse performance audit

## Support

For issues specific to:
- **Docker setup**: Check Docker and Docker Compose documentation
- **Next.js standalone**: See [Next.js Output File Tracing](https://nextjs.org/docs/pages/api-reference/next-config-js/output)
- **PostgreSQL**: Check PostgreSQL 16 documentation
- **Application bugs**: See repository issues
