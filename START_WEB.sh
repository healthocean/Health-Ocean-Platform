#!/bin/bash

echo "🌊 Starting Health Ocean Web App..."
echo ""

cd apps/web

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

echo ""
echo "Starting development server on http://localhost:3000"
echo ""

npm run dev
