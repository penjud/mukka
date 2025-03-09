#!/bin/bash

# Color definitions
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get current date for backup name
BACKUP_DATE=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_DIR="/home/mothership/mukka/backups"
BACKUP_NAME="mcp_backup_${BACKUP_DATE}.tar.gz"

echo -e "${YELLOW}Creating MCP Backup${NC}"
echo "======================="

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# List of directories/files to backup
echo -e "${BLUE}Preparing backup...${NC}"
BACKUP_ITEMS=(
  "backend/config"
  "backend/data"
  "config"
  "docker-compose.yml"
  ".env"
  "rag/mukka_vault/MCP"
)

# Create temp directory for selective backup
TEMP_DIR=$(mktemp -d)
echo -e "${BLUE}Creating temporary directory: ${TEMP_DIR}${NC}"

# Copy selected files/directories to temp directory
for ITEM in "${BACKUP_ITEMS[@]}"; do
  echo -e "${BLUE}Copying ${ITEM}...${NC}"
  mkdir -p $(dirname "${TEMP_DIR}/${ITEM}")
  cp -r "/home/mothership/mukka/${ITEM}" "${TEMP_DIR}/${ITEM}" 2>/dev/null || echo -e "Warning: Could not copy ${ITEM}"
done

# Create backup archive
echo -e "${BLUE}Creating backup archive...${NC}"
tar -czf "${BACKUP_DIR}/${BACKUP_NAME}" -C "${TEMP_DIR}" .

# Clean up temp directory
echo -e "${BLUE}Cleaning up temporary files...${NC}"
rm -rf "${TEMP_DIR}"

# Check if backup was created successfully
if [ -f "${BACKUP_DIR}/${BACKUP_NAME}" ]; then
  BACKUP_SIZE=$(du -h "${BACKUP_DIR}/${BACKUP_NAME}" | cut -f1)
  echo -e "${GREEN}Backup created successfully:${NC}"
  echo -e "  Location: ${BACKUP_DIR}/${BACKUP_NAME}"
  echo -e "  Size: ${BACKUP_SIZE}"
  
  # List existing backups
  echo -e "\n${YELLOW}Existing backups:${NC}"
  ls -lh "${BACKUP_DIR}" | grep "mcp_backup_" | sort -r
else
  echo -e "${RED}Backup creation failed!${NC}"
  exit 1
fi

# Option to create GitHub backup
echo -e "\n${BLUE}Do you want to push this backup to GitHub? (y/n)${NC}"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
  cd /home/mothership/mukka
  
  # Check if Git is initialized
  if [ ! -d ".git" ]; then
    echo -e "${BLUE}Initializing Git repository...${NC}"
    git init
    git add .
    git commit -m "Initial commit"
  fi
  
  # Create backup branch
  BRANCH_NAME="backup-${BACKUP_DATE}"
  echo -e "${BLUE}Creating backup branch: ${BRANCH_NAME}${NC}"
  git checkout -b "${BRANCH_NAME}"
  
  # Add all changes
  git add .
  
  # Commit changes
  git commit -m "Backup ${BACKUP_DATE}"
  
  # Push to remote if remote exists
  if git remote | grep -q "origin"; then
    echo -e "${BLUE}Pushing to remote repository...${NC}"
    git push -u origin "${BRANCH_NAME}"
    echo -e "${GREEN}Backup pushed to GitHub successfully!${NC}"
  else
    echo -e "${YELLOW}No remote repository configured.${NC}"
    echo -e "To push manually, use: git push -u origin ${BRANCH_NAME}"
  fi
  
  # Switch back to main branch
  git checkout main || git checkout master
fi

echo -e "\n${GREEN}Backup process completed!${NC}"
