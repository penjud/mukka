#!/bin/bash

# GitHub Backup Script for MCP Vue Dashboard
# This script backs up the current state of the Vue Dashboard to GitHub

# Configuration
REPO_NAME="mcp-vue-dashboard"
REPO_OWNER="your-github-username"  # Replace with your GitHub username
BRANCH_NAME="main"
COMMIT_MESSAGE="Automated backup $(date +'%Y-%m-%d %H:%M:%S')"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo -e "${RED}Error: git is not installed.${NC}"
    exit 1
fi

# Navigate to the project directory
cd "$(dirname "$0")" || exit

# Print status
echo -e "${YELLOW}Starting GitHub backup process...${NC}"

# Check if .git directory exists
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}Initializing git repository...${NC}"
    git init
    git remote add origin "https://github.com/$REPO_OWNER/$REPO_NAME.git"
    echo -e "${GREEN}Git repository initialized.${NC}"
else
    echo -e "${YELLOW}Git repository already exists.${NC}"
fi

# Add all files
echo -e "${YELLOW}Adding files to git...${NC}"
git add .

# Commit changes
echo -e "${YELLOW}Committing changes...${NC}"
git commit -m "$COMMIT_MESSAGE"

# Push to GitHub
echo -e "${YELLOW}Pushing to GitHub...${NC}"
git push -u origin "$BRANCH_NAME" || {
    echo -e "${RED}Failed to push to GitHub.${NC}"
    echo -e "${YELLOW}Attempting to force push...${NC}"
    git push -u origin "$BRANCH_NAME" --force
}

# Check the result
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Backup successfully pushed to GitHub.${NC}"
    echo -e "${GREEN}Repository: $REPO_OWNER/$REPO_NAME${NC}"
    echo -e "${GREEN}Branch: $BRANCH_NAME${NC}"
    exit 0
else
    echo -e "${RED}Backup failed.${NC}"
    echo -e "${YELLOW}Please check your GitHub credentials and repository settings.${NC}"
    exit 1
fi
