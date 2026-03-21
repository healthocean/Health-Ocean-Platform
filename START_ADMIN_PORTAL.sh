#!/bin/bash

echo "🛡️  Starting Health Ocean Admin Portal..."
echo ""

# Check if node_modules exists
if [ ! -d "apps/admin-portal/node_modules" ]; then
    echo "📦 Installing dependencies..."
    cd apps/admin-portal
    npm install
    cd ../..
fi

echo "🚀 Starting Admin Portal on port 3002..."
echo "📍 Admin Portal will be available at: http://localhost:3002"
echo ""
echo "🔐 Demo Login Credentials:"
echo "   Email: admin@healthocean.com"
echo "   Password: admin123"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

cd apps/admin-portal
npm run dev
