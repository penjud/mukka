---
title: MukkaAI API Reference
created: 2025-03-09 22:00:00
modified: 2025-03-09 22:00:00
tags:
  - api
  - reference
  - documentation
  - mukkaai
status: complete
version: 1.0
---

# MukkaAI API Reference

This document provides detailed API documentation for all MukkaAI services in the Mukka platform.

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-03-09 | Documentation Team | Updated from MCP to MukkaAI branding, added version history, added service container names |

> **Note on Naming**: While this document uses "MukkaAI" branding, the underlying Docker containers and environment variables still use "MCP" in their names as part of the transition process.

## Table of Contents

1. [Auth Service](#auth-service)
2. [Memory Service](#memory-service)
3. [Filesystem Service](#filesystem-service)
4. [Brave Search Service](#brave-search-service)
5. [Ollama Bridge](#ollama-bridge)
6. [Common Response Formats](#common-response-formats)
7. [Error Handling](#error-handling)

---

## Auth Service

Base URL: `http://localhost:8097`  
Container Name: `mukka-mcp-auth-server`

The Auth Service provides authentication, user management, and profile services.

### Authentication Endpoints

#### Health Check

```
GET /
```

Returns the server status and information.

**Response:**
```json
{
  "status": "ok",
  "version": "1.0.0",
  "service": "mukkaai-auth"
}
```

#### Login

```
POST /login
```

Authenticates a user and returns a session token.

**Request Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "user": {
    "username": "admin",
    "role": "admin",
    "name": "Administrator",
    "email": "admin@example.com",
    "preferences": {
      "theme": "dark",
      "language": "en"
    }
  },
  "message": "Login successful"
}
```

**Notes:** 
- The token is set as an HTTP-only cookie
- Response includes user profile information

#### Logout

```
POST /logout
```

Invalidates the current session token.

**Response:**
```json
{
  "message": "Logout successful"
}
```

#### Verify Token

```
POST /verify
```

Verifies if the current token is valid.

**Response:**
```json
{
  "valid": true
}
```

### User Management Endpoints

#### Get Current User

```
GET /me
```

Returns the profile of the currently authenticated user.

**Response:**
```json
{
  "username": "admin",
  "role": "admin",
  "name": "Administrator",
  "email": "admin@example.com",
  "preferences": {
    "theme": "dark",
    "language": "en"
  }
}
```

#### List Users

```
GET /users
```

Returns a list of all users. Requires admin role.

**Response:**
```json
[
  {
    "username": "admin",
    "role": "admin",
    "name": "Administrator",
    "email": "admin@example.com"
  },
  {
    "username": "user1",
    "role": "user",
    "name": "Test User",
    "email": "user1@example.com"
  }
]
```

#### Create User

```
POST /users
```

Creates a new user. Requires admin role.

**Request Body:**
```json
{
  "username": "newuser",
  "password": "Password123!",
  "role": "user",
  "name": "New User",
  "email": "newuser@example.com"
}
```

**Response:**
```json
{
  "user": {
    "username": "newuser",
    "role": "user",
    "name": "New User",
    "email": "newuser@example.com"
  },
  "message": "User created successfully"
}
```

#### Delete User

```
DELETE /users/:username
```

Deletes a user. Requires admin role.

**Response:**
```json
{
  "message": "User deleted successfully"
}
```

#### Change Password

```
PUT /password
```

Changes the password for the current user.

**Request Body:**
```json
{
  "currentPassword": "oldPassword",
  "newPassword": "newPassword123!"
}
```

**Response:**
```json
{
  "message": "Password changed successfully"
}
```

---

## Memory Service

Base URL: `http://localhost:8094`  
Container Name: `mukka-mcp-memory-server`

The Memory Service manages conversation history and agent profiles.

### Health Check

```
GET /health
```

Returns the server status.

**Response:**
```json
{
  "status": "ok",
  "version": "1.0.0",
  "service": "mukkaai-memory"
}
```

### Conversation Endpoints

#### List Conversations

```
GET /api/conversations
```

Returns a list of all conversations.

**Query Parameters:**
- `limit` (optional): Maximum number of conversations to return
- `offset` (optional): Offset for pagination

**Response:**
```json
[
  {
    "id": "4f3d8e2a-5b9c-4e1d-8f6a-7d2b9c3e5a4d",
    "title": "Chat with Research Assistant",
    "agentId": "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
    "updatedAt": "2025-03-07T12:34:56Z",
    "createdAt": "2025-03-07T12:30:00Z",
    "messageCount": 8
  },
  {
    "id": "8a7b6c5d-4e3f-2g1h-0i9j-8k7l6m5n4o3p",
    "title": "Chat with Coding Helper",
    "agentId": "9i8h7g6f-5e4d-3c2b-1a0z-9y8x7w6v5u4t",
    "updatedAt": "2025-03-06T15:45:23Z",
    "createdAt": "2025-03-06T15:40:12Z",
    "messageCount": 12
  }
]
```

#### Create Conversation

```
POST /api/conversations
```

Creates a new conversation.

**Request Body:**
```json
{
  "id": "4f3d8e2a-5b9c-4e1d-8f6a-7d2b9c3e5a4d",
  "title": "Chat with Research Assistant",
  "agentId": "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
  "metadata": {
    "agentName": "Research Assistant"
  },
  "createdAt": "2025-03-08T10:30:00Z",
  "updatedAt": "2025-03-08T10:30:00Z",
  "messages": []
}
```

**Response:**
```json
{
  "id": "4f3d8e2a-5b9c-4e1d-8f6a-7d2b9c3e5a4d",
  "title": "Chat with Research Assistant",
  "agentId": "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
  "metadata": {
    "agentName": "Research Assistant"
  },
  "createdAt": "2025-03-08T10:30:00Z",
  "updatedAt": "2025-03-08T10:30:00Z",
  "messages": []
}
```

#### Get Conversation

```
GET /api/conversations/:id
```

Returns a conversation by ID.

**Response:**
```json
{
  "id": "4f3d8e2a-5b9c-4e1d-8f6a-7d2b9c3e5a4d",
  "title": "Chat with Research Assistant",
  "agentId": "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
  "metadata": {
    "agentName": "Research Assistant"
  },
  "createdAt": "2025-03-08T10:30:00Z",
  "updatedAt": "2025-03-08T10:45:32Z",
  "messages": [
    {
      "id": "msg-1",
      "role": "user",
      "content": "Hello, can you help me with my research?",
      "createdAt": "2025-03-08T10:42:15Z"
    },
    {
      "id": "msg-2",
      "role": "assistant",
      "content": "Of course! I'd be happy to help with your research. What topic are you working on?",
      "createdAt": "2025-03-08T10:42:30Z"
    }
  ]
}
```

#### Get Conversation Messages

```
GET /api/conversations/:id/messages
```

Returns messages for a specific conversation.

**Query Parameters:**
- `limit` (optional): Maximum number of messages to return
- `before` (optional): Return messages before this timestamp
- `after` (optional): Return messages after this timestamp

**Response:**
```json
[
  {
    "id": "msg-1",
    "role": "user",
    "content": "Hello, can you help me with my research?",
    "createdAt": "2025-03-08T10:42:15Z"
  },
  {
    "id": "msg-2",
    "role": "assistant",
    "content": "Of course! I'd be happy to help with your research. What topic are you working on?",
    "createdAt": "2025-03-08T10:42:30Z"
  }
]
```

#### Add Message to Conversation

```
POST /api/conversations/:id/messages
```

Adds a new message to a conversation.

**Request Body:**
```json
{
  "role": "user",
  "content": "I'm researching climate change impacts on agriculture."
}
```

**Response:**
```json
{
  "id": "msg-3",
  "role": "user",
  "content": "I'm researching climate change impacts on agriculture.",
  "createdAt": "2025-03-08T10:45:32Z"
}
```

### Agent Endpoints

#### List Agents

```
GET /api/agents
```

Returns a list of all agents.

**Response:**
```json
[
  {
    "id": "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
    "name": "Research Assistant",
    "description": "Helps you research topics and summarize information",
    "avatar": null,
    "color": "blue",
    "traits": ["Analytical", "Detailed", "Helpful"],
    "expertise": ["Research", "Writing", "Analysis"],
    "model": "llama3.1:8b",
    "systemPrompt": "You are a research assistant, focused on finding accurate information and presenting it clearly.",
    "createdAt": "2025-03-05T10:30:00Z",
    "updatedAt": "2025-03-05T10:30:00Z"
  },
  {
    "id": "9i8h7g6f-5e4d-3c2b-1a0z-9y8x7w6v5u4t",
    "name": "Coding Helper",
    "description": "Assists with programming and technical problems",
    "avatar": null,
    "color": "green",
    "traits": ["Technical", "Precise", "Patient"],
    "expertise": ["Programming", "Debugging", "Software Design"],
    "model": "mistral:7b",
    "systemPrompt": "You are a coding assistant, focused on helping with programming tasks and explaining technical concepts clearly.",
    "createdAt": "2025-03-05T11:15:00Z",
    "updatedAt": "2025-03-05T11:15:00Z"
  }
]
```

#### Create Agent

```
POST /api/agents
```

Creates a new agent.

**Request Body:**
```json
{
  "id": "5a4b3c2d-1e0f-9g8h-7i6j-5k4l3m2n1o0p",
  "name": "Creative Writer",
  "description": "Helps with creative writing and storytelling",
  "avatar": null,
  "color": "purple",
  "traits": ["Creative", "Enthusiastic", "Detailed"],
  "expertise": ["Writing", "Storytelling", "Creativity"],
  "model": "llama3.1:8b",
  "systemPrompt": "You are a creative writing assistant, focused on helping with storytelling, creative ideas, and narrative development.",
  "createdAt": "2025-03-08T14:25:00Z",
  "updatedAt": "2025-03-08T14:25:00Z"
}
```

**Response:**
```json
{
  "id": "5a4b3c2d-1e0f-9g8h-7i6j-5k4l3m2n1o0p",
  "name": "Creative Writer",
  "description": "Helps with creative writing and storytelling",
  "avatar": null,
  "color": "purple",
  "traits": ["Creative", "Enthusiastic", "Detailed"],
  "expertise": ["Writing", "Storytelling", "Creativity"],
  "model": "llama3.1:8b",
  "systemPrompt": "You are a creative writing assistant, focused on helping with storytelling, creative ideas, and narrative development.",
  "createdAt": "2025-03-08T14:25:00Z",
  "updatedAt": "2025-03-08T14:25:00Z"
}
```

#### Get Agent

```
GET /api/agents/:id
```

Returns an agent by ID.

**Response:**
```json
{
  "id": "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
  "name": "Research Assistant",
  "description": "Helps you research topics and summarize information",
  "avatar": null,
  "color": "blue",
  "traits": ["Analytical", "Detailed", "Helpful"],
  "expertise": ["Research", "Writing", "Analysis"],
  "model": "llama3.1:8b",
  "systemPrompt": "You are a research assistant, focused on finding accurate information and presenting it clearly.",
  "createdAt": "2025-03-05T10:30:00Z",
  "updatedAt": "2025-03-05T10:30:00Z"
}
```

#### Update Agent

```
PUT /api/agents/:id
```

Updates an existing agent.

**Request Body:**
```json
{
  "name": "Advanced Research Assistant",
  "description": "Helps you research complex topics and summarize information",
  "color": "indigo",
  "traits": ["Analytical", "Detailed", "Helpful", "Thorough"],
  "expertise": ["Research", "Writing", "Analysis", "Academic"],
  "model": "llama3.1:8b",
  "systemPrompt": "You are an advanced research assistant, focused on finding accurate information and presenting it clearly with academic rigor."
}
```

**Response:**
```json
{
  "id": "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
  "name": "Advanced Research Assistant",
  "description": "Helps you research complex topics and summarize information",
  "avatar": null,
  "color": "indigo",
  "traits": ["Analytical", "Detailed", "Helpful", "Thorough"],
  "expertise": ["Research", "Writing", "Analysis", "Academic"],
  "model": "llama3.1:8b",
  "systemPrompt": "You are an advanced research assistant, focused on finding accurate information and presenting it clearly with academic rigor.",
  "createdAt": "2025-03-05T10:30:00Z",
  "updatedAt": "2025-03-08T15:20:00Z"
}
```

#### Delete Agent

```
DELETE /api/agents/:id
```

Deletes an agent by ID.

**Response:**
```json
{
  "message": "Agent deleted successfully"
}
```

---

## Filesystem Service

Base URL: `http://localhost:8095`  
Container Name: `mukka-mcp-filesystem-server`

The Filesystem Service provides file and directory management capabilities.

### Health Check

```
GET /health
```

Returns the server status.

**Response:**
```json
{
  "status": "ok",
  "version": "1.0.0",
  "service": "mukkaai-filesystem"
}
```

### File Management Endpoints

#### List Files and Directories

```
GET /api/files
```

Lists files and directories in the root directory.

**Query Parameters:**
- `path` (optional): Path to list (default: root)

**Response:**
```json
[
  {
    "name": "documents",
    "type": "directory",
    "path": "/documents",
    "size": null,
    "modified": "2025-03-05T10:30:00Z"
  },
  {
    "name": "images",
    "type": "directory",
    "path": "/images",
    "size": null,
    "modified": "2025-03-06T15:45:00Z"
  },
  {
    "name": "notes.txt",
    "type": "file",
    "path": "/notes.txt",
    "size": 1024,
    "modified": "2025-03-07T12:30:00Z"
  }
]
```

#### Get File Content

```
GET /api/files/:path
```

Returns the content of a file.

**Path Parameters:**
- `path`: Path to the file (URL-encoded)

**Response:**
- If text file: Raw text content with appropriate content type
- If binary file: Binary data with appropriate content type
- If directory: JSON listing of directory contents

Example directory response:
```json
[
  {
    "name": "document1.pdf",
    "type": "file",
    "path": "/documents/document1.pdf",
    "size": 102400,
    "modified": "2025-03-05T10:35:00Z"
  },
  {
    "name": "document2.txt",
    "type": "file",
    "path": "/documents/document2.txt",
    "size": 2048,
    "modified": "2025-03-06T11:20:00Z"
  }
]
```

#### Create or Update File

```
PUT /api/files/:path
```

Creates or updates a file.

**Path Parameters:**
- `path`: Path to the file (URL-encoded)

**Request Body:**
- Text files: Raw text content with appropriate content type
- Binary files: Binary data with appropriate content type

**Response:**
```json
{
  "name": "notes.txt",
  "type": "file",
  "path": "/notes.txt",
  "size": 1024,
  "modified": "2025-03-08T16:30:00Z"
}
```

#### Delete File or Directory

```
DELETE /api/files/:path
```

Deletes a file or directory.

**Path Parameters:**
- `path`: Path to the file or directory (URL-encoded)

**Query Parameters:**
- `recursive` (optional): If `true`, delete directories recursively (default: `false`)

**Response:**
```json
{
  "message": "File deleted successfully"
}
```

---

## Brave Search Service

Base URL: `http://localhost:8096`  
Container Name: `mukka-mcp-brave-search-server`

The Brave Search Service provides web search capabilities using the Brave Search API.

### Health Check

```
GET /health
```

Returns the server status.

**Response:**
```json
{
  "status": "ok",
  "version": "1.0.0",
  "service": "mukkaai-brave-search"
}
```

### Search Endpoints

#### Web Search

```
GET /api/search
```

Performs a web search using the Brave Search API.

**Query Parameters:**
- `q` (required): Search query
- `count` (optional): Number of results to return (default: 10, max: 20)
- `offset` (optional): Result offset for pagination (default: 0)
- `safesearch` (optional): Safe search level (0: off, 1: moderate, 2: strict)
- `freshness` (optional): Result freshness (null, 'day', 'week', 'month')

**Response:**
```json
{
  "results": [
    {
      "title": "Example Search Result",
      "url": "https://example.com/page1",
      "description": "This is an example search result that shows the structure of the response.",
      "age": "3d",
      "favicon": "https://example.com/favicon.ico"
    },
    {
      "title": "Another Search Result",
      "url": "https://example.com/page2",
      "description": "This is another example search result with different content.",
      "age": "1w",
      "favicon": "https://example.com/favicon.ico"
    }
  ],
  "meta": {
    "total": 1250,
    "page": 1,
    "count": 10,
    "query": "example search query"
  }
}
```

#### Local Search

```
GET /api/search/local
```

Performs a local search using the Brave Search API.

**Query Parameters:**
- `q` (required): Search query with location context (e.g., "coffee shops near San Francisco")
- `count` (optional): Number of results to return (default: 5, max: 20)

**Response:**
```json
{
  "results": [
    {
      "name": "Example Coffee Shop",
      "address": "123 Main St, San Francisco, CA 94101",
      "phone": "+1 (555) 123-4567",
      "rating": 4.5,
      "reviewCount": 123,
      "hours": "Open 8:00 AM - 8:00 PM",
      "url": "https://example.com/coffee-shop",
      "categories": ["Coffee Shop", "Cafe"]
    },
    {
      "name": "Another Coffee Shop",
      "address": "456 Market St, San Francisco, CA 94102",
      "phone": "+1 (555) 765-4321",
      "rating": 4.2,
      "reviewCount": 89,
      "hours": "Open 7:00 AM - 7:00 PM",
      "url": "https://example.com/another-coffee",
      "categories": ["Coffee Shop", "Bakery"]
    }
  ],
  "meta": {
    "total": 24,
    "count": 5,
    "query": "coffee shops near San Francisco"
  }
}
```

---

## Ollama Bridge

Base URL: `http://localhost:8082`  
Container Name: `mukka-mcp-ollama-bridge`

The Ollama Bridge provides access to local LLM models through Ollama.

### Health Check

```
GET /health
```

Returns the server status.

**Response:**
```json
{
  "status": "ok",
  "version": "1.0.0",
  "service": "mukkaai-ollama-bridge"
}
```

### Model Endpoints

#### List Models

```
GET /api/models
```

Lists available models from Ollama.

**Response:**
```json
{
  "models": [
    {
      "name": "llama3.1:8b",
      "size": "8B",
      "family": "llama",
      "quantization": "Q5_K_M",
      "format": "GGUF"
    },
    {
      "name": "mistral:7b",
      "size": "7B",
      "family": "mistral",
      "quantization": "Q4_K_M",
      "format": "GGUF"
    },
    {
      "name": "gemma2:9b",
      "size": "9B",
      "family": "gemma",
      "quantization": "Q5_K_M",
      "format": "GGUF"
    }
  ]
}
```

#### Chat Completion

```
POST /api/chat
```

Generates a chat completion using a specified model.

**Request Body:**
```json
{
  "model": "llama3.1:8b",
  "messages": [
    {
      "role": "system",
      "content": "You are a helpful research assistant."
    },
    {
      "role": "user",
      "content": "What are the main effects of climate change on agriculture?"
    }
  ],
  "stream": false,
  "temperature": 0.7,
  "max_tokens": 1024
}
```

**Response:**
```json
{
  "id": "chatcmpl-123456789",
  "object": "chat.completion",
  "created": 1709968452,
  "model": "llama3.1:8b",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Climate change has several significant effects on agriculture worldwide:\n\n1. **Changing growing seasons**: Rising temperatures are altering traditional growing seasons, affecting planting and harvesting times.\n\n2. **Water availability**: Changes in precipitation patterns lead to droughts in some regions and flooding in others, both of which can damage crops.\n\n3. **Extreme weather events**: Increased frequency and intensity of storms, floods, and heatwaves can destroy crops and reduce yields.\n\n4. **Pest and disease pressure**: Warmer temperatures allow pests and diseases to expand their ranges and potentially affect crops year-round.\n\n5. **Reduced crop yields**: Many staple crops like wheat, rice, and corn show decreased yields under higher temperatures and CO2 levels.\n\n6. **Livestock stress**: Heat stress in livestock can reduce productivity, fertility, and increase mortality rates.\n\n7. **Sea level rise**: Coastal agricultural lands face increased flooding and saltwater intrusion.\n\n8. **Nutritional changes**: Some studies suggest elevated CO2 levels may reduce the nutritional value of certain crops.\n\nFarmers are adapting through various strategies including developing drought-resistant crops, adjusting planting schedules, improving irrigation efficiency, and diversifying crop varieties."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 27,
    "completion_tokens": 215,
    "total_tokens": 242
  }
}
```

#### Streaming Chat Completion

To use streaming, set `stream: true` in the request body. The response will be sent as a series of Server-Sent Events (SSE) with the following format:

```
event: message
data: {"id":"chatcmpl-123456789","object":"chat.completion.chunk","created":1709968452,"model":"llama3.1:8b","choices":[{"index":0,"delta":{"role":"assistant","content":"Climate"},"finish_reason":null}]}

event: message
data: {"id":"chatcmpl-123456789","object":"chat.completion.chunk","created":1709968452,"model":"llama3.1:8b","choices":[{"index":0,"delta":{"content":" change"},"finish_reason":null}]}

...

event: message
data: {"id":"chatcmpl-123456789","object":"chat.completion.chunk","created":1709968452,"model":"llama3.1:8b","choices":[{"index":0,"delta":{"content":"."},"finish_reason":"stop"}]}

event: done
data: [DONE]
```

---

## Common Response Formats

### Error Response

```json
{
  "error": {
    "message": "Error message describing what went wrong",
    "type": "error_type",
    "param": "parameter_name",
    "code": "error_code"
  }
}
```

### Pagination

Many endpoints that return lists support pagination using the following query parameters:

- `limit`: Maximum number of items to return (default varies by endpoint)
- `offset`: Number of items to skip for pagination

Paginated responses typically include metadata about the pagination:

```json
{
  "data": [...],
  "pagination": {
    "total": 150,
    "limit": 10,
    "offset": 0,
    "next": "/api/endpoint?limit=10&offset=10",
    "previous": null
  }
}
```

---

## Error Handling

All MukkaAI services use standard HTTP status codes to indicate the success or failure of an API request:

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Not authorized to access the resource
- `404 Not Found`: Resource not found
- `409 Conflict`: Request conflicts with current state
- `422 Unprocessable Entity`: Request validation error
- `500 Internal Server Error`: Server error
- `503 Service Unavailable`: Service temporarily unavailable

For most error responses, the response body will contain a JSON object with details about the error:

```json
{
  "error": {
    "message": "Resource not found",
    "type": "not_found",
    "code": "resource_missing"
  }
}
```

## References

- MukkaAI System Architecture: `/home/mothership/mukka/rag/mukka_vault/01-System/Documentation/MukkaAI_System_Architecture.md`
- Environment Variables Configuration: `/home/mothership/mukka/rag/mukka_vault/01-System/Documentation/Environment_Variables_Configuration.md`
- MukkaAI Troubleshooting Guide: `/home/mothership/mukka/rag/mukka_vault/01-System/DevOps/MukkaAI-Troubleshooting-Guide.md`
