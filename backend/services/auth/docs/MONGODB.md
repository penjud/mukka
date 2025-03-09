# MongoDB Integration Documentation

This document describes the MongoDB integration in the MCP Authentication Server, including its architecture, configuration, and maintenance procedures.

## Architecture Overview

The Authentication Server implements a dual-storage architecture that can use either MongoDB or file-based storage. This provides several benefits:

1. **Improved Performance**: MongoDB offers better performance for large user bases
2. **Horizontal Scaling**: The system can scale across multiple instances
3. **Data Integrity**: MongoDB provides ACID transactions and data validation
4. **Graceful Fallback**: If MongoDB is unavailable, the system falls back to file storage

### Key Components

#### Models

The system uses three main MongoDB models:

1. **User Model**: Stores user credentials and profile information
   - Username, password hash, role, email, and preferences
   - Implements methods for password verification and setting

2. **RefreshToken Model**: Manages refresh tokens for JWT authentication
   - Token value, username, expiration date, and revocation status
   - Methods for validation, revocation, and cleanup

3. **PasswordResetToken Model**: Handles password reset functionality
   - Token value, username, expiration date, and usage status
   - Methods for token generation, validation, and cleanup

#### Repositories

Repository classes provide an abstraction layer for data access:

1. **UserRepository**: Methods for user CRUD operations
2. **RefreshTokenRepository**: Methods for token management
3. **PasswordResetTokenRepository**: Methods for password reset token management

This pattern allows the system to switch between storage backends without changing higher-level code.

## Configuration

### Environment Variables

The MongoDB integration is configured using environment variables:

- `USE_MONGODB`: Enables MongoDB integration (default: true in production)
- `MONGODB_URI`: MongoDB connection string (default: mongodb://localhost:27017/mcp-auth)
- `MONGODB_CONNECTION_POOL_SIZE`: Connection pool size (default: 10)

### Example Configuration

In your `.env` file:

```
USE_MONGODB=true
MONGODB_URI=mongodb://localhost:27017/mcp-auth
MONGODB_CONNECTION_POOL_SIZE=10
```

## Data Migration

A migration script is provided to transfer data from the JSON file to MongoDB:

```bash
npm run migrate
```

The migration process:

1. Reads data from the JSON file
2. Validates and transforms the data as needed
3. Creates corresponding documents in MongoDB
4. Skips existing records to avoid duplicates
5. Logs the migration progress

## Monitoring and Maintenance

### Health Check

The `/health` endpoint provides information about the MongoDB connection status:

```json
{
  "status": "healthy",
  "uptime": 1234.5678,
  "timestamp": "2023-01-01T00:00:00.000Z",
  "services": {
    "file_storage": {
      "status": "available",
      "active": false
    },
    "mongodb": {
      "status": "connected",
      "active": true
    }
  }
}
```

### Database Maintenance

Regular maintenance tasks:

1. **Cleanup Expired Tokens**: The system automatically removes expired tokens
2. **Index Optimization**: MongoDB indexes are defined for optimal performance
3. **Connection Management**: The system handles connection failures and reconnection
4. **Backup**: Regular database backups should be configured externally

## Troubleshooting

Common issues and solutions:

1. **Connection Failures**: If MongoDB connection fails, the system logs errors and falls back to file storage. Check MongoDB server status and connection string.

2. **Performance Issues**: If performance degrades, check MongoDB server resources, connection pool size, and index usage.

3. **Data Inconsistency**: If data inconsistency occurs between file storage and MongoDB, run the migration script to synchronize.

4. **Missing Data**: If data appears to be missing after migration, check migration logs for errors and ensure MongoDB is properly indexed.

## Security Recommendations

For secure MongoDB deployment:

1. **Enable Authentication**: Configure MongoDB with username/password authentication
2. **Use TLS/SSL**: Enable encryption for all MongoDB connections
3. **Network Restrictions**: Limit access to the MongoDB server
4. **Regular Updates**: Keep MongoDB server updated with security patches
5. **Access Control**: Use principle of least privilege for database users
