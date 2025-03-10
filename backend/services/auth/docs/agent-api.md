# Agent API Documentation

This document describes the API endpoints available for managing agent profiles in the MukkaAI system.

## Base URL

All API endpoints are relative to: `/agents`

## Authentication

All endpoints require authentication. Include an `Authorization` header with a valid Bearer token:

```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

## Endpoints

### List Agents

Retrieves a list of agent profiles for the current user.

- **URL**: `/agents`
- **Method**: `GET`
- **Query Parameters**:
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 10)
  - `sortBy` (optional): Field to sort by (default: 'createdAt')
  - `sortDir` (optional): Sort direction ('asc' or 'desc', default: 'desc')
  - `includeTemplates` (optional): Whether to include templates (default: false)

- **Success Response**: `200 OK`
  ```json
  {
    "profiles": [
      {
        "_id": "60f7b1c91d121a0012345678",
        "name": "My Agent",
        "description": "A helpful agent",
        "personalityTraits": [...],
        "knowledgeDomains": [...],
        "accessControl": {
          "createdBy": "60f7b1c91d121a0012345679",
          "isPublic": false,
          "allowEditing": true
        }
      }
    ],
    "totalCount": 5,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
  ```

### Get Agent by ID

Retrieves a specific agent profile by ID.

- **URL**: `/agents/:id`
- **Method**: `GET`
- **URL Parameters**:
  - `id`: ID of the agent profile
- **Query Parameters**:
  - `populate` (optional): Whether to populate references (default: false)

- **Success Response**: `200 OK`
  ```json
  {
    "_id": "60f7b1c91d121a0012345678",
    "name": "My Agent",
    "description": "A helpful agent",
    "personalityTraits": [...],
    "knowledgeDomains": [...],
    "accessControl": {
      "createdBy": "60f7b1c91d121a0012345679",
      "isPublic": false,
      "allowEditing": true
    }
  }
  ```

- **Error Responses**:
  - `404 Not Found`: Agent profile not found
  - `403 Forbidden`: User does not have permission to view the profile

### Create Agent

Creates a new agent profile.

- **URL**: `/agents`
- **Method**: `POST`
- **Headers**:
  - `Content-Type: application/json`
- **Body**:
  ```json
  {
    "name": "New Agent",
    "description": "A helpful agent",
    "personalityTraits": ["60f7b1c91d121a001234567a", "60f7b1c91d121a001234567b"],
    "personalityIntensity": 0.7,
    "knowledgeDomains": [
      {
        "domain": "60f7b1c91d121a001234567c",
        "level": 0.8
      }
    ],
    "llmConfig": {
      "model": "llama3",
      "temperature": 0.7,
      "maxTokens": 1024
    },
    "systemPrompt": "You are a helpful assistant..."
  }
  ```

- **Success Response**: `201 Created`
  ```json
  {
    "success": true,
    "profile": {
      "_id": "60f7b1c91d121a0012345678",
      "name": "New Agent",
      "description": "A helpful agent",
      ...
    }
  }
  ```

- **Error Response**: `400 Bad Request`
  ```json
  {
    "success": false,
    "errors": ["Agent name is required", "Invalid personality trait ID"]
  }
  ```

### Update Agent

Updates an existing agent profile.

- **URL**: `/agents/:id`
- **Method**: `PUT`
- **URL Parameters**:
  - `id`: ID of the agent profile to update
- **Headers**:
  - `Content-Type: application/json`
- **Body**:
  ```json
  {
    "name": "Updated Agent",
    "description": "An improved agent",
    "personalityIntensity": 0.8
  }
  ```

- **Success Response**: `200 OK`
  ```json
  {
    "success": true,
    "profile": {
      "_id": "60f7b1c91d121a0012345678",
      "name": "Updated Agent",
      "description": "An improved agent",
      ...
    }
  }
  ```

- **Error Responses**:
  - `400 Bad Request`: Validation errors
  - `403 Forbidden`: User does not have permission to update the profile
  - `404 Not Found`: Agent profile not found

### Delete Agent

Deletes an agent profile.

- **URL**: `/agents/:id`
- **Method**: `DELETE`
- **URL Parameters**:
  - `id`: ID of the agent profile to delete

- **Success Response**: `200 OK`
  ```json
  {
    "success": true,
    "message": "Agent profile deleted successfully"
  }
  ```

- **Error Responses**:
  - `403 Forbidden`: User does not have permission to delete the profile
  - `404 Not Found`: Agent profile not found

### List Templates

Retrieves available agent templates.

- **URL**: `/agents/templates`
- **Method**: `GET`
- **Query Parameters**:
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 10)
  - `sortBy` (optional): Field to sort by (default: 'name')
  - `sortDir` (optional): Sort direction ('asc' or 'desc', default: 'asc')
  - `category` (optional): Filter by template category

- **Success Response**: `200 OK`
  ```json
  {
    "templates": [
      {
        "_id": "60f7b1c91d121a0012345678",
        "name": "Technical Coach",
        "description": "A template for technical coaching agents",
        "templateSettings": {
          "isTemplate": true,
          "category": "technical",
          "featured": true,
          "popularity": 5,
          "version": "1.0.0"
        },
        ...
      }
    ],
    "totalCount": 5,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
  ```

### Create from Template

Creates a new agent profile from a template.

- **URL**: `/agents/from-template`
- **Method**: `POST`
- **Headers**:
  - `Content-Type: application/json`
- **Body**:
  ```json
  {
    "templateId": "60f7b1c91d121a0012345678",
    "customizations": {
      "name": "My Technical Coach",
      "description": "Customized technical coach",
      "personalityTraits": ["60f7b1c91d121a001234567a"],
      "personalityIntensity": 0.8,
      "llmConfig": {
        "temperature": 0.8
      }
    }
  }
  ```

- **Success Response**: `201 Created`
  ```json
  {
    "success": true,
    "profile": {
      "_id": "60f7b1c91d121a0012345679",
      "name": "My Technical Coach",
      "description": "Customized technical coach",
      "templateSettings": {
        "isTemplate": false,
        "derivedFrom": "60f7b1c91d121a0012345678"
      },
      ...
    }
  }
  ```

- **Error Responses**:
  - `400 Bad Request`: Validation errors
  - `404 Not Found`: Template not found

### Convert to Template

Converts an agent profile to a template.

- **URL**: `/agents/:id/convert-to-template`
- **Method**: `POST`
- **URL Parameters**:
  - `id`: ID of the agent profile to convert
- **Headers**:
  - `Content-Type: application/json`
- **Body**:
  ```json
  {
    "category": "technical",
    "isPublic": true,
    "featured": false,
    "version": "1.0.0"
  }
  ```

- **Success Response**: `200 OK`
  ```json
  {
    "success": true,
    "profile": {
      "_id": "60f7b1c91d121a0012345678",
      "name": "Technical Coach",
      "templateSettings": {
        "isTemplate": true,
        "category": "technical",
        "featured": false,
        "popularity": 0,
        "version": "1.0.0"
      },
      ...
    }
  }
  ```

- **Error Responses**:
  - `403 Forbidden`: Only the creator can convert an agent to a template
  - `404 Not Found`: Agent profile not found

### Search Agents

Searches for agent profiles and templates.

- **URL**: `/agents/search`
- **Method**: `GET`
- **Query Parameters**:
  - `q`: Search query (required)
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 10)
  - `includeTemplates` (optional): Whether to include templates (default: true)
  - `onlyTemplates` (optional): Whether to only include templates (default: false)
  - `onlyPublic` (optional): Whether to only include public profiles (default: true)

- **Success Response**: `200 OK`
  ```json
  {
    "profiles": [
      {
        "_id": "60f7b1c91d121a0012345678",
        "name": "Technical Coach",
        "description": "A template for technical coaching agents",
        ...
      }
    ],
    "totalCount": 5,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
  ```

- **Error Response**: `400 Bad Request`
  ```json
  {
    "success": false,
    "errors": ["Search query is required"]
  }
  ```

## Error Handling

All endpoints follow a consistent error response format:

```json
{
  "success": false,
  "errors": ["Error message 1", "Error message 2"]
}
```

Common HTTP status codes:
- `200 OK`: Request succeeded
- `201 Created`: Resource successfully created
- `400 Bad Request`: Invalid request or validation errors
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Authenticated but not authorized
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error
