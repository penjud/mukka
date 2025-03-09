#!/bin/bash
# MukkaAI GitHub Backup Script
# This script creates a comprehensive backup of the entire MukkaAI system to GitHub

set -e  # Exit immediately if a command exits with a non-zero status
echo "Starting MukkaAI GitHub backup process..."

# Change to the mukka directory
cd /home/mothership/mukka

# Create a timestamp for the commit message
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
COMMIT_MSG="Automated backup $TIMESTAMP - Documentation and Docker configuration"

# Status before backup
echo "Current git status:"
git status

# Add all changed files
echo "Adding all changes to git..."
git add .

# Commit changes
echo "Committing changes..."
git commit -m "$COMMIT_MSG"

# Push to GitHub
echo "Pushing changes to GitHub..."
git push origin master

# Verify backup
echo "Verifying backup..."
git log -1 --stat

# Summary of current Docker state
echo -e "\nCurrent Docker container state:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Show repository status
echo -e "\nBackup complete! Repository is now up to date."
echo "You can recover your system by cloning from: $(git remote -v | grep fetch | awk '{print $2}')"
echo -e "\nTo restore the system on a new machine:"
echo "1. Clone the repository: git clone $(git remote -v | grep fetch | awk '{print $2}')"
echo "2. Navigate to the directory: cd mukka"
echo "3. Run the deployment script: ./deploy.sh"
echo -e "\nBackup completed successfully at $(date)"
