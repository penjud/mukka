# MCP Vue Dashboard

A real-time dashboard for Model Context Protocol services built with Vue.js, featuring authentication, agent management, and personal workspaces.

## Features
- Vue 3 with Composition API
- Vuetify 3 UI framework for a polished interface
- Authentication system with login/registration
- Personal workspace with chat interface
- Agent management with customizable personas
- Real-time updates using Server-Sent Events (SSE)
- Service discovery for MCP containers
- Configuration-based endpoint management

## Project Structure
- `src/` - Source code
  - `components/` - Reusable Vue components
  - `views/` - Page components
    - `auth/` - Authentication pages
    - `workspace/` - Personal workspace UI
    - `agents/` - Agent management UI
    - `settings/` - User and admin settings
  - `layouts/` - Layout components
  - `router/` - Vue Router configuration
  - `stores/` - Pinia stores
  - `services/` - API and service integrations
  - `config/` - Application configuration

## MCP Integration
This dashboard connects to the following MCP services:
- Base MCP Server (port 8090)
- Memory MCP Server (port 8094)
- Filesystem MCP Server (port 8095)
- Brave Search MCP Server (port 8096)
- Ollama Bridge (port 8082)
- Auth Server (port 8097)

## Authentication Implementation
The dashboard includes a complete authentication system:
- Login form with username/password
- Registration form with validation
- Password recovery flow
- Protected routes with navigation guards
- JWT token storage and management
- User profile management

## Personal Workspace
- Chat interface with conversation history
- Model selection for AI interactions
- Conversation management (create, rename, delete)
- Real-time message updates

## Agent Management
- Create custom agents with unique personalities
- Define agent traits and expertise areas
- Customize agent appearance (avatar, color)
- Configure system prompts for agent behavior
- Integration with Memory MCP for persistence

## Admin Settings
- User management interface
- System configuration
- Service monitoring dashboard
- Agent template management

## Setup and Development
1. Install dependencies: `npm install`
2. Configure endpoints in `src/config/mcp-endpoints.js`
3. Run development server: `npm run dev`

## Deployment
Built files will be in the `dist/` directory after running `npm run build`

## Docker Deployment
The project includes a Dockerfile for containerized deployment:
```
docker build -t mcp-vue-dashboard .
docker run -p 3002:80 mcp-vue-dashboard
```

## Backing Up to GitHub
The project includes a script for backing up to GitHub:
```
bash backup-to-github.sh
```

## Documentation
For more detailed implementation status information, see the IMPLEMENTATION_STATUS.md file.