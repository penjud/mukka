const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const winston = require('winston');
const dotenv = require('dotenv');
const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const _ = require('lodash');
const ConversationHistory = require('./conversationHistory');
const AgentManagement = require('./AgentManagement');

// Load environment variables
dotenv.config();

// Create logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'mcp-memory-server' },
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

// Create Express app
const app = express();
const PORT = process.env.PORT || 8000;
const MEMORY_FILE_PATH = process.env.MEMORY_FILE_PATH || '/app/data/memory/memory.json';
const AGENT_FILE_PATH = process.env.AGENT_FILE_PATH || '/app/data/memory/agents.json';
const BASE_SERVER_URL = process.env.BASE_SERVER_URL || 'http://mcp-base-server:8090';

// Ensure memory directory exists
fs.ensureFileSync(MEMORY_FILE_PATH);
if (!fs.existsSync(MEMORY_FILE_PATH) || fs.readFileSync(MEMORY_FILE_PATH).length === 0) {
  fs.writeJSONSync(MEMORY_FILE_PATH, { entities: [], relations: [] });
}

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Memory storage object
let memoryStore = {
  entities: [],
  relations: []
};

// Initialize conversation history
const conversationHistory = new ConversationHistory();

// Initialize agent management
const agentManager = new AgentManagement(AGENT_FILE_PATH);

// Load memory from file
const loadMemory = () => {
  try {
    if (fs.existsSync(MEMORY_FILE_PATH)) {
      const data = fs.readJSONSync(MEMORY_FILE_PATH);
      memoryStore = data;
      logger.info('Memory loaded from file');
    }
  } catch (error) {
    logger.error('Error loading memory from file:', error);
  }
};

// Save memory to file
const saveMemory = () => {
  try {
    fs.writeJSONSync(MEMORY_FILE_PATH, memoryStore);
    logger.info('Memory saved to file');
  } catch (error) {
    logger.error('Error saving memory to file:', error);
  }
};

// Load memory on startup
loadMemory();

// Register with base MCP server
const registerWithBaseServer = async () => {
  try {
    const response = await axios.post(`${BASE_SERVER_URL}/services/register`, {
      name: 'memory',
      url: `http://mukka-mcp-memory-server:${PORT}`,
      type: 'memory',
      description: 'MCP Memory Server for knowledge graph storage'
    });
    logger.info('Registered with base MCP server', response.data);
  } catch (error) {
    logger.error('Failed to register with base MCP server:', error.message);
    // Retry after delay
    setTimeout(registerWithBaseServer, 5000);
  }
};

// SSE Event Stream Setup
app.get('/mcp/memory/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  // Send initial memory state
  const data = JSON.stringify({
    type: 'memory',
    data: memoryStore
  });
  
  res.write(`data: ${data}\n\n`);
  
  // Keep connection alive
  const keepAlive = setInterval(() => {
    res.write(':\n\n');
  }, 15000);
  
  // Handle client disconnect
  req.on('close', () => {
    clearInterval(keepAlive);
  });
});

// Routes
app.get('/', (req, res) => {
  res.json({
    name: 'MCP Memory Server',
    version: '1.0.0',
    status: 'running',
  });
});

// Get all entities
app.get('/entities', (req, res) => {
  res.json(memoryStore.entities);
});

