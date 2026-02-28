#!/bin/bash

echo "🔄 Restarting development server to fix TypeScript module recognition..."

# Kill any existing dev server
pkill -f "npm run dev" 2>/dev/null
pkill -f "vite" 2>/dev/null

# Clear TypeScript cache
rm -rf node_modules/.vite 2>/dev/null
rm -rf .vite 2>/dev/null
rm -rf dist 2>/dev/null

# Clear npm cache
npm cache clean --force 2>/dev/null

# Install dependencies (if needed)
npm install

# Restart development server
echo "🚀 Starting development server..."
npm run dev
