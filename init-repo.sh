#!/bin/bash

# Initialize Git repository
git init

# Add all files
git add .

# Make initial commit
git commit -m "Initial commit: Fixed authentication and Docker networking issues"

# Instructions for pushing to GitHub
echo ""
echo "=== NEXT STEPS ==="
echo "To push to GitHub, run the following commands:"
echo ""
echo "1. Add your GitHub repository as remote:"
echo "   git remote add origin https://github.com/YOUR_USERNAME/mukka-mcp-platform.git"
echo ""
echo "2. Push to GitHub:"
echo "   git push -u origin main"
echo ""
