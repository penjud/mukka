const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const winston = require('winston');
const dotenv = require('dotenv');
const fs = require('fs-extra');
const path = require('path');
const chokidar = require('chokidar');
const axios = require('axios');
const mime = require('mime-types');
const { glob } = require('glob');

// Load environment variables
dotenv.config();

// Create logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'mcp-filesystem-server' },
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

// Create Express app
const app = express();
const PORT = process.env.PORT || 8095;
const BASE_SERVER_URL = process.env.BASE_SERVER_URL || 'http://mukka-mcp-base-server:8090';

// Base paths to watch - will be passed as command-line arguments or set to defaults
const basePaths = process.argv.slice(2).length > 0 
  ? process.argv.slice(2) 
  : ['/home/mothership'];

logger.info(`Watching directories: ${basePaths.join(', ')}`);

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.text());

// Set up file watcher
const setupWatcher = () => {
  const watcher = chokidar.watch(basePaths, {
    ignored: /(^|[\/\\])\../, // ignore dotfiles
    persistent: true,
    depth: 5 // limit depth for performance
  });
  
  watcher
    .on('ready', () => logger.info('Initial scan complete. Ready for changes'))
    .on('error', error => logger.error(`Watcher error: ${error}`))
    .on('change', path => logger.debug(`File ${path} has been changed`));
    
  return watcher;
};

// Register with base MCP server
const registerWithBaseServer = async () => {
  try {
    const response = await axios.post(`${BASE_SERVER_URL}/services/register`, {
      name: 'filesystem',
      url: `http://mukka-mcp-filesystem-server:${PORT}`,
      type: 'filesystem',
      description: 'MCP Filesystem Server for file access'
    });
    logger.info('Registered with base MCP server', response.data);
  } catch (error) {
    logger.error('Failed to register with base MCP server:', error.message);
    // Retry after delay
    setTimeout(registerWithBaseServer, 5000);
  }
};

// Initialize watcher
const watcher = setupWatcher();

