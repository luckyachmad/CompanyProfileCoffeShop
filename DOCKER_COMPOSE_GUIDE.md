# Docker Compose Configuration Guide

## Overview

This document explains the production-ready Docker Compose configuration for the CompanyProfileCoffeeShop application. The configuration orchestrates two services: a PostgreSQL database and the Next.js application.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│              Docker Compose Network                     │
│                (coffeeshop-network)                     │
│                                                         │
│  ┌──────────────────┐      ┌─────────────────────┐    │
│  │   app service    │─────▶│    db service       │    │
│  │   (Next.js)      │      │   (PostgreSQL)      │    │
│  │   Port: 3000     │      │   Internal only     │    │
│  └────────┬─────────┘      └──────────┬──────────┘    │
│           │                           │                │
│           │                           │                │
│     ┌─────▼──────┐            ┌──────▼───────┐       │
│     │uploads_data│            │postgres_data │       │
│     │  (volume)  │            │   (volume)   │       │
│     └────────────┘            └──────────────┘       │
└─────────────────────────────────────────────────────────┘
```

## Services

### Database Service (`db`)

**Image**: `postgres:16-alpine`
- Lightweight Alpine Linux-based PostgreSQL 16
- Production-stable version with minimal attack surface

**Configuration**:
- **Container Name**: `coffeeshop-db`
- **Environment Variables**: Injected from `.env` file
  - `POSTGRES_DB`: Database name
  - `POSTGRES_USER`: Database user
  - `POSTGRES_PASSWORD`: Database password
- **Volumes**:
  - `postgres_data:/var/lib/postgresql/data` - Persists database files across container restarts
  - `./db/migrations:/docker-entrypoint-initdb.d:ro` - Auto-executes SQL migration scripts on first startup (read-only mount)
- **Health Check**:
  - Tests database readiness every 10 seconds
  - Allows 10 seconds startup period before first check
  - Requires 5 consecutive failures before marking unhealthy
  - App service waits for healthy status before starting
- **Restart Policy**: `unless-stopped` - Automatically restarts on failure, but respects manual stops
- **Network**: Connected to `coffeeshop-network` (isolated bridge network)

### Application Service (`app`)

**Image**: `your-dockerhub-username/coffeeshop-app:latest`
- Replace `your-dockerhub-username` with your actual Docker Hub username
- Built from the multi-stage Dockerfile in project root

**Configuration**:
- **Container Name**: `coffeeshop-app`
- **Environment Variables**: Injected from `.env` file
  - All application configuration (DB connection, storage, auth secrets, etc.)
- **Ports**: `3000:3000` - Exposes Next.js application to host
- **Volumes**:
  - `uploads_data:/app/uploads` - Persists uploaded images when `STORAGE_DRIVER=local`
- **Dependencies**:
  - `depends_on: db (condition: service_healthy)` - Waits for PostgreSQL to be ready before starting
- **Restart Policy**: `unless-stopped`
- **Network**: Connected to `coffeeshop-network`

## Volumes

### `postgres_data`
- **Driver**: `local`
- **Purpose**: Persists PostgreSQL database files
- **Location**: Managed by Docker (typically `/var/lib/docker/volumes/`)
- **Persistence**: Data survives container recreation, only lost on explicit volume deletion

### `uploads_data`
- **Driver**: `local`
- **Purpose**: Stores uploaded images when using local storage adapter
- **Active When**: `STORAGE_DRIVER=local` in `.env`
- **Note**: Not used if `STORAGE_DRIVER=s3` or `STORAGE_DRIVER=gdrive`

## Network

### `coffeeshop-network`
- **Driver**: `bridge`
- **Purpose**: Isolates services from other Docker containers on the host
- **DNS**: Services can reach each other using service names (e.g., `app` can connect to `db` using hostname `db`)

## Environment Variable Injection

All configuration is injected at runtime via `env_file: .env`. This follows the [12-Factor App](https://12factor.net/config) methodology.

**Critical Security Rules**:
- ✅ `.env` file is in `.gitignore` - never committed to version control
- ✅ `.env` file is in `.dockerignore` - never copied into Docker image
- ✅ Secrets are injected at container runtime only
- ✅ No hardcoded credentials in `docker-compose.yml`

**Required Environment Variables**:

See `.env.example` for the complete list. Key variables:

```env
# Database (used by both db and app services)
POSTGRES_DB=coffeeshop
POSTGRES_USER=coffeeshop_user
POSTGRES_PASSWORD=your_secure_password
DB_HOST=db
DB_PORT=5432
DB_NAME=coffeeshop
DB_USER=coffeeshop_user
DB_PASSWORD=your_secure_password

# Application
NODE_ENV=production
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your_nextauth_secret_min_32_chars

# Storage
STORAGE_DRIVER=local
STORAGE_LOCAL_PATH=/app/uploads

# ... (see .env.example for full list)
```

## Database Initialization

On **first startup only**, PostgreSQL automatically executes all `.sql` files in `/docker-entrypoint-initdb.d` in alphabetical order:

1. `001_init_schema.sql` - Creates all tables (admins, categories, menu_items, gallery_photos, testimonials)
2. Additional migration files (if any) run in order

**Important Notes**:
- Initialization only runs if the `postgres_data` volume is empty
- To re-initialize, you must delete the volume: `docker compose down -v`
- All SQL files use `CREATE TABLE IF NOT EXISTS` for idempotency

## Usage

### First-Time Setup

1. **Create `.env` file** from template:
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env`** with your actual values:
   - Set secure passwords for `POSTGRES_PASSWORD`, `DB_PASSWORD`, `NEXTAUTH_SECRET`
   - Configure `STORAGE_DRIVER` (local/s3/gdrive)
   - Set `NEXT_PUBLIC_WHATSAPP_NUMBER`

