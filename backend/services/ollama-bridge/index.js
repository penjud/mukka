const express = require('express');
const cors = require('cors');
const axios = require('axios');
const http = require('http');
const socketIO = require('socket.io');
const morgan = require('morgan');
const winston = require('winston');

// Configuration
const PORT = process.env.PORT || 8082;
const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://ollama:11434';
const MCP_AUTH_TOKEN = process.env.MCP_AUTH_TOKEN || 'default-secret-token';

// Setup logging
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'ollama-bridge' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Initialize Express
const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Authentication middleware
const authenticate = (req, res, next) => {
  // For testing purposes, bypass authentication
  // Remove this in production
  return next();
  
  // Original code (disabled for testing)
  /*
  const token = req.headers.authorization;
  
  // Original authentication with hardcoded token
  if (token === `Bearer ${MCP_AUTH_TOKEN}`) {
    return next();
  }
  
  // Alternative authentication using the token from Auth Server
  // This allows the token obtained from the Auth Server to work
  if (token && token.startsWith('Bearer ')) {
    // We're accepting the token from the Auth Server by default
    // In a production environment, you might want to verify this token
    // with the Auth Server using JWT verification
    return next();
  }
  
  return res.status(401).json({ error: 'Unauthorized' });
  */
};

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Ollama Bridge is running' });
});

// Get available models
app.get('/api/models', authenticate, async (req, res) => {
  try {
    const response = await axios.get(`${OLLAMA_HOST}/api/tags`);
    res.json(response.data);
  } catch (error) {
    logger.error('Error fetching models:', error);
    res.status(500).json({ error: 'Failed to fetch models' });
  }
});

// Generate text with selected model
app.post('/api/generate', authenticate, async (req, res) => {
  try {
    const { model, prompt, system, options } = req.body;
    
    if (!model || !prompt) {
      return res.status(400).json({ error: 'Model and prompt are required' });
    }
    
    const response = await axios.post(`${OLLAMA_HOST}/api/generate`, {
      model,
      prompt,
      system,
      options
    });
    
    res.json(response.data);
  } catch (error) {
    logger.error('Error generating text:', error);
    res.status(500).json({ error: 'Failed to generate text' });
  }
});

// Chat completion with selected model
app.post('/api/chat', authenticate, async (req, res) => {
  try {
    const { model, messages, stream, options } = req.body;
    
    if (!model || !messages) {
      return res.status(400).json({ error: 'Model and messages are required' });
    }
    
    const response = await axios.post(`${OLLAMA_HOST}/api/chat`, {
      model,
      messages,
      stream,
      options
    });
    
    res.json(response.data);
  } catch (error) {
    logger.error('Error in chat completion:', error);
    res.status(500).json({ error: 'Failed to process chat completion' });
  }
});

// Delete a model
app.delete('/api/models/:name', authenticate, async (req, res) => {
  try {
    const modelName = req.params.name;
    await axios.delete(`${OLLAMA_HOST}/api/delete`, {
      data: { name: modelName }
    });
    res.json({ message: `Model ${modelName} deleted successfully` });
  } catch (error) {
    logger.error(`Error deleting model ${req.params.name}:`, error);
    res.status(500).json({ error: 'Failed to delete model' });
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
      
      // Update models list after successful pull
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
  
  // Stream model generation progress
  socket.on('streamGeneration', async (data) => {
    const { model, prompt, system, options } = data;
    
    try {
      logger.info(`Starting stream generation with model: ${model}`);
      
      const response = await axios.post(`${OLLAMA_HOST}/api/generate`, {
        model,
        prompt,
        system,
        options,
        stream: true
      }, {
        responseType: 'stream'
      });
      
      response.data.on('data', (chunk) => {
        try {
          const lines = chunk.toString().split('\n').filter(line => line.trim() !== '');
          
          for (const line of lines) {
            const data = JSON.parse(line);
            socket.emit('generationUpdate', data);
            
            if (data.done) {
              socket.emit('generationComplete');
            }
          }
        } catch (error) {
          logger.error('Error processing stream chunk:', error);
        }
      });
      
      response.data.on('end', () => {
        socket.emit('generationComplete');
      });
      
    } catch (error) {
      logger.error('Error in stream generation:', error);
      socket.emit('error', { message: 'Stream generation failed' });
    }
  });
  
  // Disconnect event
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