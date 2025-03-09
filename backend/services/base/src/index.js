const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const winston = require('winston');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Create logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'mcp-base-server' },
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

// Create Express app
const app = express();
const PORT = process.env.PORT || 8090;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MCP service registry
const mcpServices = [];

// Routes
app.get('/', (req, res) => {
  res.json({
    name: 'MCP Base Server',
    version: '1.0.0',
    status: 'running',
  });
});

// MCP Services discovery endpoint
app.get('/services', (req, res) => {
  res.json(mcpServices);
});

// Register MCP service
app.post('/services/register', (req, res) => {
  const { name, url, type, description } = req.body;
  
  if (!name || !url || !type) {
    return res.status(400).json({ error: 'Missing required fields: name, url, type' });
  }
  
  // Check if service already exists
  const existingIndex = mcpServices.findIndex(s => s.name === name);
  if (existingIndex !== -1) {
    mcpServices[existingIndex] = { name, url, type, description, registeredAt: new Date() };
    logger.info(`Updated MCP service: ${name} at ${url}`);
  } else {
    mcpServices.push({ name, url, type, description, registeredAt: new Date() });
    logger.info(`Registered new MCP service: ${name} at ${url}`);
  }
  
  res.status(201).json({ success: true, message: 'Service registered successfully' });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Start the server
app.listen(PORT, () => {
  logger.info(`MCP Base Server running on port ${PORT}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  process.exit(0);
});
