#!/bin/bash

echo "🏥 Starting Health Ocean Lab Portal..."
echo ""

# Check if node_modules exists
if [ ! -d "apps/lab-portal/node_modules" ]; then
    echo "📦 Installing dependencies..."
    cd apps/lab-portal
    npm install
    cd ../..
fi

echo "🚀 Starting Lab Portal on port 3001..."
echo "📍 Lab Portal will be available at: http://localhost:3001"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

cd apps/lab-portal
npm run dev
