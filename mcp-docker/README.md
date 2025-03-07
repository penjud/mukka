# MCP Docker Compose Setup

Docker Compose configuration for the Model Context Protocol (MCP) services.

## Services Included

- **MCP Web UI**: Web interface for interacting with LLMs
- **MCP Memory**: Knowledge graph for persistent memory
- **MCP Filesystem**: Filesystem operations interface
- **MCP Brave Search**: Web and local search capabilities

## Prerequisites

- Docker Desktop
- API keys for LLM providers (if using)
- Brave Search API key (if using search capability)

## Setup Instructions

1. Edit the `.env` file with your API keys:
   ```
   ANTHROPIC_API_KEY=your_anthropic_key_here
   OPENAI_API_KEY=your_openai_key_here
   OPENROUTER_API_KEY=your_openrouter_key_here
   BRAVE_API_KEY=your_brave_api_key_here
   ```

2. Customize the `config/mcpwebui/config.yaml` file as needed

3. Start the services:
   ```
   docker-compose up -d
   ```

4. Stop any existing Docker containers if necessary:
   ```
   docker-compose down
   ```

## Accessing the UI

The MCP Web UI is available at http://localhost:8080 after starting the services.

## Data Persistence

- Memory data is stored in the `mcp-memory-data` Docker volume
- Files accessible through the filesystem service should be placed in the `projects` directory

## References

- [MCP Web UI](https://github.com/penjud/mcp-web-ui)
- [MCP Documentation](https://github.com/penjud/mcp_docs)
- [MCP Servers](https://github.com/modelcontextprotocol/servers)
