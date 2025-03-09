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
   ```bash
   git clone https://github.com/yourusername/mukka-mcp-platform.git
   cd mukka-mcp-platform
   ```

2. Start the services:
   ```bash
   docker-compose up -d
   ```

3. Access the dashboard at http://localhost:3002

## Development

### Rebuild Scripts

- `./scripts/rebuild-all.sh`: Rebuild all services
- `./scripts/rebuild-vue-dashboard.sh`: Rebuild just the Vue Dashboard
- `./scripts/rebuild-auth-server.sh`: Rebuild just the Auth Server

## Documentation

See the `./rag/mukka_vault/01-System/` directory for detailed documentation:

- DevOps guides
- Handover documents
- Troubleshooting procedures

## License

Proprietary - All rights reserved.
