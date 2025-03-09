# Vue Dashboard User Guide

This document provides a comprehensive guide for using the Vue Dashboard, the primary user interface for the Mukka platform.

## Table of Contents

1. [Getting Started](#getting-started)
2. [User Interface Overview](#user-interface-overview)
3. [Authentication](#authentication)
4. [Agent Management](#agent-management)
5. [Conversations](#conversations)
6. [File Browser](#file-browser)
7. [Search](#search)
8. [Settings](#settings)
9. [Troubleshooting](#troubleshooting)

---

## Getting Started

### System Requirements

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection
- Access to the Vue Dashboard URL (typically http://localhost:3002 in development)

### Accessing the Dashboard

1. Open your web browser
2. Navigate to http://localhost:3002 (or the configured URL for your deployment)
3. Log in with your credentials

---

## User Interface Overview

The Vue Dashboard is divided into several main sections:

### Navigation Sidebar

The sidebar on the left provides navigation to the main sections of the application:

- **Home**: Dashboard overview
- **Workspace**: Personal workspace with conversations
- **Agents**: Agent management
- **Files**: File browser
- **Search**: Web search interface
- **Settings**: User profile and application settings

### Top Bar

The top bar contains:

- **User profile menu**: Access to profile settings and logout
- **Dark/Light mode toggle**: Switch between dark and light themes
- **Notifications**: System notifications and alerts

### Main Content Area

The central area displays the content of the currently selected section.

---

## Authentication

### Logging In

1. When you first access the Vue Dashboard, you'll be presented with a login screen
2. Enter your username and password
3. Click "Log In"

Default admin credentials:
- Username: `admin`
- Password: `admin123`

*Note: For security, change the default password after your first login.*

### Logging Out

1. Click on your profile picture or initials in the top-right corner
2. Select "Logout" from the dropdown menu

### Password Management

To change your password:

1. Click on your profile picture or initials in the top-right corner
2. Select "Profile" from the dropdown menu
3. Scroll down to the "Change Password" section
4. Enter your current password and new password
5. Click "Save Changes"

---

## Agent Management

Agents are AI personalities that you can customize and chat with. Each agent can have different traits, expertise, and behaviors.

### Viewing Agents

1. Click on the "Agents" section in the sidebar
2. View the grid of available agents
3. Each agent card displays:
   - Name and description
   - Color and avatar (if set)
   - Personality traits
   - Last updated date

### Creating a New Agent

1. Navigate to the "Agents" section
2. Click the "Create Agent" button
3. Fill in the agent details:
   - **Name**: Give your agent a descriptive name
   - **Description**: Briefly describe the agent's purpose
   - **Avatar**: (Optional) Upload an image for the agent
   - **Color**: Select a color theme
   - **Personality Traits**: Select traits that define the agent's personality
   - **Areas of Expertise**: Define what the agent is knowledgeable about
   - **Default Model**: Select which LLM model to use
   - **System Prompt**: Provide detailed instructions that define the agent's behavior
4. Click "Create Agent" to save

### Editing an Agent

1. Find the agent you want to edit in the list
2. Click the "Edit" button on the agent card
3. Modify any of the agent's properties
4. Click "Update Agent" to save changes

### Using Agent Actions

Each agent card has several actions available:

- **Chat**: Start a new conversation with the agent
- **Edit**: Modify the agent's configuration
- **Clone**: Create a duplicate of the agent with a new name
- **Export**: Export the agent configuration as a JSON file
- **Delete**: Remove the agent (requires confirmation)

---

## Conversations

The Workspace is where you chat with agents and manage your conversations.

### Starting a New Conversation

1. Navigate to the "Workspace" section
2. Click "New Conversation" button
3. Select an agent to chat with
4. Enter your first message and press Enter or click the send button

### Continuing Existing Conversations

1. Navigate to the "Workspace" section
2. Select a conversation from the list on the left
3. Continue the conversation where you left off

### Conversation Features

- **Message History**: Scroll through past messages
- **Agent Information**: View details about the current agent
- **Message Actions**:
  - Copy message text
  - Regenerate AI response
  - Report inappropriate content

### Managing Conversations

- **Rename**: Change the title of a conversation
- **Delete**: Remove a conversation (requires confirmation)
- **Export**: Save the conversation as a text or HTML file

---

## File Browser

The File Browser allows you to navigate, upload, and manage files that can be referenced in conversations.

### Browsing Files

1. Navigate to the "Files" section
2. Browse the directory structure using the file explorer
3. Click on folders to navigate inside them
4. Use the breadcrumb navigation at the top to go back

### Viewing and Editing Files

1. Click on a file to select it
2. For text files:
   - View the content in the preview pane
   - Click "Edit" to modify the content
   - Click "Save" to save changes
3. For images and PDFs:
   - View the content in the preview pane
   - Download the file if needed

### File Operations

- **Upload**: Upload files from your computer
- **New Folder**: Create a new directory
- **New File**: Create a new text file
- **Rename**: Change the name of a file or folder
- **Delete**: Remove a file or folder
- **Download**: Save a file to your computer

---

## Search

The Search interface provides web search capabilities powered by the Brave Search API.

### Basic Search

1. Navigate to the "Search" section
2. Enter your search query in the search box
3. Press Enter or click the search button
4. View the search results

### Search Options

- **Result Count**: Adjust how many results to show
- **Safe Search**: Control the filtering level
- **Freshness**: Filter by result age (day, week, month, year)

### Using Search Results

- Click on a result title to open the link in a new tab
- Use the "Quote" button to insert a citation of the result into your current conversation
- Use the "Copy" button to copy the URL to your clipboard

---

## Settings

The Settings section allows you to customize your user profile and application preferences.

### Profile Settings

1. Navigate to the "Settings" section
2. In the "Profile" tab, you can:
   - Change your display name
   - Update your email address
   - Upload a profile picture
   - Change your password

### Application Settings

1. Navigate to the "Settings" section
2. In the "Preferences" tab, you can:
   - Set your theme preference (Light, Dark, or System)
   - Change interface language
   - Configure notification preferences
   - Adjust message display settings

---

## Troubleshooting

### Common Issues

#### Login Problems

- **Issue**: Unable to log in
- **Solution**: 
  - Verify that your username and password are correct
  - Ensure the Auth MCP Server is running
  - Check that your browser accepts cookies

#### Missing Agents or Conversations

- **Issue**: Previously created agents or conversations not appearing
- **Solution**:
  - Verify that the Memory MCP Server is running
  - Check network connectivity to the server
  - Try refreshing the page

#### File Browser Not Loading

- **Issue**: File browser shows no files or fails to load
- **Solution**:
  - Verify that the Filesystem MCP Server is running
  - Check permissions on the filesystem directory
  - Ensure network connectivity to the server

#### Search Not Working

- **Issue**: Search results not appearing
- **Solution**:
  - Verify that the Brave Search MCP Server is running
  - Check if a Brave API key is configured
  - Ensure network connectivity to the server

### Getting Help

If you encounter issues not covered in this guide:

1. Check the server logs for error messages
2. Verify all MCP services are running properly
3. Consult the API documentation for specific endpoints
4. Contact the system administrator for assistance

---

## Advanced Features

### Agent System Prompts

The system prompt is a powerful way to customize an agent's behavior. Here are some tips:

- Be specific about the agent's role and expertise
- Define the tone and style of communication
- Set constraints on what the agent should or shouldn't do
- Provide examples of ideal responses
- Include specialized knowledge the agent should have

Example system prompt:
```
You are a Research Assistant specialized in climate science. You communicate in a clear, factual manner with a focus on scientific accuracy. When responding:
- Prioritize peer-reviewed sources
- Clearly distinguish between established science and emerging theories
- Use plain language while maintaining scientific accuracy
- When uncertain, acknowledge limitations in current scientific understanding
- Cite specific journals or papers when possible
You have particular expertise in climate models, extreme weather events, and climate change mitigation strategies.
```

### Keyboard Shortcuts

- **Ctrl+N** (Windows/Linux) or **Cmd+N** (Mac): New conversation
- **Ctrl+S** (Windows/Linux) or **Cmd+S** (Mac): Save changes (in text editor)
- **Ctrl+F** (Windows/Linux) or **Cmd+F** (Mac): Search in page
- **Esc**: Close dialogs or cancel current operation
