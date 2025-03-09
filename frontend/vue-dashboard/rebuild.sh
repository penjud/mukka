#!/bin/bash

# Rebuild script to apply changes and rebuild the application

set -e

echo "Removing problematic scripts..."
rm -f public/profile-fix.js public/button-fix.js public/loading-state-fix.js

echo "Building application..."
npm run build

echo "Examining dist directory..."
ls -la dist/

echo "Removing any remaining fix scripts from dist..."
rm -f dist/profile-fix.js dist/button-fix.js dist/loading-state-fix.js

echo "Removing old custom CSS fix..."
rm -f src/views/settings/profile-button-fix.css

echo "Rebuild completed. Please restart the application to apply changes."
