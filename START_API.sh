#!/bin/bash

echo "🌊 Starting Health Ocean API Server..."
echo ""

cd apps/api

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Check if .env exists
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cp .env.example .env
fi

echo ""
echo "Starting API server on http://localhost:4000"
echo ""

npm run dev
