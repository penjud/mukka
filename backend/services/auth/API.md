# Authentication Server API Documentation

## Overview

The Authentication Server provides user management, authentication, and authorization services for the MCP platform. It uses JSON Web Tokens (JWT) for authentication with a refresh token mechanism for improved security.

## Base URL

The Auth Server listens on port 8097 by default and is available at:

```
http://localhost:8097
```

## Authentication Flow

1. Client sends credentials to `/login` endpoint
2. Server responds with access token (JWT) and refresh token
3. Client uses access token for authenticated requests
4. When the access token expires, client uses refresh token to get a new access token
5. If refresh token is invalid or expired, client must login again

## Endpoints

### Public Endpoints

#### Health Check
```
GET /health
```
Returns the health status of the auth server, including MongoDB connection status when enabled.

**Response:**
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

**Notes:**
- The `status` field can be `healthy` or `degraded`
- When MongoDB is enabled but has connection issues, the status will show as `degraded`
- The `services` object shows the status of all storage backends

#### Login
```
POST /login
```
Authenticates a user and returns tokens.

**Request Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "username": "admin",
    "role": "admin"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600
}
```

**Notes:**
- The token is also set as an HTTP-only cookie
- A refresh token is set as an HTTP-only cookie with path `/refresh-token`

#### Request Password Reset
```
POST /forgot-password
```
Starts the password reset process for a user.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```
OR
```json
{
  "username": "user123"
}
```

**Response:**
```json
{
  "message": "If that account exists, a password reset link has been sent"
}
```

**Notes:**
- For security reasons, the response is the same whether the user exists or not
- In development mode, the reset token is included in the response for testing

#### Reset Password
```
POST /reset-password
```
Resets a user's password using a reset token.

**Request Body:**
```json
{
  "token": "abc123def456...",
  "newPassword": "newSecurePassword123"
}
```

**Response:**
```json
{
  "message": "Password reset successfully"
}
```

#### Verify Token
```
POST /verify
```
Verifies if a JWT token is valid.

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
OR the token can be in a cookie.

**Response:**
```json
{
  "valid": true,
  "user": {
    "username": "admin",
    "role": "admin"
  }
}
```

### Authenticated Endpoints

All authenticated endpoints require a valid JWT token either as:
- HTTP-only cookie named `token`
- Authorization header: `Authorization: Bearer <token>`

#### Refresh Token
```
POST /refresh-token
```
Generates a new access token using a refresh token.

**Request Cookies:**
- `refreshToken`: The refresh token ID (HTTP-only cookie)

**Response:**
```json
{
  "message": "Token refreshed successfully",
  "user": {
    "username": "admin",
    "role": "admin"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600
}
```

#### Logout
```
POST /logout
```
Invalidates the current session token.

**Response:**
```json
{
  "message": "Logout successful"
}
```

**Notes:**
- Clears both the token and refreshToken cookies
- If refresh token exists in the database, it is removed

#### Logout from All Devices
```
POST /logout-all
```
Invalidates all sessions for the current user.

**Response:**
```json
{
  "message": "Logged out from all devices successfully"
}
```

#### Get Current User
```
GET /me
```
Returns the profile of the currently logged-in user.

**Response:**
```json
{
  "username": "admin",
  "role": "admin"
}
```

#### Update User Profile
```
PUT /me
```
Updates the current user's profile information.

**Request Body:**
```json
{
  "displayName": "Admin User",
  "email": "admin@example.com",
  "preferences": {
    "theme": "dark",
    "notifications": true
  }
}
```

**Response:**
```json
{
  "username": "admin",
  "role": "admin",
  "displayName": "Admin User",
  "email": "admin@example.com",
  "preferences": {
    "theme": "dark",
    "notifications": true
  }
}
```

#### Change Password
```
PUT /password
```
Changes the current user's password.

**Request Body:**
```json
{
  "currentPassword": "currentPassword123",
  "newPassword": "newSecurePassword456"
}
```

**Response:**
```json
{
  "message": "Password changed successfully"
}
```

### Admin Endpoints

These endpoints require admin privileges.

#### List Users
```
GET /users
```
Lists all users in the system.

**Response:**
```json
{
  "users": [
    {
      "username": "admin",
      "role": "admin",
      "createdAt": "2023-01-01T00:00:00.000Z"
    },
    {
      "username": "user1",
      "role": "user",
      "createdAt": "2023-01-02T00:00:00.000Z"
    }
  ]
}
```

#### Create User
```
POST /users
```
Creates a new user.

**Request Body:**
```json
{
  "username": "newuser",
  "password": "password123",
  "role": "user"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "user": {
    "username": "newuser",
    "role": "user",
    "createdAt": "2023-01-03T00:00:00.000Z"
  }
}
```

#### Delete User
```
DELETE /users/:username
```
Deletes a user by username.

**Response:**
```json
{
  "message": "User deleted successfully"
}
```

## Error Handling

All endpoints return standardized error responses with consistent structure:

```json
{
  "error": "Error message description",
  "status": 400,
  "path": "/endpoint-path",
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

Common error status codes:
- `400`: Bad Request (invalid input)
- `401`: Unauthorized (authentication required)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `429`: Too Many Requests (rate limiting)
- `500`: Internal Server Error

## Security Measures

The Authentication Server implements several security measures:
1. Password hashing using bcrypt
2. HTTP-only cookies for token storage
3. CSRF protection via SameSite=Strict cookie attribute
4. Rate limiting for login attempts
5. XSS protection headers
6. Content Security Policy headers
7. Short-lived access tokens with refresh mechanism
8. Token revocation on logout