// Create entities
app.post('/entities', (req, res) => {
  const { entities } = req.body;
  
  if (!entities || !Array.isArray(entities)) {
    return res.status(400).json({ error: 'Invalid entities format' });
  }
  
  const createdEntities = [];
  
  for (const entity of entities) {
    const { name, entityType, observations } = entity;
    
    if (!name || !entityType) {
      continue;
    }
    
    const existingEntityIndex = memoryStore.entities.findIndex(e => e.name === name);
    
    if (existingEntityIndex !== -1) {
      // Update existing entity
      memoryStore.entities[existingEntityIndex] = {
        ...memoryStore.entities[existingEntityIndex],
        entityType,
        observations: [...(memoryStore.entities[existingEntityIndex].observations || []), ...(observations || [])],
        updatedAt: new Date().toISOString()
      };
      createdEntities.push(memoryStore.entities[existingEntityIndex]);
    } else {
      // Create new entity
      const newEntity = {
        id: uuidv4(),
        name,
        entityType,
        observations: observations || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      memoryStore.entities.push(newEntity);
      createdEntities.push(newEntity);
    }
  }
  
  // Save memory to file
  saveMemory();
  
  res.status(201).json({
    success: true,
    message: 'Entities created/updated successfully',
    entities: createdEntities
  });
});

// Create relations
app.post('/relations', (req, res) => {
  const { relations } = req.body;
  
  if (!relations || !Array.isArray(relations)) {
    return res.status(400).json({ error: 'Invalid relations format' });
  }
  
  const createdRelations = [];
  
  for (const relation of relations) {
    const { from, to, relationType } = relation;
    
    if (!from || !to || !relationType) {
      continue;
    }
    
    // Check if entities exist
    const fromEntity = memoryStore.entities.find(e => e.name === from);
    const toEntity = memoryStore.entities.find(e => e.name === to);
    
    if (!fromEntity || !toEntity) {
      continue;
    }
    
    // Check if relation already exists
    const existingRelationIndex = memoryStore.relations.findIndex(
      r => r.from === from && r.to === to && r.relationType === relationType
    );
    
    if (existingRelationIndex !== -1) {
      // Update existing relation
      memoryStore.relations[existingRelationIndex].updatedAt = new Date().toISOString();
      createdRelations.push(memoryStore.relations[existingRelationIndex]);
    } else {
      // Create new relation
      const newRelation = {
        id: uuidv4(),
        from,
        to,
        relationType,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      memoryStore.relations.push(newRelation);
      createdRelations.push(newRelation);
    }
  }
  
  // Save memory to file
  saveMemory();
  
  res.status(201).json({
    success: true,
    message: 'Relations created/updated successfully',
    relations: createdRelations
  });
});

// Search entities
app.get('/search', (req, res) => {
  const { query } = req.query;
  
  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }
  
  const results = memoryStore.entities.filter(entity => {
    // Match entity name or type
    if (entity.name.toLowerCase().includes(query.toLowerCase()) || 
        entity.entityType.toLowerCase().includes(query.toLowerCase())) {
      return true;
    }
    
    // Match entity observations
    for (const observation of entity.observations || []) {
      if (observation.toLowerCase().includes(query.toLowerCase())) {
        return true;
      }
    }
    
    return false;
  });
  
  res.json(results);
});

// Delete entities
app.delete('/entities', (req, res) => {
  const { entityNames } = req.body;
  
  if (!entityNames || !Array.isArray(entityNames)) {
    return res.status(400).json({ error: 'Invalid entityNames format' });
  }
  
  const deletedEntities = [];
  const remainingEntities = [];
  
  // Remove entities
  for (const entityName of entityNames) {
    const entityIndex = memoryStore.entities.findIndex(e => e.name === entityName);
    
    if (entityIndex !== -1) {
      deletedEntities.push(memoryStore.entities[entityIndex]);
    } else {
      remainingEntities.push(memoryStore.entities[entityIndex]);
    }
  }
  
  // Filter out deleted entities
  memoryStore.entities = memoryStore.entities.filter(e => !entityNames.includes(e.name));
  
  // Remove relations with deleted entities
  memoryStore.relations = memoryStore.relations.filter(
    r => !entityNames.includes(r.from) && !entityNames.includes(r.to)
  );
  
  // Save memory to file
  saveMemory();
  
  res.json({
    success: true,
    message: 'Entities deleted successfully',
    deletedCount: deletedEntities.length
  });
});

// Delete relations
app.delete('/relations', (req, res) => {
  const { relations } = req.body;
  
  if (!relations || !Array.isArray(relations)) {
    return res.status(400).json({ error: 'Invalid relations format' });
  }
  
  let deletedCount = 0;
  
  // Filter out relations to be deleted
  const originalLength = memoryStore.relations.length;
  memoryStore.relations = memoryStore.relations.filter(r => {
    for (const relation of relations) {
      if (r.from === relation.from && 
          r.to === relation.to && 
          r.relationType === relation.relationType) {
        return false;
      }
    }
    return true;
  });
  
  deletedCount = originalLength - memoryStore.relations.length;
  
  // Save memory to file
  saveMemory();
  
  res.json({
    success: true,
    message: 'Relations deleted successfully',
    deletedCount
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// MCP compatibility endpoint
app.get('/mcp/memory', (req, res) => {
  res.json({
    type: 'memory',
    data: memoryStore
  });
});

// Conversation Routes

// Get all conversations
app.get('/conversations', (req, res) => {
  // Filter by agent if provided
  if (req.query.agentId) {
    try {
      const agentConversations = agentManager.getAgentConversations(req.query.agentId);
      const conversations = agentConversations
        .map(id => conversationHistory.getConversation(id))
        .filter(Boolean);
      return res.json(conversations);
    } catch (error) {
      logger.error('Error getting agent conversations:', error);
      return res.status(404).json({ error: error.message });
    }
  }
  
  // Otherwise return all conversations
  const conversations = conversationHistory.getAllConversations();
  res.json(conversations);
});

// Create a new conversation
app.post('/conversations', (req, res) => {
  const { title, metadata, agentId } = req.body;
  const conversation = conversationHistory.createConversation(title, metadata);
  
  // Associate with agent if provided
  if (agentId) {
    try {
      agentManager.associateWithConversation(agentId, conversation.id);
      // Add agent info to conversation metadata
      const agent = agentManager.getAgent(agentId);
      if (agent) {
        conversation.metadata = conversation.metadata || {};
        conversation.metadata.agentId = agentId;
        conversation.metadata.agentName = agent.name;
        conversationHistory.updateConversation(conversation.id, { 
          metadata: conversation.metadata 
        });
      }
    } catch (error) {
      logger.warn(`Failed to associate conversation with agent: ${error.message}`);
    }
  }
  
  res.status(201).json(conversation);
});

// Get a conversation by ID
app.get('/conversations/:id', (req, res) => {
  const conversation = conversationHistory.getConversation(req.params.id);
  
  if (!conversation) {
    return res.status(404).json({ error: 'Conversation not found' });
  }
  
  res.json(conversation);
});

// Add a message to a conversation
app.post('/conversations/:id/messages', (req, res) => {
  try {
    const { role, content, model, metadata } = req.body;
    
    if (!role || !content) {
      return res.status(400).json({ error: 'Role and content are required' });
    }
    
    const message = conversationHistory.addMessage(req.params.id, {
      role,
      content,
      model,
      metadata
    });
    
    res.status(201).json(message);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

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

// Update a conversation
app.patch('/conversations/:id', (req, res) => {
  try {
    const { title, metadata, agentId } = req.body;
    const updateData = { title, metadata };
    
    // If agent ID is provided, associate the conversation with the agent
    if (agentId) {
      try {
        agentManager.associateWithConversation(agentId, req.params.id);
        // Add agent info to conversation metadata
        const agent = agentManager.getAgent(agentId);
        if (agent) {
          updateData.metadata = updateData.metadata || {};
          updateData.metadata.agentId = agentId;
          updateData.metadata.agentName = agent.name;
        }
      } catch (error) {
        logger.warn(`Failed to associate conversation with agent: ${error.message}`);
      }
    }
    
    const conversation = conversationHistory.updateConversation(req.params.id, updateData);
    res.json(conversation);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// Delete a conversation
app.delete('/conversations/:id', (req, res) => {
  const result = conversationHistory.deleteConversation(req.params.id);
  
  if (!result) {
    return res.status(404).json({ error: 'Conversation not found' });
  }
  
  res.json({ success: true, message: 'Conversation deleted successfully' });
});

// Search conversations
app.get('/conversations/search', (req, res) => {
  const { query } = req.query;
  
  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }
  
  const results = conversationHistory.searchConversations(query);
  res.json(results);
});

// Agent Management API Endpoints

// Get all agents
app.get('/api/agents', (req, res) => {
  try {
    const agents = agentManager.getAgents();
    res.json(agents);
  } catch (error) {
    logger.error('Error getting agents:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get agent by ID
app.get('/api/agents/:id', (req, res) => {
  try {
    const agent = agentManager.getAgent(req.params.id);
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    res.json(agent);
  } catch (error) {
    logger.error('Error getting agent:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create a new agent
app.post('/api/agents', (req, res) => {
  try {
    const agent = agentManager.createAgent(req.body);
    res.status(201).json(agent);
  } catch (error) {
    logger.error('Error creating agent:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update an agent
app.put('/api/agents/:id', (req, res) => {
  try {
    const agent = agentManager.updateAgent(req.params.id, req.body);
    res.json(agent);
  } catch (error) {
    logger.error('Error updating agent:', error);
    if (error.message === 'Agent not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

// Delete an agent
app.delete('/api/agents/:id', (req, res) => {
  try {
    const result = agentManager.deleteAgent(req.params.id);
    res.json(result);
  } catch (error) {
    logger.error('Error deleting agent:', error);
    if (error.message === 'Agent not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

// Get system prompt for an agent
app.get('/api/agents/:id/systemPrompt', (req, res) => {
  try {
    const systemPrompt = agentManager.getSystemPrompt(req.params.id);
    res.json({ systemPrompt });
  } catch (error) {
    logger.error('Error getting system prompt:', error);
    if (error.message === 'Agent not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

// Get conversations for an agent
app.get('/api/agents/:id/conversations', (req, res) => {
  try {
    const conversationIds = agentManager.getAgentConversations(req.params.id);
    const conversations = conversationIds
      .map(id => conversationHistory.getConversation(id))
      .filter(Boolean);
    res.json(conversations);
  } catch (error) {
    logger.error('Error getting agent conversations:', error);
    if (error.message === 'Agent not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  logger.info(`MCP Memory Server running on port ${PORT}`);
  logger.info(`Agent Management API enabled at /api/agents`);
  
  // Register with base MCP server after startup
  setTimeout(registerWithBaseServer, 3000);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  saveMemory();
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  saveMemory();
  process.exit(0);
});