// SSE Event Stream Setup
app.get('/mcp/filesystem/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  // Send initial paths
  const data = JSON.stringify({
    type: 'filesystem',
    data: {
      paths: basePaths
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

// Helper function to safely join paths and prevent directory traversal
const safeJoinPath = (basePath, relativePath) => {
  const resolvedPath = path.resolve(path.join(basePath, relativePath));
  
  // Check if the resolved path starts with one of the base paths
  if (!basePaths.some(base => resolvedPath.startsWith(base))) {
    throw new Error('Path traversal attempt detected');
  }
  
  return resolvedPath;
};

// Helper function to check if a path is within allowed base paths
const isPathAllowed = (checkPath) => {
  return basePaths.some(basePath => checkPath.startsWith(basePath));
};

// Helper function to format directory listing
const formatDirectoryListing = (dirPath, files) => {
  return files.map(file => {
    const fullPath = path.join(dirPath, file);
    const stats = fs.statSync(fullPath);
    return {
      name: file,
      path: fullPath,
      type: stats.isDirectory() ? 'directory' : 'file',
      size: stats.size,
      modified: stats.mtime,
      isDirectory: stats.isDirectory()
    };
  }).sort((a, b) => {
    // Directories first, then files
    if (a.isDirectory && !b.isDirectory) return -1;
    if (!a.isDirectory && b.isDirectory) return 1;
    return a.name.localeCompare(b.name);
  });
};

// Set up file uploads directory
const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(basePaths[0], 'uploads');
const AVATARS_DIR = path.join(UPLOADS_DIR, 'avatars');

// Ensure uploads directories exist
fs.ensureDirSync(UPLOADS_DIR);
fs.ensureDirSync(AVATARS_DIR);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determine destination based on upload type
    if (req.path.includes('/avatar')) {
      cb(null, AVATARS_DIR);
    } else {
      cb(null, UPLOADS_DIR);
    }
  },
  filename: (req, file, cb) => {
    // Generate a unique filename with original extension
    const extension = path.extname(file.originalname) || '.jpg';
    const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}${extension}`;
    cb(null, filename);
  }
});

// Create upload middleware
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Routes
app.get('/', (req, res) => {
  res.json({
    name: 'MCP Filesystem Server',
    version: '1.0.0',
    status: 'running',
    basePaths
  });
});

// Get list of directories
app.get('/directories', (req, res) => {
  res.json({ directories: basePaths });
});

// List directory contents
app.get('/ls', async (req, res) => {
  try {
    const { directory } = req.query;
    
    if (!directory) {
      return res.status(400).json({ error: 'Directory parameter is required' });
    }
    
    // Check if directory is within allowed paths
    if (!isPathAllowed(directory)) {
      return res.status(403).json({ error: 'Access to this directory is not allowed' });
    }
    
    if (!fs.existsSync(directory)) {
      return res.status(404).json({ error: 'Directory not found' });
    }
    
    if (!fs.statSync(directory).isDirectory()) {
      return res.status(400).json({ error: 'Path is not a directory' });
    }
    
    const files = await fs.readdir(directory);
    const listing = formatDirectoryListing(directory, files);
    
    res.json({ directory, contents: listing });
  } catch (error) {
    logger.error('Error listing directory:', error);
    res.status(500).json({ error: error.message });
  }
});

// Alternative endpoint for browsing files (to match Web UI expectations)
app.get('/browse', async (req, res) => {
  try {
    const { path: dirPath } = req.query;
    
    if (!dirPath) {
      return res.status(400).json({ error: 'Path parameter is required' });
    }
    
    // Check if directory is within allowed paths
    if (!isPathAllowed(dirPath)) {
      return res.status(403).json({ error: 'Access to this path is not allowed' });
    }
    
    if (!fs.existsSync(dirPath)) {
      return res.status(404).json({ error: 'Path not found' });
    }
    
    if (!fs.statSync(dirPath).isDirectory()) {
      return res.status(400).json({ error: 'Path is not a directory' });
    }
    
    const files = await fs.readdir(dirPath);
    const listing = formatDirectoryListing(dirPath, files);
    
    res.json({ path: dirPath, files: listing });
  } catch (error) {
    logger.error('Error browsing directory:', error);
    res.status(500).json({ error: error.message });
  }
});

// Read file contents
app.get('/read', async (req, res) => {
  try {
    const { file, encoding = 'utf8' } = req.query;
    
    if (!file) {
      return res.status(400).json({ error: 'File parameter is required' });
    }
    
    // Check if file is within allowed paths
    if (!isPathAllowed(file)) {
      return res.status(403).json({ error: 'Access to this file is not allowed' });
    }
    
    if (!fs.existsSync(file)) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    if (fs.statSync(file).isDirectory()) {
      return res.status(400).json({ error: 'Path is a directory, not a file' });
    }
    
    // Determine content type
    const contentType = mime.lookup(file) || 'application/octet-stream';
    
    // For binary files, send as octet-stream
    if (!contentType.startsWith('text/') && contentType !== 'application/json') {
      const buffer = await fs.readFile(file);
      res.setHeader('Content-Type', contentType);
      return res.send(buffer);
    }
    
    // For text files, send as text with specified encoding
    const content = await fs.readFile(file, encoding);
    
    if (contentType === 'application/json') {
      try {
        const jsonContent = JSON.parse(content);
        return res.json({ file, content: jsonContent, contentType });
      } catch (e) {
        // If JSON parsing fails, send as text
        return res.json({ file, content, contentType });
      }
    }
    
    res.json({ file, content, contentType });
  } catch (error) {
    logger.error('Error reading file:', error);
    res.status(500).json({ error: error.message });
  }
});

// Write file contents
app.post('/write', async (req, res) => {
  try {
    const { file } = req.query;
    const content = req.body;
    
    if (!file) {
      return res.status(400).json({ error: 'File parameter is required' });
    }
    
    // Check if file is within allowed paths
    if (!isPathAllowed(file)) {
      return res.status(403).json({ error: 'Access to this file is not allowed' });
    }
    
    // Ensure parent directory exists
    await fs.ensureDir(path.dirname(file));
    
    // Write content
    if (typeof content === 'object') {
      await fs.writeJSON(file, content, { spaces: 2 });
    } else {
      await fs.writeFile(file, content);
    }
    
    res.json({ success: true, file });
  } catch (error) {
    logger.error('Error writing file:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete file or directory
app.delete('/delete', async (req, res) => {
  try {
    const { path: filePath } = req.query;
    
    if (!filePath) {
      return res.status(400).json({ error: 'Path parameter is required' });
    }
    
    // Check if path is within allowed paths
    if (!isPathAllowed(filePath)) {
      return res.status(403).json({ error: 'Access to this path is not allowed' });
    }
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Path not found' });
    }
    
    await fs.remove(filePath);
    
    res.json({ success: true, path: filePath });
  } catch (error) {
    logger.error('Error deleting path:', error);
    res.status(500).json({ error: error.message });
  }
});

// Search for files
app.get('/search', async (req, res) => {
  try {
    const { pattern, basePath } = req.query;
    
    if (!pattern) {
      return res.status(400).json({ error: 'Pattern parameter is required' });
    }
    
    const searchBasePath = basePath && isPathAllowed(basePath) 
      ? basePath 
      : basePaths[0];
    
    const files = await glob(`${searchBasePath}/**/${pattern}`, {
      ignore: ['**/node_modules/**', '**/.*/**'],
      nodir: true
    });
    
    res.json({ 
      pattern, 
      basePath: searchBasePath,
      results: files.filter(file => isPathAllowed(file))
    });
  } catch (error) {
    logger.error('Error searching files:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create directory
app.post('/mkdir', async (req, res) => {
  try {
    const { directory } = req.query;
    
    if (!directory) {
      return res.status(400).json({ error: 'Directory parameter is required' });
    }
    
    // Check if directory is within allowed paths
    if (!isPathAllowed(directory)) {
      return res.status(403).json({ error: 'Access to this directory is not allowed' });
    }
    
    await fs.ensureDir(directory);
    
    res.json({ success: true, directory });
  } catch (error) {
    logger.error('Error creating directory:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get file or directory stats
app.get('/stats', async (req, res) => {
  try {
    const { path: filePath } = req.query;
    
    if (!filePath) {
      return res.status(400).json({ error: 'Path parameter is required' });
    }
    
    // Check if path is within allowed paths
    if (!isPathAllowed(filePath)) {
      return res.status(403).json({ error: 'Access to this path is not allowed' });
    }
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Path not found' });
    }
    
    const stats = await fs.stat(filePath);
    
    res.json({
      path: filePath,
      exists: true,
      isFile: stats.isFile(),
      isDirectory: stats.isDirectory(),
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
      accessed: stats.atime
    });
  } catch (error) {
    logger.error('Error getting stats:', error);
    res.status(500).json({ error: error.message });
  }
});

// File upload endpoint for avatars
app.post('/uploads/avatar', upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Create a publicly accessible URL
    const relativePath = path.relative(UPLOADS_DIR, req.file.path);
    const filePath = `/uploads/${relativePath}`;
    
    // Return the file info with URL path
    res.json({
      success: true,
      originalName: req.file.originalname,
      filename: req.file.filename,
      filePath,
      url: filePath,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  } catch (error) {
    logger.error('Error uploading avatar:', error);
    res.status(500).json({ error: error.message });
  }
});

// Serve uploaded files statically
app.use('/uploads', express.static(UPLOADS_DIR));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// MCP compatibility endpoint
app.get('/mcp/filesystem', (req, res) => {
  res.json({
    type: 'filesystem',
    data: {
      basePaths
    }
  });
});

// Start the server
app.listen(PORT, () => {
  logger.info(`MCP Filesystem Server running on port ${PORT}`);
  
  // Register with base MCP server after startup
  setTimeout(registerWithBaseServer, 3000);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  watcher.close();
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  watcher.close();
  process.exit(0);
});