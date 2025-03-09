// Ollama Bridge Server for MCP
// This server connects the MCP UI to the Ollama API
// Implements model switching and management capabilities

const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const axios = require('axios');
const bodyParser = require('body-parser');
const winston = require('winston');
const jwt = require('jsonwebtoken');

// Configuration
const PORT = process.env.PORT || 8082;
const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://ollama:11434';
const JWT_SECRET = process.env.JWT_SECRET || 'mcp-secret-key';

// Setup logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'ollama-bridge.log' })
  ]
});

// Initialize Express app
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Create HTTP server and Socket.IO instance
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Authentication middleware
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', server: 'ollama-bridge' });
});

// Get available models
app.get('/api/models', async (req, res) => {
  try {
    const response = await axios.get(`${OLLAMA_HOST}/api/tags`);
    res.json(response.data);
  } catch (error) {
    logger.error('Error fetching models:', error);
    res.status(500).json({ error: 'Failed to fetch models' });
  }
});

// Generate completion with specified model
app.post('/api/generate', authenticate, async (req, res) => {
  const { model, prompt, options } = req.body;
  
  if (!model || !prompt) {
    return res.status(400).json({ error: 'Model and prompt are required' });
  }
  
  try {
    const response = await axios.post(`${OLLAMA_HOST}/api/generate`, {
      model,
      prompt,
      options: options || {}
    });
    
    res.json(response.data);
  } catch (error) {
    logger.error('Error generating completion:', error);
    res.status(500).json({ error: 'Failed to generate completion' });
  }
});

// Socket.IO for real-time model updates
io.on('connection', (socket) => {
  logger.info('Client connected to Ollama Bridge');
  
  // Send initial models list
  const sendModelsList = async () => {
    try {
      const response = await axios.get(`${OLLAMA_HOST}/api/tags`);
      socket.emit('models', response.data.models);
    } catch (error) {
      logger.error('Error fetching models for socket:', error);
      socket.emit('error', { message: 'Failed to fetch models' });
    }
  };
  
  sendModelsList();
  
  // Pull a model
  socket.on('pullModel', async (modelName) => {
    try {
      logger.info(`Pulling model: ${modelName}`);
      socket.emit('modelStatus', { 
        model: modelName, 
        status: 'pulling',
        message: `Started pulling ${modelName}...`
      });
      
      const response = await axios.post(`${OLLAMA_HOST}/api/pull`, {
        name: modelName
      });
      
      socket.emit('modelStatus', { 
        model: modelName, 
        status: 'success',
        message: `Successfully pulled ${modelName}`
      });
      
      // Update models list
      sendModelsList();
    } catch (error) {
      logger.error(`Error pulling model ${modelName}:`, error);
      socket.emit('modelStatus', { 
        model: modelName, 
        status: 'error',
        message: `Failed to pull ${modelName}: ${error.message}`
      });
    }
  });
  
  // Delete a model
  socket.on('deleteModel', async (modelName) => {
    try {
      logger.info(`Deleting model: ${modelName}`);
      socket.emit('modelStatus', { 
        model: modelName, 
        status: 'deleting',
        message: `Deleting ${modelName}...`
      });
      
      await axios.delete(`${OLLAMA_HOST}/api/delete`, {
        data: { name: modelName }
      });
      
      socket.emit('modelStatus', { 
        model: modelName, 
        status: 'success',
        message: `Successfully deleted ${modelName}`
      });
      
      // Update models list
      sendModelsList();
    } catch (error) {
      logger.error(`Error deleting model ${modelName}:`, error);
      socket.emit('modelStatus', { 
        model: modelName, 
        status: 'error',
        message: `Failed to delete ${modelName}: ${error.message}`
      });
    }
  });
  
  // Disconnect handler
  socket.on('disconnect', () => {
    logger.info('Client disconnected from Ollama Bridge');
  });
});

// Start server
server.listen(PORT, () => {
  logger.info(`Ollama Bridge server running on port ${PORT}`);
  logger.info(`Connected to Ollama at ${OLLAMA_HOST}`);
});

module.exports = app;
