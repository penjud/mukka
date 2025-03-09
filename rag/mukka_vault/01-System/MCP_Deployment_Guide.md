# MCP Deployment Guide

## Overview
This guide covers the deployment of the Model Context Protocol (MCP) ecosystem, which provides AI context management through a set of microservices.

## Components
The MCP system consists of the following components:

1. **Base MCP Server**: Central service registry and discovery
2. **Memory MCP**: Knowledge graph and conversation history storage
3. **Filesystem MCP**: Access to local files and Obsidian vault
4. **Brave Search MCP**: Web search capabilities
5. **Auth MCP**: User authentication and authorization
6. **Ollama**: Local AI model execution
7. **Ollama Bridge**: Interface between MCP and Ollama
8. **Web UI**: User interface for interacting with all services

## Directory Structure
All project components are organized under `/home/mothership/mukka/`:
```
/home/mothership/mukka/
├── backend/
│   ├── services/
│   │   ├── auth/
│   │   ├── base/
│   │   ├── brave-search/
│   │   ├── filesystem/
│   │   ├── memory/
│   │   ├── ollama/
│   │   └── ollama-bridge/
│   ├── config/
│   └── data/
├── rag/
│   └── mukka_vault/
├── docker-compose.yml
├── deploy.sh
└── redeploy.sh
```

## Deployment Instructions

### Prerequisites
- Docker and Docker Compose installed
- GPU drivers for Ollama (if using GPU acceleration)
- Brave Search API key (for web search capabilities)

### Environment Variables
Create a `.env` file in the project root with the following variables:
```
BRAVE_SEARCH_API_KEY=your_brave_search_api_key
JWT_SECRET=your_jwt_secret_for_authentication
MCP_AUTH_TOKEN=your_auth_token_for_ollama_bridge
```

### Deployment Options

#### Option 1: Deploy All Services
```bash
cd /home/mothership/mukka
./redeploy.sh
```

#### Option 2: Deploy Individual Services
```bash
cd /home/mothership/mukka
./deploy.sh base       # Deploy Base MCP Server
./deploy.sh memory     # Deploy Memory MCP Server
./deploy.sh filesystem # Deploy Filesystem MCP Server
./deploy.sh brave      # Deploy Brave Search MCP Server
./deploy.sh auth       # Deploy Auth MCP Server
./deploy.sh ollama     # Deploy Ollama container
./deploy.sh bridge     # Deploy Ollama Bridge
./deploy.sh webui      # Deploy Web UI
```

### Verify Deployment
After deployment, verify that all containers are running:
```bash
cd /home/mothership/mukka
docker-compose ps
```

All containers should be in the "Up" state. Access the Web UI at http://localhost:3001.

## Service Access

| Service | URL | Description |
|---------|-----|-------------|
| Web UI | http://localhost:3001 | Main user interface |
| Base MCP | http://localhost:8090 | Service discovery |
| Memory MCP | http://localhost:8092 | Knowledge storage |
| Filesystem MCP | http://localhost:8091 | File access |
| Brave Search MCP | http://localhost:8096 | Web search |
| Auth MCP | http://localhost:8097 | Authentication |
| Ollama | http://localhost:11434 | Model execution |
| Ollama Bridge | http://localhost:8082 | Model management |

## Initial Configuration

### 1. Create Admin User
```bash
curl -X POST http://localhost:8097/users/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"secure_password","role":"admin"}'
```

### 2. Pull Initial Ollama Model
```bash
curl -X POST http://localhost:8082/api/models \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${MCP_AUTH_TOKEN}" \
  -d '{"model":"llama2:7b"}'
```

## Troubleshooting

### Container Fails to Start
Check the container logs:
```bash
docker logs mukka-mcp-base-server
```

### Port Conflicts
If a port is already in use, edit the `docker-compose.yml` file to change the port mapping.

### Service Communication Issues
Ensure all services are registered with the Base MCP server:
```bash
curl http://localhost:8090/services
```

## Maintenance

### Backup
To backup the data:
```bash
cd /home/mothership/mukka
docker-compose stop
tar -czf mukka-backup-$(date +%Y%m%d).tar.gz backend/data
docker-compose start
```

### Updates
To update the services:
```bash
cd /home/mothership/mukka
git pull
./redeploy.sh
```

## Resources
- [MCP Web UI Repository](https://github.com/penjud/mcp-web-ui)
- [MCP Documentation](https://github.com/penjud/mcp_docs)
- [Filesystem MCP](https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem)
- [Memory MCP](https://github.com/modelcontextprotocol/servers/tree/main/src/memory)
- [Brave Search MCP](https://github.com/modelcontextprotocol/servers/tree/main/src/brave-search)
- [Ollama API Documentation](https://github.com/ollama/ollama/blob/main/docs/api.md)