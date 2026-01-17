#!/bin/bash

# ResQLink Deployment Script
# This script helps deploy the application to various platforms

echo "🚀 ResQLink Deployment Script"
echo "=============================="

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "   Please copy .env.example to .env and fill in your values"
    exit 1
fi

# Build the application
echo "📦 Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build successful!"

# Ask user which platform to deploy to
echo ""
echo "Choose deployment platform:"
echo "1) Vercel (Recommended)"
echo "2) Netlify"
echo "3) Manual (just build)"
echo ""

read -p "Enter choice (1-3): " choice

case $choice in
    1)
        echo "🚀 Deploying to Vercel..."
        if ! command -v vercel &> /dev/null; then
            echo "Installing Vercel CLI..."
            npm i -g vercel
        fi
        vercel --prod
        ;;
    2)
        echo "🚀 Deploying to Netlify..."
        if ! command -v netlify &> /dev/null; then
            echo "Installing Netlify CLI..."
            npm i -g netlify-cli
        fi
        netlify deploy --prod --dir=build
        ;;
    3)
        echo "✅ Build ready in ./build directory"
        echo "   You can manually deploy the contents of ./build to any static hosting service"
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "🎉 Deployment complete!"
echo "   Don't forget to set environment variables in your deployment platform!"