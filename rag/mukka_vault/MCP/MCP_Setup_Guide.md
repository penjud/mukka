# MCP Setup Guide

This guide covers the setup and maintenance of the MCP (Model Context Protocol) system.

## Initial Setup

### Prerequisites
- Docker and Docker Compose
- Git
- NVIDIA GPU with CUDA support (for optimal LLM performance)
- Ubuntu 22.04 or later

### Installation Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/mukka.git
   cd mukka
   ```

2. Configure environment variables:
   ```bash
   # Create .env file with your Brave Search API key
   cp .env.example .env
   nano .env  # Edit with your API keys
   ```

3. Build and start the containers:
   ```bash
   ./deploy.sh
   ```

4. Verify all services are running:
   ```bash
   ./test-mcp-services.sh
   ```

## Ollama Model Configuration

The following models are configured for use with Ollama:

- llama3.1:8b
- dolphin-mistral:7b
- qwen2.5:7b
- mistral:7b-instruct-v0.2
- phi4-mini:3.8b
- neural-daredevil:8b

To manually pull these models:

```bash
docker exec -it mukka-ollama ollama pull llama3.1:8b
docker exec -it mukka-ollama ollama pull dolphin-mistral:7b
docker exec -it mukka-ollama ollama pull qwen2.5:7b
docker exec -it mukka-ollama ollama pull mistral:7b-instruct-v0.2
docker exec -it mukka-ollama ollama pull phi4-mini:3.8b
docker exec -it mukka-ollama ollama pull neural-daredevil:8b
```

## Service Ports

| Service | Container Name | Port |
|---------|---------------|------|
| Web UI | mukka-mcp-web-ui | 3001 |
| Base Server | mukka-mcp-base-server | 8090 |
| Memory Server | mukka-mcp-memory-server | 8094 |
| Filesystem Server | mukka-mcp-filesystem-server | 8095 |
| Brave Search Server | mukka-mcp-brave-search-server | 8096 |
| Ollama | mukka-ollama | 11434 |
| Ollama Bridge | mukka-mcp-ollama-server | 8082 |

## Troubleshooting

### Common Issues

1. **Services not registering with Base Server**
   - Check network connectivity between containers
   - Verify BASE_SERVER_URL environment variables

2. **Ollama models not loading**
   - Check GPU access and CUDA configuration
   - Verify disk space for model storage

3. **Web UI not connecting to services**
   - Confirm port mappings in docker-compose.yml
   - Check REACT_APP_* environment variables

### Logs

View container logs:
```bash
docker logs mukka-mcp-base-server
docker logs mukka-mcp-web-ui
# etc.
```

## Maintenance

### Backing Up

Important data locations:
- Knowledge graph: `./backend/data/memory/memory.json`
- Ollama models: `./backend/data/ollama/`

### Updating

To update the system:
1. Pull latest changes: `git pull`
2. Rebuild containers: `./deploy.sh`
