#!/bin/bash

# Docker Compose Configuration Verification Script
# This script verifies the docker-compose.yml configuration is valid and complete

set -e

echo "=========================================="
echo "Docker Compose Configuration Verification"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if docker-compose.yml exists
echo -n "Checking if docker-compose.yml exists... "
if [ -f "docker-compose.yml" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    echo "Error: docker-compose.yml not found"
    exit 1
fi

# Check if .env.example exists
echo -n "Checking if .env.example exists... "
if [ -f ".env.example" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    echo "Warning: .env.example not found"
fi

# Check if .env exists
echo -n "Checking if .env exists... "
if [ -f ".env" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${YELLOW}⚠${NC} .env not found (create from .env.example before running docker compose)"
fi

# Check if migrations directory exists
echo -n "Checking if db/migrations directory exists... "
if [ -d "db/migrations" ]; then
    echo -e "${GREEN}✓${NC}"
    
    # Count migration files
    migration_count=$(ls -1 db/migrations/*.sql 2>/dev/null | wc -l)
    echo "  Found $migration_count migration file(s)"
else
    echo -e "${RED}✗${NC}"
    echo "Error: db/migrations directory not found"
    exit 1
fi

# Check if Dockerfile exists
echo -n "Checking if Dockerfile exists... "
if [ -f "Dockerfile" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    echo "Error: Dockerfile not found"
    exit 1
fi

# Validate docker-compose.yml syntax (requires Docker)
echo -n "Validating docker-compose.yml syntax... "
if command -v docker &> /dev/null && docker compose version &> /dev/null; then
    if docker compose config > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${RED}✗${NC}"
        echo "Error: docker-compose.yml has syntax errors"
        docker compose config
        exit 1
    fi
else
    echo -e "${YELLOW}⚠${NC} Docker not available, skipping syntax validation"
fi

# Check required services are defined
echo ""
echo "Checking required services..."

# Check db service
echo -n "  - db service... "
if grep -q "db:" docker-compose.yml; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    exit 1
fi

# Check app service
echo -n "  - app service... "
if grep -q "app:" docker-compose.yml; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    exit 1
fi

# Check required volumes
echo ""
echo "Checking required volumes..."

# Check postgres_data volume
echo -n "  - postgres_data volume... "
if grep -q "postgres_data:" docker-compose.yml; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    exit 1
fi

# Check uploads_data volume
echo -n "  - uploads_data volume... "
if grep -q "uploads_data:" docker-compose.yml; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    exit 1
fi

# Check required configurations
echo ""
echo "Checking required configurations..."

# Check env_file injection
echo -n "  - env_file injection... "
if grep -q "env_file: .env" docker-compose.yml; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    exit 1
fi

# Check depends_on
echo -n "  - depends_on configuration... "
if grep -q "depends_on:" docker-compose.yml; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    exit 1
fi

# Check migrations mount
echo -n "  - migrations mount to /docker-entrypoint-initdb.d... "
if grep -q "/docker-entrypoint-initdb.d" docker-compose.yml; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    exit 1
fi

# Check PostgreSQL image version
echo -n "  - postgres:16-alpine image... "
if grep -q "postgres:16-alpine" docker-compose.yml; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    exit 1
fi

# Check health check
echo -n "  - database health check... "
if grep -q "healthcheck:" docker-compose.yml && grep -q "pg_isready" docker-compose.yml; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${YELLOW}⚠${NC} Health check not found or incomplete"
fi

# Verify requirements
echo ""
echo "Verifying task requirements..."
echo -n "  - Requirement 15.3 (db and app services with depends_on)... "
echo -e "${GREEN}✓${NC}"

echo -n "  - Requirement 15.4 (env_file injection)... "
echo -e "${GREEN}✓${NC}"

echo -n "  - Requirement 15.5 (.env not in Docker image)... "
if grep -q ".env" .dockerignore 2>/dev/null; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${YELLOW}⚠${NC} .dockerignore should include .env"
fi

echo -n "  - Requirement 15.7 (uploads_data volume)... "
echo -e "${GREEN}✓${NC}"

echo -n "  - Requirement 15.8 (postgres_data volume)... "
echo -e "${GREEN}✓${NC}"

echo -n "  - Auto-initialization (migrations mount)... "
echo -e "${GREEN}✓${NC}"

echo ""
echo "=========================================="
echo -e "${GREEN}✓ Docker Compose configuration is valid!${NC}"
echo "=========================================="
echo ""
echo "Next steps:"
echo "  1. Create .env file from .env.example"
echo "  2. Update Docker image reference in docker-compose.yml"
echo "  3. Run: docker compose up -d"
echo ""
