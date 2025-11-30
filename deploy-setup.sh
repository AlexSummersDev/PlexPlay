#!/bin/bash

# Deploy to GitHub Pages Setup Script
# This script helps you set up your repository for GitHub Pages deployment

echo "🚀 Media Streaming App - GitHub Pages Setup"
echo "=========================================="
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "📦 Initializing Git repository..."
    git init
    echo "✅ Git initialized"
else
    echo "✅ Git repository already initialized"
fi

# Check if there's a remote
if git remote | grep -q origin; then
    echo "✅ Remote 'origin' already configured"
    REMOTE_URL=$(git remote get-url origin)
    echo "   Current remote: $REMOTE_URL"
else
    echo ""
    echo "❓ Enter your GitHub repository URL:"
    echo "   Example: https://github.com/username/repo-name.git"
    read -p "   URL: " REPO_URL

    if [ -n "$REPO_URL" ]; then
        git remote add origin "$REPO_URL"
        echo "✅ Remote added: $REPO_URL"
    else
        echo "⚠️  No remote URL provided. You can add it later with:"
        echo "   git remote add origin YOUR_REPO_URL"
    fi
fi

echo ""
echo "📝 Checking for uncommitted changes..."

# Check if there are changes to commit
if git diff-index --quiet HEAD -- 2>/dev/null; then
    echo "✅ No uncommitted changes"
else
    echo "📦 Staging all files..."
    git add .

    echo "💬 Committing changes..."
    git commit -m "Setup for GitHub Pages deployment"
    echo "✅ Changes committed"
fi

echo ""
echo "🎉 Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Push to GitHub:"
echo "   git push -u origin main"
echo ""
echo "2. Enable GitHub Pages:"
echo "   • Go to your repo on GitHub"
echo "   • Settings → Pages"
echo "   • Source: GitHub Actions"
echo ""
echo "3. Your app will be live at:"
echo "   https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/"
echo ""
echo "📚 For detailed instructions, see QUICKSTART.md"
