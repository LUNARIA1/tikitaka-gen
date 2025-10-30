#!/bin/bash

# GitHub OAuth Device Flow Script
CLIENT_ID="01ab8ac9400c4e429b23"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${GREEN}GitHub OAuth Device Flow${NC}"
echo -e "${GREEN}========================${NC}"

# Get device code
echo "Getting device code..."
DEVICE_RESPONSE=$(curl -s -X POST \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d "{\"client_id\":\"$CLIENT_ID\",\"scope\":\"user:email\"}" \
  https://github.com/login/device/code)

if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Failed to get device code${NC}"
    exit 1
fi

# Parse response
VERIFICATION_URI=$(echo "$DEVICE_RESPONSE" | grep -o '"verification_uri":"[^"]*"' | cut -d'"' -f4)
USER_CODE=$(echo "$DEVICE_RESPONSE" | grep -o '"user_code":"[^"]*"' | cut -d'"' -f4)
DEVICE_CODE=$(echo "$DEVICE_RESPONSE" | grep -o '"device_code":"[^"]*"' | cut -d'"' -f4)

if [ -z "$DEVICE_CODE" ]; then
    echo -e "${RED}Error: Failed to parse device code response${NC}"
    exit 1
fi

# Show instructions
echo ""
echo -e "${CYAN}1. Go to: $VERIFICATION_URI${NC}"
echo -e "${CYAN}2. Enter the code: $USER_CODE${NC}"
echo ""
read -p "Press Enter after completing authentication..."

# Poll for access token
echo -e "${YELLOW}Getting access token...${NC}"
MAX_ATTEMPTS=30
ATTEMPT=0

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    ATTEMPT=$((ATTEMPT + 1))
    sleep 5
    
    TOKEN_RESPONSE=$(curl -s -X POST \
      -H "Accept: application/json" \
      -H "Content-Type: application/json" \
      -d "{\"client_id\":\"$CLIENT_ID\",\"device_code\":\"$DEVICE_CODE\",\"grant_type\":\"urn:ietf:params:oauth:grant-type:device_code\",\"scope\":\"user:email\"}" \
      https://github.com/login/oauth/access_token)
    
    # Check for access token
    ACCESS_TOKEN=$(echo "$TOKEN_RESPONSE" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
    
    if [ -n "$ACCESS_TOKEN" ]; then
        # Save token to file
        echo "$ACCESS_TOKEN" > token.txt
        echo ""
        echo -e "${GREEN}Success! Token saved to: $(pwd)/token.txt${NC}"
        echo -e "${GREEN}Token: $ACCESS_TOKEN${NC}"
        exit 0
    fi
    
    # Check for authorization pending
    if echo "$TOKEN_RESPONSE" | grep -q '"error":"authorization_pending"'; then
        echo -e "${YELLOW}Waiting for authorization... (attempt $ATTEMPT/$MAX_ATTEMPTS)${NC}"
        continue
    fi
    
    # Check for other errors
    ERROR=$(echo "$TOKEN_RESPONSE" | grep -o '"error":"[^"]*"' | cut -d'"' -f4)
    if [ -n "$ERROR" ]; then
        echo -e "${RED}Error: $ERROR${NC}"
        exit 1
    fi
done

echo -e "${RED}Timeout waiting for authorization${NC}"
exit 1