3. **Update Docker image reference** in `docker-compose.yml`:
   ```yaml
   image: your-dockerhub-username/coffeeshop-app:latest
   ```

4. **Start services**:
   ```bash
   docker compose up -d
   ```

5. **Verify services are running**:
   ```bash
   docker compose ps
   ```

6. **View logs**:
   ```bash
   docker compose logs -f
   ```

### Common Commands

```bash
# Start all services in background
docker compose up -d

# Stop all services (keeps volumes)
docker compose down

# Stop all services and delete volumes (WARNING: destroys data)
docker compose down -v

# View real-time logs
docker compose logs -f

# View logs for specific service
docker compose logs -f app
docker compose logs -f db

# Restart specific service
docker compose restart app

# Check service status
docker compose ps

# Execute command in running container
docker compose exec app sh
docker compose exec db psql -U coffeeshop_user -d coffeeshop

# Pull latest images
docker compose pull

# Rebuild and restart (after code changes)
docker compose up -d --build
```

### Database Management

**Connect to PostgreSQL**:
```bash
docker compose exec db psql -U coffeeshop_user -d coffeeshop
```

**Backup database**:
```bash
docker compose exec db pg_dump -U coffeeshop_user coffeeshop > backup.sql
```

**Restore database**:
```bash
docker compose exec -T db psql -U coffeeshop_user -d coffeeshop < backup.sql
```

**View tables**:
```bash
docker compose exec db psql -U coffeeshop_user -d coffeeshop -c "\dt"
```

## Production Deployment Checklist

- [ ] Replace `your-dockerhub-username` with actual Docker Hub username
- [ ] Set strong, unique passwords for all credentials
- [ ] Set `NODE_ENV=production` in `.env`
- [ ] Generate secure `NEXTAUTH_SECRET` (min 32 characters): `openssl rand -base64 32`
- [ ] Configure `NEXTAUTH_URL` with actual production domain
- [ ] Set up reverse proxy (Nginx/Caddy) for HTTPS termination
- [ ] Configure firewall to only expose port 3000 to reverse proxy
- [ ] Set up automated backups for `postgres_data` volume
- [ ] Configure storage backend (local/S3/Google Drive)
- [ ] Test health check endpoints
- [ ] Set up monitoring and alerting
- [ ] Document disaster recovery procedures

## Health Checks

### Database Health Check
- **Command**: `pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}`
- **Interval**: Every 10 seconds
- **Timeout**: 5 seconds
- **Retries**: 5 consecutive failures before marking unhealthy
- **Start Period**: 10 seconds grace period on first startup

### Application Health Check
The app service relies on the database health check via `depends_on` condition. For additional monitoring, you can add a health check endpoint at `/api/health` in your Next.js app.

## Troubleshooting

### Database connection fails
```bash
# Check if db service is healthy
docker compose ps

# View db logs
docker compose logs db

# Verify environment variables
docker compose config
```

### App service won't start
```bash
# Check app logs
docker compose logs app

# Verify db is healthy first
docker compose ps db

# Restart app service
docker compose restart app
```

### Volumes not persisting data
```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect companyprofilecoffeeshop_postgres_data

# Check if volume mount is correct
docker compose exec app ls -la /app/uploads
docker compose exec db ls -la /var/lib/postgresql/data
```

### Cannot connect to PostgreSQL from host
```bash
# Database is not exposed to host by default (security best practice)
# To expose temporarily for debugging, add to db service:
ports:
  - "5432:5432"

# Then restart:
docker compose up -d
```

## Security Best Practices

1. **Never expose PostgreSQL port** to the internet - keep it internal to Docker network
2. **Use strong passwords** - Generate with `openssl rand -base64 32`
3. **Rotate secrets regularly** - Update `.env` and restart services
4. **Keep images updated** - Regularly pull latest `postgres:16-alpine` and rebuild app image
5. **Backup encrypted** - Encrypt database backups at rest and in transit
6. **Limit container privileges** - Don't run containers as root (already configured in Dockerfile)
7. **Use read-only mounts** where possible - Migrations are mounted `:ro`
8. **Monitor logs** - Set up centralized logging for security events

## Performance Optimization

- **Database**: Tune PostgreSQL settings via environment variables if needed
- **Volumes**: Use named volumes (not bind mounts) for better performance
- **Networks**: Bridge network provides good isolation with minimal overhead
- **Health Checks**: Adjust intervals based on load (increase for high-traffic sites)

## Requirements Satisfied

This configuration satisfies the following requirements from the spec:

- ✅ **15.3**: Docker Compose defines `db` (postgres:16-alpine) and `app` services with `depends_on`
- ✅ **15.4**: All environment variables injected via `env_file: .env`
- ✅ **15.5**: No `.env` file copied into Docker image (handled by `.dockerignore`)
- ✅ **15.7**: `uploads_data` volume mounted to `/app/uploads` for local storage
- ✅ **15.8**: `postgres_data` volume mounted to `/var/lib/postgresql/data`
- ✅ Auto-initialization: `db/migrations` mounted to `/docker-entrypoint-initdb.d`

## References

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL Docker Image](https://hub.docker.com/_/postgres)
- [Next.js Standalone Build](https://nextjs.org/docs/advanced-features/output-file-tracing)
- [12-Factor App Config](https://12factor.net/config)
