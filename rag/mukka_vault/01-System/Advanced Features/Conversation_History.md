# Conversation History in Memory MCP

## Overview
The Memory MCP server now includes a conversation history feature that allows for storing, retrieving, and searching conversations. This document explains how the conversation history functionality works and how to use it.

## Implementation Details

### Storage Structure
Conversations are stored as separate JSON files within the `/app/data/memory/conversations` directory. Each conversation has:

- Unique ID (UUID)
- Title
- Metadata (arbitrary JSON object)
- Creation and update timestamps
- Messages array

### Messages Format
Each message in a conversation includes:
- Message ID (UUID)
- Role (user, assistant, system)
- Content (text content of the message)
- Model (optional, identifies which AI model generated the response)
- Metadata (optional, additional context)
- Timestamp

### API Endpoints

The Memory MCP provides these conversation endpoints:

- `GET /conversations` - Retrieve all conversations
- `POST /conversations` - Create a new conversation
- `GET /conversations/:id` - Get a specific conversation
- `POST /conversations/:id/messages` - Add a message to a conversation
- `PATCH /conversations/:id` - Update conversation metadata
- `DELETE /conversations/:id` - Delete a conversation
- `GET /conversations/search?query=text` - Search across conversations

## Usage Examples

### Creating a New Conversation
```javascript
fetch('http://localhost:8092/conversations', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'New Research Project',
    metadata: {
      project: 'Quantum Research',
      tags: ['physics', 'quantum']
    }
  })
})
.then(response => response.json())
.then(data => console.log(data));
```

### Adding Messages to a Conversation
```javascript
fetch('http://localhost:8092/conversations/12345-uuid-67890/messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    role: 'user',
    content: 'What is quantum entanglement?',
    metadata: {
      source: 'web-ui',
      location: 'research-tab'
    }
  })
})
.then(response => response.json())
.then(data => console.log(data));
```

### Searching Conversations
```javascript
fetch('http://localhost:8092/conversations/search?query=quantum')
.then(response => response.json())
.then(data => console.log(data));
```

## Integration with Web UI

The conversation history feature integrates with the MCP Web UI:

1. Conversations are displayed in a sidebar
2. New conversations can be created from the UI
3. Messages are automatically saved to the selected conversation
4. Conversations can be searched and filtered
5. Metadata can be viewed and edited

## Performance Considerations

- Each conversation is stored as a separate file for better performance
- Search operations scan all conversation files
- Consider implementing pagination for large numbers of conversations
- For very large deployments, a database backend could replace the file storage system

## Future Enhancements

Planned enhancements for the conversation history feature:

1. Tagging system for better organization
2. Conversation export to different formats
3. Analytics on conversation patterns
4. Integration with vector databases for semantic search