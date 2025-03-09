# Model Switching with Ollama Bridge

## Overview
The Ollama Bridge server provides a way to manage and switch between different AI models in the MCP ecosystem. This document explains how the model switching functionality works and how to use it.

## How It Works

### Real-time Model Management
The Ollama Bridge server uses Socket.IO to provide real-time updates on model status:

1. **Model List**: The server maintains a current list of available models by querying the Ollama API.
2. **Pull Status**: Users can initiate model downloads, with real-time progress updates.
3. **Model Switching**: The currently active model can be changed on the fly.

### API Endpoints

The Ollama Bridge provides the following endpoints:

- `GET /api/models` - List all available models
- `POST /api/generate` - Generate text with a specific model
- `POST /api/chat` - Chat completion with a specific model
- `DELETE /api/models/:name` - Delete a model

### Socket.IO Events

Real-time communication is handled through these events:

- `models` - Emitted when the models list changes
- `modelStatus` - Updates about model pull status (pulling, success, error)
- `generationUpdate` - Stream updates during text generation
- `generationComplete` - Emitted when generation is complete

## Using Model Switching

### From the Web UI
1. Connect to the MCP Web UI at http://localhost:3001
2. Navigate to the Models tab
3. View available models
4. Click "Pull" to download a new model
5. Select a model to make it active
6. Use the Chat interface with the selected model

### Programmatically
```javascript
// Connect to the Socket.IO server
const socket = io('http://localhost:8082');

// Listen for models list
socket.on('models', (models) => {
  console.log('Available models:', models);
});

// Pull a new model
socket.emit('pullModel', 'llama2:7b');

// Listen for model status updates
socket.on('modelStatus', (status) => {
  console.log(`Model ${status.model}: ${status.status} - ${status.message}`);
});

// Generate text with a specific model
socket.emit('streamGeneration', {
  model: 'llama2:7b',
  prompt: 'Explain quantum computing in simple terms',
  system: 'You are a helpful assistant'
});

// Receive generation updates
socket.on('generationUpdate', (data) => {
  console.log('Generated text chunk:', data.response);
});

// Generation complete
socket.on('generationComplete', () => {
  console.log('Generation complete');
});
```

## Supported Models

The Ollama Bridge supports all models available through Ollama, including:

- llama2 (various sizes)
- mistral (various sizes)
- codellama
- phi-2
- orca-mini
- vicuna

## Performance Considerations

- Larger models require more GPU memory
- Model switching has a small delay when loading models into memory
- Streaming generation is more responsive than batched generation

## Security

- Authentication is required for all Ollama Bridge API endpoints
- Use the `MCP_AUTH_TOKEN` environment variable to set the authentication token