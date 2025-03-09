/**
 * Direct Execution Script for Auth Server
 * This script starts the auth server directly using Node.js
 * It's useful for debugging issues that might be related to Docker containers
 */

// Import required modules
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Set environment variables
process.env.PORT = process.env.PORT || '8097';
process.env.BASE_SERVER_URL = process.env.BASE_SERVER_URL || 'http://localhost:8090';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret';
process.env.CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3001';
process.env.USE_MONGODB = 'true';
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mcp-auth';
process.env.MONGODB_CONNECTION_POOL_SIZE = process.env.MONGODB_CONNECTION_POOL_SIZE || '10';

// Log the configuration
console.log('Starting Auth Server with the following configuration:');
console.log(`PORT: ${process.env.PORT}`);
console.log(`BASE_SERVER_URL: ${process.env.BASE_SERVER_URL}`);
console.log(`CORS_ORIGIN: ${process.env.CORS_ORIGIN}`);
console.log(`USE_MONGODB: ${process.env.USE_MONGODB}`);
console.log(`MONGODB_URI: ${process.env.MONGODB_URI}`);

// Run the server
const serverPath = path.join(__dirname, 'src', 'index.js');
console.log(`Starting server from: ${serverPath}`);

try {
  // Check if the file exists
  if (!fs.existsSync(serverPath)) {
    console.error(`Error: Server file not found at ${serverPath}`);
    process.exit(1);
  }

  // Start the server process
  const server = spawn('node', [serverPath], {
    stdio: 'inherit',
    env: process.env
  });

  // Handle server events
  server.on('error', (err) => {
    console.error('Failed to start server:', err);
  });

  server.on('exit', (code, signal) => {
    if (code) {
      console.error(`Server process exited with code ${code}`);
    } else if (signal) {
      console.error(`Server process was killed with signal ${signal}`);
    } else {
      console.log('Server process exited successfully');
    }
  });

  // Handle process termination
  process.on('SIGINT', () => {
    console.log('Received SIGINT. Shutting down server...');
    server.kill('SIGINT');
  });

  process.on('SIGTERM', () => {
    console.log('Received SIGTERM. Shutting down server...');
    server.kill('SIGTERM');
  });

  console.log('Server process started.');
} catch (error) {
  console.error('Error starting the server:', error);
}
