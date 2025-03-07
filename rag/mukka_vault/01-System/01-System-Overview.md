---
title: System Overview
created: 2025-03-07 12:45:00
modified: 2025-03-07 12:45:00
tags: [system, overview, mcp]
aliases: [system]
---

# System Overview

## Components

### MCP Servers
- **Memory MCP**: Stores knowledge graph information
- **Filesystem MCP**: Provides access to files and directories
- **Brave Search MCP**: Enables web search capabilities

### Ollama Integration
- Models: llama3.1:8b, dolphin-mistral:7b, NeuralDaredevil-8B-abliterated

### Obsidian Vault
- Structured knowledge storage
- Template-based note creation
- Integrated with MCP for RAG capabilities

## Architecture
```mermaid
graph TD
    UI[MCP Web UI] --> Memory[Memory MCP]
    UI --> FileSystem[Filesystem MCP]
    UI --> Search[Brave Search MCP]
    UI --> Ollama[Ollama]
    Memory --> KnowledgeGraph[Knowledge Graph]
    FileSystem --> Obsidian[Obsidian Vault]
    Ollama --> Models[AI Models]
```

## Edit History

| Date | Time | Edit | Author |
| ---- | ---- | ---- | ------ |
| 2025-03-07 | 12:45 | Initial creation | Claude |
