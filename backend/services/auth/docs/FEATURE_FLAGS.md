# Feature Flags Documentation

This document describes the feature flags available in the MCP Authentication Server and how they affect the system's behavior.

## Available Feature Flags

| Flag | Environment Variable | Default | Description |
|------|---------------------|---------|-------------|
| Use MongoDB | `USE_MONGODB` | `true` in production, `false` otherwise | Controls whether the system uses MongoDB for data storage |
| Account Lockout | `ENABLE_ACCOUNT_LOCKOUT` | `true` | Enables account lockout after multiple failed login attempts |
| Password Reset | `ENABLE_PASSWORD_RESET` | `true` | Enables the password reset functionality |
| Refresh Tokens | `ENABLE_REFRESH_TOKENS` | `true` | Enables refresh token functionality |
| Reset Emails | `SEND_PASSWORD_RESET_EMAILS` | `true` in production, `false` otherwise | Controls whether to send password reset emails or return tokens in response |
| Detailed Errors | `DETAILED_ERRORS` | `true` in development, `false` in production | Controls level of detail in error responses |

## Setting Feature Flags

Feature flags can be set in the following ways:

1. **Environment Variables**: Set the corresponding environment variable in your system or `.env` file.
2. **Docker Environment**: Set as environment variables in your Docker Compose file or container configuration.

Example in `.env` file:
```
USE_MONGODB=true
ENABLE_ACCOUNT_LOCKOUT=true
ENABLE_PASSWORD_RESET=true
```

## Feature Flag Behavior

### MongoDB Integration

When `USE_MONGODB` is set to `true`:
- The system attempts to connect to MongoDB on startup
- User data, refresh tokens, and password reset tokens are stored in MongoDB
- If MongoDB connection fails, the system falls back to file-based storage

When `USE_MONGODB` is set to `false`:
- The system uses file-based storage (JSON files) for all data
- No attempt is made to connect to MongoDB

### Account Lockout

When `ENABLE_ACCOUNT_LOCKOUT` is set to `true`:
- User accounts are locked after multiple failed login attempts
- Locked accounts require administrator action or a timeout period before they can be accessed again

### Password Reset

When `ENABLE_PASSWORD_RESET` is set to `true`:
- The `/forgot-password` and `/reset-password` endpoints are enabled
- Users can request a password reset link

### Refresh Tokens

When `ENABLE_REFRESH_TOKENS` is set to `true`:
- The system issues refresh tokens along with access tokens during login
- The `/refresh-token` endpoint is enabled for obtaining new access tokens

### Reset Emails

When `SEND_PASSWORD_RESET_EMAILS` is set to `true`:
- Password reset tokens are sent via email (requires email configuration)
- Tokens are not returned in API responses

When `SEND_PASSWORD_RESET_EMAILS` is set to `false`:
- Password reset tokens are returned in API responses (for development only)
- No emails are sent

### Detailed Errors

When `DETAILED_ERRORS` is set to `true`:
- Error responses include detailed information, including stack traces
- Useful for debugging, but can expose sensitive information

When `DETAILED_ERRORS` is set to `false`:
- Error responses include only basic information
- More secure for production environments
