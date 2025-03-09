#!/bin/bash

# Script to prepare MCP for GitHub
# Author: Claude
# Date: 2025-03-09

# Set working directory
cd "$(dirname "$0")/.."
WORKING_DIR=$(pwd)

echo "=== Preparing MCP for GitHub ==="
echo "Working directory: $WORKING_DIR"

# Create .gitignore file
echo "Creating .gitignore file..."
cat > .gitignore << EOL
# Node.js
node_modules/
npm-debug.log
yarn-debug.log
yarn-error.log
package-lock.json

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Docker
docker-compose.override.yml

# Build outputs
dist/
build/
*.log

# Operating System Files
.DS_Store
Thumbs.db

# Temporary files
*.swp
*.swo
*~

# IDE files
.idea/
.vscode/
*.sublime-project
*.sublime-workspace

# Data directories
data/*
!data/.gitkeep

# Logs
logs/
*.log

# Runtime data
pids/
*.pid
*.seed
*.pid.lock
EOL

# Create data directory with .gitkeep
mkdir -p data
touch data/.gitkeep

# Create README.md
echo "Creating README.md..."
cat > README.md << EOL
# Mothership Command Platform (MCP)

A containerized microservices platform for AI agents and command operations.

## Architecture

MCP is built on a microservices architecture with the following components:

- **Base Server**: Core service registry and coordination
- **Memory Server**: Knowledge graph and memory storage
- **Filesystem Server**: File browsing and management  
- **Brave Search Server**: Web search integration
- **Auth Server**: User authentication and management
- **Ollama Bridge**: Local AI model integration
- **Web UI**: Vue-based dashboard

## Quick Start

1. Clone this repository:
   \`\`\`bash
   git clone https://github.com/yourusername/mukka-mcp-platform.git
   cd mukka-mcp-platform
   \`\`\`

2. Start the services:
   \`\`\`bash
   docker-compose up -d
   \`\`\`

3. Access the dashboard at http://localhost:3002

## Development

### Rebuild Scripts

- \`./scripts/rebuild-all.sh\`: Rebuild all services
- \`./scripts/rebuild-vue-dashboard.sh\`: Rebuild just the Vue Dashboard
- \`./scripts/rebuild-auth-server.sh\`: Rebuild just the Auth Server

## Documentation

See the \`./rag/mukka_vault/01-System/\` directory for detailed documentation:

- DevOps guides
- Handover documents
- Troubleshooting procedures

## License

Proprietary - All rights reserved.
EOL

# Create a logs directory
mkdir -p logs
touch logs/.gitkeep

# Create an init-repo.sh script with git commands
echo "Creating git initialization script..."
cat > init-repo.sh << EOL
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
EOL

chmod +x init-repo.sh

echo "=== Preparation Complete ==="
echo "Now run ./init-repo.sh to initialize the Git repository"
