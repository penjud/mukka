---
title: Memory MCP Message Retrieval Fix
created: 2025-03-07 10:40:00
modified: 2025-03-07 10:40:00
tags:
  - fix
  - MCP
  - memory
  - API
  - conversation
status: completed
---

# Memory MCP Message Retrieval Fix

## Issue Description
The Memory MCP server was missing an API endpoint to retrieve messages from a conversation. While endpoints for creating conversations and adding messages worked correctly, attempting to retrieve messages returned a 404 error.

## Analysis
After examining the Memory MCP server code in `/home/mothership/mukka/backend/services/memory/src/index.js`, I discovered that while there were routes for:
- Creating conversations (`POST /conversations`)
- Adding messages to conversations (`POST /conversations/:id/messages`)

There was no route for retrieving messages from a conversation.

## Solution
I added a new API endpoint to retrieve messages from a conversation:

```javascript
// Get messages for a conversation
app.get('/conversations/:id/messages', (req, res) => {
  try {
    const conversation = conversationHistory.getConversation(req.params.id);
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    res.json(conversation.messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

This route:
1. Retrieves the conversation by ID using the existing `conversationHistory.getConversation()` method
2. Returns a 404 error if the conversation is not found
3. Returns the messages array if the conversation exists

## Implementation Steps
1. Added the missing route to `/home/mothership/mukka/backend/services/memory/src/index.js`
2. Rebuilt the Docker image for the Memory MCP server
3. Recreated the container to ensure the changes were applied
4. Tested the endpoint functionality using curl and the functional test script

## Verification
The fix was verified by:
1. Creating a test conversation
2. Adding a test message to the conversation
3. Successfully retrieving the message using the new endpoint
4. Running the functional tests, which now show the Memory MCP message retrieval as working

## Status
✅ Issue resolved. The Memory MCP server now correctly handles retrieving messages from conversations.

## Next Steps
The remaining issues to be addressed are:
1. Filesystem MCP file browsing issues
2. Ollama Bridge authentication problems
3. Standardizing and documenting API paths across services
