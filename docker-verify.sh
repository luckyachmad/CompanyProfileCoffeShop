#!/bin/bash

# Docker Build Verification Script for CompanyProfileCoffeeShop

set -e

echo "=========================================="
echo "Docker Build Verification"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo "1. Checking prerequisites..."

if ! command -v docker &> /dev/null; then
    echo -e "${RED}✗ Docker is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker is installed${NC}"

if ! command -v docker compose &> /dev/null; then
    echo -e "${RED}✗ Docker Compose is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker Compose is installed${NC}"

# Check for required files
echo ""
echo "2. Checking required files..."

if [ ! -f "Dockerfile" ]; then
    echo -e "${RED}✗ Dockerfile not found${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Dockerfile exists${NC}"

if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}✗ docker-compose.yml not found${NC}"
    exit 1
fi
echo -e "${GREEN}✓ docker-compose.yml exists${NC}"

if [ ! -f ".dockerignore" ]; then
    echo -e "${YELLOW}⚠ .dockerignore not found (recommended)${NC}"
else
    echo -e "${GREEN}✓ .dockerignore exists${NC}"
fi

if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠ .env file not found${NC}"
    echo "  Copy .env.example to .env and configure it before deployment"
else
    echo -e "${GREEN}✓ .env exists${NC}"
fi

# Check next.config.ts for standalone output
echo ""
echo "3. Checking Next.js configuration..."

if grep -q "output: 'standalone'" next.config.ts; then
    echo -e "${GREEN}✓ Standalone output is configured${NC}"
else
    echo -e "${RED}✗ Standalone output not found in next.config.ts${NC}"
    echo "  Add: output: 'standalone' to next.config.ts"
    exit 1
fi

# Verify .dockerignore contents
echo ""
echo "4. Verifying .dockerignore..."

required_ignores=(".env" "node_modules" ".next" "uploads")
all_found=true

for item in "${required_ignores[@]}"; do
    if grep -q "$item" .dockerignore; then
        echo -e "${GREEN}✓ $item is excluded${NC}"
    else
        echo -e "${RED}✗ $item is NOT excluded${NC}"
        all_found=false
    fi
done

if [ "$all_found" = false ]; then
    echo -e "${YELLOW}⚠ Some critical files are not excluded from Docker build${NC}"
fi

# Test Docker build
echo ""
echo "5. Testing Docker build..."
echo "   (This may take several minutes)"
echo ""

if docker build -t coffeeshop-verify-test:latest . --progress=plain; then
    echo ""
    echo -e "${GREEN}✓ Docker build successful!${NC}"
    
    # Check image size
    image_size=$(docker images coffeeshop-verify-test:latest --format "{{.Size}}")
    echo "  Image size: $image_size"
    
    # Clean up test image
    echo ""
    read -p "Remove test image? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker rmi coffeeshop-verify-test:latest
        echo -e "${GREEN}✓ Test image removed${NC}"
    fi
else
    echo ""
    echo -e "${RED}✗ Docker build failed${NC}"
    exit 1
fi

echo ""
echo "=========================================="
echo "Verification Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "  1. Configure .env file (if not already done)"
echo "  2. Build production image: docker build -t your-username/coffeeshop-app:latest ."
echo "  3. Test locally: docker compose up -d"
echo "  4. Push to Docker Hub: docker push your-username/coffeeshop-app:latest"
echo ""
echo "See DOCKER_DEPLOYMENT.md for detailed instructions."
echo ""
