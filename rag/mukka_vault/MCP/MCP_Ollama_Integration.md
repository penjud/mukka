# MCP Ollama Integration

This document describes the implementation of the Ollama integration with the Model Context Protocol (MCP).

## Architecture

The integration consists of two components:

1. **Ollama Server**: Runs the LLM models locally
2. **MCP Ollama Bridge**: Connects Ollama to the MCP ecosystem

```
Web UI ↔ MCP Base Server ↔ MCP Ollama Bridge ↔ Ollama Server
```

## Available Models

The following models are configured:

- **llama3.1:8b**: Versatile general-purpose model
- **dolphin-mistral:7b**: Uncensored assistant model
- **qwen2.5:7b**: High-performance Chinese-English model
- **mistral:7b-instruct-v0.2**: Instruction-tuned Mistral 
- **phi4-mini:3.8b**: Small efficient model from Microsoft
- **neural-daredevil:8b**: Creative storytelling model

## API Endpoints

The MCP Ollama Bridge exposes these endpoints:

- `GET /`: Status information
- `POST /chat`: Send chat messages to models
- `GET /models`: List available models
- `POST /mcp/query`: MCP protocol integration

## Performance Considerations

- GPU acceleration is critical for optimal performance
- Models are loaded on-demand to conserve memory
- Response streaming reduces time-to-first-token

## Configuration

The Ollama Bridge is configured via environment variables:

```
PORT=8082
OLLAMA_HOST=http://ollama:11434
BASE_SERVER_URL=http://mcp-base-server:8090
```

## Integration Examples

### Direct API Call
```javascript
const response = await fetch('http://localhost:8082/chat', {
  method: 'POST',
  body: JSON.stringify({
    model: 'llama3.1:8b',
    messages: [
      { role: 'user', content: 'Hello, world!' }
    ]
  })
});
```

### Via MCP Protocol
```javascript
const response = await fetch('http://localhost:8090/mcp/query', {
  method: 'POST',
  body: JSON.stringify({
    service: 'ollama',
    query: 'Hello, world!',
    options: {
      model: 'llama3.1:8b'
    }
  })
});
```
