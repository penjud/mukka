# MCP Project Overview

The Model Context Protocol (MCP) project provides a modular architecture for connecting LLM interfaces with various context providers. This document provides an overview of the implementation.

## Architecture

The project is built using a microservices architecture with the following components:

- **Base MCP Server**: Central registry for all MCP services
- **Memory MCP Server**: Knowledge graph for persistent memory
- **Filesystem MCP Server**: Access to files and directories
- **Brave Search MCP Server**: Web search capabilities
- **Ollama Integration**: Connection to local LLM models

## Deployment

All services are containerized using Docker and orchestrated with Docker Compose.

### Container Structure
```
mothership_mcp-web-ui_1         - React-based UI
mothership_mcp-base-server_1    - Service registry
mothership_mcp-memory_1         - Knowledge graph 
mothership_mcp-filesystem_1     - File access
mothership_mcp-brave-search_1   - Web search
mothership_ollama_1             - LLM models
mothership_mcp-ollama-server_1  - Ollama bridge
```

### Network Architecture

All containers communicate via the `mukka-network` bridge network. The Base MCP Server provides service discovery for other components.

## Usage

1. Access the web UI at http://localhost:3001
2. Use the interface to interact with all MCP services
3. Monitor service health using the test script

## Resources

- [MCP Web UI Repository](https://github.com/penjud/mcp-web-ui)
- [MCP Documentation](https://github.com/penjud/mcp_docs)
- [Model Context Protocol](https://github.com/modelcontextprotocol/servers)
