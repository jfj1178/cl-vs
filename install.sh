#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Print banner
echo -e "${BLUE}================================="
echo "VS Code Tunnel Setup Script"
echo -e "=================================${NC}"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}Error: npm is not installed. Please install Node.js and npm first.${NC}"
    exit 1
fi

# Install wrangler globally
echo -e "${BLUE}Installing wrangler...${NC}"
npm install -g wrangler

# Login to Cloudflare (if needed)
echo -e "${BLUE}Logging into Cloudflare...${NC}"
wrangler login

# Create timestamp
TIMESTAMP=$(date -u +"%Y-%m-%d %H:%M:%S")
echo -e "${GREEN}Current Date and Time (UTC): $TIMESTAMP${NC}"
echo -e "${GREEN}Current User's Login: jfj1178${NC}"

# Update the index.js file with current timestamp
sed -i "s/startTime: .*,/startTime: '$TIMESTAMP',/" src/index.js

# Deploy to Cloudflare Workers
echo -e "${BLUE}Deploying to Cloudflare Workers...${NC}"
wrangler deploy

# Print success message
echo -e "${GREEN}==================================="
echo "Deployment Complete!"
echo "Your worker should now be available at:"
echo "https://vscode-tunnel.anuradhadey85.workers.dev/"
echo -e "===================================${NC}"

# Check deployment status
if curl -s https://vscode-tunnel.anuradhadey85.workers.dev/ > /dev/null; then
    echo -e "${GREEN}✓ Worker is responding successfully${NC}"
else
    echo -e "${RED}! Warning: Worker might not be responding${NC}"
fi

echo -e "${BLUE}Setup complete! You can now visit your worker URL to manage the VS Code tunnel.${NC}"
