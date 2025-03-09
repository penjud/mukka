# MCP Authentication Server

## Overview

The MCP Authentication Server provides user authentication, authorization, and account management for the MCP system. It supports both file-based storage and MongoDB for production use.

## Recent Updates

### Fixed Service Registration

- Updated service registration URL from `http://mukka-mcp-auth-server:${PORT}` to `http://mcp-auth-server:${PORT}`
- This ensures proper DNS resolution in the Docker network

### Standardized Development Process

- Added documentation for Docker-based development workflow in `docs/Docker-Development-Workflow.md`
- Added Docker-specific debugging and logging procedures in `docs/Docker-Debugging-Guide.md`
- Created health check script in `scripts/health-check.sh`

## Setup and Configuration

### Environment Variables

The Auth Server uses the following environment variables, which can be set in the `.env` file:

- `PORT`: Server port (default: 8097)
- `BASE_SERVER_URL`: URL of the MCP Base Server (default: http://mukka-mcp-base-server:8090)
- `JWT_SECRET`: Secret for JWT token generation
- `REFRESH_TOKEN_SECRET`: Secret for refresh token generation
- `CORS_ORIGIN`: Allowed CORS origin (default: http://localhost:3002)
- `USE_MONGODB`: Set to 'true' to use MongoDB (default: true in production)
- `MONGODB_URI`: MongoDB connection string
- `LOG_LEVEL`: Logging level (default: info)

### Docker Configuration

The Auth Server is designed to run in a Docker container. Key configuration points:

- Container name: `mukka-mcp-auth-server`
- Service name: `mcp-auth-server` (for DNS resolution)
- Exposed port: 8097

## Development Workflow

See `docs/Docker-Development-Workflow.md` for detailed instructions on developing in the Docker environment.

## Quick Start

```bash
# Build and start the Auth Server
docker-compose build mcp-auth-server
docker-compose up -d mcp-auth-server

# Check service health
./scripts/health-check.sh

# View logs
docker logs mukka-mcp-auth-server -f
```

## API Endpoints

### Authentication
- `POST /login`: Login with username and password
- `POST /logout`: Logout current user
- `POST /refresh-token`: Refresh access token
- `POST /logout-all`: Logout from all devices
- `GET /me`: Get current user information
- `PUT /me`: Update user profile
- `PUT /password`: Change password

### User Management (Admin only)
- `GET /users`: List all users
- `POST /users`: Create a new user
- `DELETE /users/:username`: Delete a user

### Password Reset
- `POST /forgot-password`: Request password reset
- `POST /reset-password`: Reset password with token

### Health Checks
- `GET /health`: Service health check
- `GET /health/db`: Database connection check

## Troubleshooting

See `docs/Docker-Debugging-Guide.md` for detailed troubleshooting procedures.

## Default Credentials

- Username: `admin`
- Password: `admin123`
