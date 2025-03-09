const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const winston = require('winston');
const dotenv = require('dotenv');
const axios = require('axios');
const _ = require('lodash');

// Load environment variables
dotenv.config();

// Create logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'mcp-brave-search-server' },
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

// Create Express app
const app = express();
const PORT = process.env.PORT || 8096;
const BASE_SERVER_URL = process.env.BASE_SERVER_URL || 'http://mukka-mcp-base-server:8090';
const BRAVE_SEARCH_API_KEY = process.env.BRAVE_SEARCH_API_KEY;
const BRAVE_SEARCH_API_URL = 'https://api.search.brave.com/res/v1/web/search';

if (!BRAVE_SEARCH_API_KEY) {
  logger.warn('BRAVE_SEARCH_API_KEY not set. Brave Search API will not work properly.');
}

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Register with base MCP server
const registerWithBaseServer = async () => {
  try {
    const response = await axios.post(`${BASE_SERVER_URL}/services/register`, {
      name: 'brave-search',
      url: `http://mukka-mcp-brave-search-server:${PORT}`,
      type: 'brave-search',
      description: 'MCP Brave Search Server for web search capabilities'
    });
    logger.info('Registered with base MCP server', response.data);
  } catch (error) {
    logger.error('Failed to register with base MCP server:', error.message);
    // Retry after delay
    setTimeout(registerWithBaseServer, 5000);
  }
};

// SSE Event Stream Setup
app.get('/mcp/brave-search/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  // Send initial data
  const data = JSON.stringify({
    type: 'brave-search',
    data: {
      status: 'ready'
    }
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
    name: 'MCP Brave Search Server',
    version: '1.0.0',
    status: 'running',
    hasApiKey: !!BRAVE_SEARCH_API_KEY
  });
});

// Web search endpoint
app.get('/search', async (req, res) => {
  try {
    const { query, count = 10, offset = 0 } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }
    
    if (!BRAVE_SEARCH_API_KEY) {
      return res.status(500).json({ error: 'Brave Search API key not configured' });
    }
    
    // Make request to Brave Search API
    const response = await axios.get(BRAVE_SEARCH_API_URL, {
      params: {
        q: query,
        count: Math.min(20, parseInt(count) || 10),
        offset: parseInt(offset) || 0
      },
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip',
        'X-Subscription-Token': BRAVE_SEARCH_API_KEY
      }
    });
    
    res.json(response.data);
  } catch (error) {
    logger.error('Error searching:', error);
    
    if (error.response) {
      res.status(error.response.status).json({
        error: 'Error from Brave Search API',
        status: error.response.status,
        message: error.response.data
      });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Local search endpoint (places, businesses, etc.)
app.get('/local', async (req, res) => {
  try {
    const { query, count = 5 } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }
    
    if (!BRAVE_SEARCH_API_KEY) {
      return res.status(500).json({ error: 'Brave Search API key not configured' });
    }
    
    // Make request to Brave Search API with local search parameters
    const response = await axios.get(BRAVE_SEARCH_API_URL, {
      params: {
        q: `${query} near me`,
        count: Math.min(20, parseInt(count) || 5),
        result_filter: 'local'
      },
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip',
        'X-Subscription-Token': BRAVE_SEARCH_API_KEY
      }
    });
    
    // Extract local results or fallback to regular search
    const results = _.get(response.data, 'local', []);
    
    if (results.length === 0) {
      return res.json({
        query,
        results: [],
        fallback: 'No local results found',
        web_results: response.data.web && response.data.web.results
      });
    }
    
    res.json({
      query,
      results
    });
  } catch (error) {
    logger.error('Error with local search:', error);
    
    if (error.response) {
      res.status(error.response.status).json({
        error: 'Error from Brave Search API',
        status: error.response.status,
        message: error.response.data
      });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// News search endpoint
app.get('/news', async (req, res) => {
  try {
    const { query, count = 10, freshness } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }
    
    if (!BRAVE_SEARCH_API_KEY) {
      return res.status(500).json({ error: 'Brave Search API key not configured' });
    }
    
    // Prepare parameters
    const params = {
      q: query,
      count: Math.min(20, parseInt(count) || 10),
      result_filter: 'news'
    };
    
    // Add freshness if specified
    if (freshness && ['day', 'week', 'month'].includes(freshness)) {
      params.freshness = freshness;
    }
    
    // Make request to Brave Search API
    const response = await axios.get(BRAVE_SEARCH_API_URL, {
      params,
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip',
        'X-Subscription-Token': BRAVE_SEARCH_API_KEY
      }
    });
    
    // Extract news results
    const results = _.get(response.data, 'news', []);
    
    res.json({
      query,
      results
    });
  } catch (error) {
    logger.error('Error searching news:', error);
    
    if (error.response) {
      res.status(error.response.status).json({
        error: 'Error from Brave Search API',
        status: error.response.status,
        message: error.response.data
      });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Images search endpoint
app.get('/images', async (req, res) => {
  try {
    const { query, count = 10 } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }
    
    if (!BRAVE_SEARCH_API_KEY) {
      return res.status(500).json({ error: 'Brave Search API key not configured' });
    }
    
    // Make request to Brave Search API with image search parameters
    const response = await axios.get(BRAVE_SEARCH_API_URL, {
      params: {
        q: query,
        count: Math.min(20, parseInt(count) || 10),
        result_filter: 'images'
      },
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip',
        'X-Subscription-Token': BRAVE_SEARCH_API_KEY
      }
    });
    
    // Extract image results
    const results = _.get(response.data, 'images', []);
    
    res.json({
      query,
      results
    });
  } catch (error) {
    logger.error('Error searching images:', error);
    
    if (error.response) {
      res.status(error.response.status).json({
        error: 'Error from Brave Search API',
        status: error.response.status,
        message: error.response.data
      });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// MCP query handler endpoint
app.post('/mcp/query', async (req, res) => {
  try {
    const { query, type = 'web', options = {} } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }
    
    let searchEndpoint;
    
    switch (type.toLowerCase()) {
      case 'local':
        searchEndpoint = '/local';
        break;
      case 'news':
        searchEndpoint = '/news';
        break;
      case 'images':
        searchEndpoint = '/images';
        break;
      case 'web':
      default:
        searchEndpoint = '/search';
    }
    
    // Make internal request to appropriate endpoint
    const url = `http://localhost:${PORT}${searchEndpoint}`;
    const params = { query, ...options };
    
    // Use axios to make the request
    const response = await axios.get(url, { params });
    
    // Return structured MCP response
    res.json({
      status: 'success',
      source: 'brave-search',
      type,
      data: response.data
    });
  } catch (error) {
    logger.error('Error handling MCP query:', error);
    
    res.status(500).json({
      status: 'error',
      source: 'brave-search',
      error: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  logger.info(`MCP Brave Search Server running on port ${PORT}`);
  // Register with base server after a short delay
  setTimeout(registerWithBaseServer, 3000);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  // Close server
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

// Export app for testing
module.exports = app;
