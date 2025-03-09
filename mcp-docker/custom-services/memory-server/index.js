const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const AgentManagement = require('./AgentManagement');

const app = express();
const port = process.env.PORT || 8092;
const memoryFilePath = process.env.MEMORY_FILE_PATH || '/data/memory.json';
const agentFilePath = process.env.AGENT_FILE_PATH || '/data/agents.json';

// Create a simple Memory class instead of using the missing module
class Memory {
  constructor(filePath) {
    this.filePath = filePath;
    this.conversations = this.loadMemory();
  }

  loadMemory() {
    try {
      if (fs.existsSync(this.filePath)) {
        const data = fs.readFileSync(this.filePath, 'utf8');
        return JSON.parse(data);
      }
      return {};
    } catch (error) {
      console.error('Error loading memory:', error);
      return {};
    }
  }

  saveMemory() {
    try {
      const dirPath = path.dirname(this.filePath);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      fs.writeFileSync(this.filePath, JSON.stringify(this.conversations, null, 2), 'utf8');
    } catch (error) {
      console.error('Error saving memory:', error);
    }
  }

  createConversation(title) {
    const id = uuidv4();
    const conversation = {
      id,
      title: title || 'New Conversation',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: []
    };
    
    this.conversations[id] = conversation;
    this.saveMemory();
    return conversation;
  }

  getConversation(id) {
    return this.conversations[id];
  }

  getConversations() {
    return Object.values(this.conversations);
  }

  addMessage(conversationId, role, content, metadata = {}) {
    if (!this.conversations[conversationId]) {
      throw new Error('Conversation not found');
    }
    
    const message = {
      id: uuidv4(),
      role,
      content,
      metadata,
      createdAt: new Date().toISOString()
    };
    
    this.conversations[conversationId].messages.push(message);
    this.conversations[conversationId].updatedAt = new Date().toISOString();
    this.saveMemory();
    return message;
  }

  getMessages(conversationId) {
    if (!this.conversations[conversationId]) {
      throw new Error('Conversation not found');
    }
    
    return this.conversations[conversationId].messages;
  }
}

// Initialize Memory and AgentManagement
const memory = new Memory(memoryFilePath);
const agentManager = new AgentManagement(agentFilePath);

app.use(cors());
app.use(bodyParser.json());

// Health check endpoint
app.get('/healthz', (req, res) => {
  res.status(200).send('OK');
});

// MCP API endpoints
app.post('/mcp/v1/memory/conversation', (req, res) => {
  try {
    const conversation = memory.createConversation(req.body.title);
    // Associate with agent if provided
    if (req.body.agentId) {
      try {
        agentManager.associateWithConversation(req.body.agentId, conversation.id);
      } catch (error) {
        console.warn(`Failed to associate conversation with agent: ${error.message}`);
      }
    }
    res.json(conversation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/mcp/v1/memory/conversation/:id', (req, res) => {
  try {
    const conversation = memory.getConversation(req.params.id);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    res.json(conversation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/mcp/v1/memory/conversations', (req, res) => {
  try {
    // Filter by agent if provided
    if (req.query.agentId) {
      const agentConversations = agentManager.getAgentConversations(req.query.agentId);
      const conversations = agentConversations.map(id => memory.getConversation(id)).filter(Boolean);
      return res.json(conversations);
    }
    
    // Otherwise return all conversations
    const conversations = memory.getConversations();
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/mcp/v1/memory/conversation/:id/message', (req, res) => {
  try {
    const message = memory.addMessage(req.params.id, req.body.role, req.body.content, req.body.metadata);
    res.json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/mcp/v1/memory/conversation/:id/messages', (req, res) => {
  try {
    const messages = memory.getMessages(req.params.id);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Agent Management API endpoints
app.get('/api/agents', (req, res) => {
  try {
    const agents = agentManager.getAgents();
    res.json(agents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/agents/:id', (req, res) => {
  try {
    const agent = agentManager.getAgent(req.params.id);
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    res.json(agent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/agents', (req, res) => {
  try {
    console.log('Creating agent with payload:', JSON.stringify(req.body));
    const agent = agentManager.createAgent(req.body);
    console.log('Agent created successfully:', JSON.stringify(agent));
    res.status(201).json(agent);
  } catch (error) {
    console.error('Error creating agent:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/agents/:id', (req, res) => {
  try {
    const agent = agentManager.updateAgent(req.params.id, req.body);
    res.json(agent);
  } catch (error) {
    if (error.message === 'Agent not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/agents/:id', (req, res) => {
  try {
    const result = agentManager.deleteAgent(req.params.id);
    res.json(result);
  } catch (error) {
    if (error.message === 'Agent not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/agents/:id/systemPrompt', (req, res) => {
  try {
    const systemPrompt = agentManager.getSystemPrompt(req.params.id);
    res.json({ systemPrompt });
  } catch (error) {
    if (error.message === 'Agent not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/agents/:id/conversations', (req, res) => {
  try {
    const conversationIds = agentManager.getAgentConversations(req.params.id);
    const conversations = conversationIds.map(id => memory.getConversation(id)).filter(Boolean);
    res.json(conversations);
  } catch (error) {
    if (error.message === 'Agent not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

// Process clean-up and memory persistence
process.on('SIGTERM', () => {
  console.info('SIGTERM signal received: closing HTTP server');
  memory.saveMemory();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.info('SIGINT signal received: closing HTTP server');
  memory.saveMemory();
  process.exit(0);
});

// Start the server
app.listen(port, () => {
  console.log(`Memory MCP Server with Agent Management running on port ${port}`);
  console.log(`Memory file path: ${memoryFilePath}`);
  console.log(`Agent file path: ${agentFilePath}`);
  console.log(`Agent Management API enabled at /api/agents`);
});
