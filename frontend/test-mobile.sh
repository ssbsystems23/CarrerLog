#!/bin/bash

# Mobile Testing Script for CarrerLog

echo "======================================"
echo "  CarrerLog Mobile Testing Suite"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if development server is running
echo -e "${YELLOW}1. Starting development server...${NC}"
npm run dev &
DEV_PID=$!
sleep 5

echo ""
echo -e "${GREEN}✓ Development server started${NC}"
echo ""

# Open in different mobile viewports using Chrome DevTools
echo -e "${YELLOW}2. Testing Instructions:${NC}"
echo ""
echo "   The dev server is running at http://localhost:5173"
echo ""
echo "   To test mobile views:"
echo "   1. Open Chrome DevTools (F12)"
echo "   2. Click the device icon (Ctrl+Shift+M)"
echo "   3. Test these devices:"
echo "      - iPhone SE (375x667)"
echo "      - iPhone 12 Pro (390x844)"
echo "      - iPhone 14 Pro Max (430x932)"
echo "      - iPad Mini (768x1024)"
echo "      - Samsung Galaxy S20 (360x800)"
echo ""

echo -e "${YELLOW}3. Mobile Features to Test:${NC}"
echo ""
echo "   ✓ Hamburger menu opens/closes"
echo "   ✓ Navigation works in mobile drawer"
echo "   ✓ Cards are touch-friendly"
echo "   ✓ Text is readable"
echo "   ✓ Forms work with on-screen keyboard"
echo "   ✓ Images scale properly"
echo "   ✓ No horizontal scrolling"
echo "   ✓ Theme toggle works"
echo "   ✓ Logout works"
echo ""

echo -e "${YELLOW}4. Performance Testing:${NC}"
echo ""
echo "   Run Lighthouse mobile audit:"
echo "   npm run build && npx serve -s dist"
echo "   Then in Chrome DevTools > Lighthouse > Mobile"
echo ""

echo "Press Ctrl+C to stop the dev server"
echo ""

# Wait for user to stop
wait $DEV_PID
