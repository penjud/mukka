# MCP Authentication Integration

This document outlines the authentication system implemented for the MCP (Model Context Protocol) project.

## Overview

The authentication system provides:

- User login/logout functionality
- Role-based access control
- JWT token-based authentication
- Secure password storage with bcrypt
- Administrative user management

## Authentication Flow

1. User submits credentials to `/login` endpoint
2. Server validates credentials against stored hash
3. On success, JWT token is issued and stored as HTTP-only cookie
4. Token is automatically sent with subsequent requests
5. Protected routes validate token and check permissions

## Default Credentials

The system is initialized with a default administrator account:

- **Username**: admin
- **Password**: admin123

**IMPORTANT**: Change these credentials immediately after initial setup!

## API Endpoints

### Public Endpoints

- **GET /** - Server status
- **POST /login** - Authenticate user
- **POST /verify** - Verify token validity

### Protected Endpoints

- **POST /logout** - End user session
- **GET /me** - Get current user information

### Admin-Only Endpoints

- **GET /users** - List all users
- **POST /users** - Create new user
- **DELETE /users/:username** - Delete user

## Integration with Web UI

The Web UI should:

1. Redirect unauthenticated users to login page
2. Store user role and information in client-side state
3. Show/hide functionality based on user role
4. Handle token expiration gracefully

## Security Considerations

- Passwords are hashed with bcrypt (10 rounds)
- JWT tokens expire after 24 hours
- HTTP-only cookies prevent JavaScript access
- Token verification on each protected request
- Role checks for privileged operations

## Adding New Users

Administrators can add users via:

1. API call:
   ```
   POST /users
   {
     "username": "newuser",
     "password": "securepassword123",
     "role": "user"
   }
   ```

2. Direct manipulation of `users.json`

## Example Usage

```javascript
// Login
const login = async (username, password) => {
  const response = await fetch('http://localhost:8097/login', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  return response.json();
};

// Access protected resource
const getProfile = async () => {
  const response = await fetch('http://localhost:8097/me', {
    credentials: 'include'
  });
  return response.json();
};
```
