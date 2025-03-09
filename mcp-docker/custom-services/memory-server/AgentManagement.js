const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class AgentManagement {
  constructor(dataPath) {
    this.dataPath = dataPath || process.env.AGENT_FILE_PATH || '/data/agents.json';
    this.agents = this.loadAgents();
  }

  loadAgents() {
    try {
      if (fs.existsSync(this.dataPath)) {
        const data = fs.readFileSync(this.dataPath, 'utf8');
        return JSON.parse(data);
      }
      return {};
    } catch (error) {
      console.error('Error loading agents:', error);
      return {};
    }
  }

  saveAgents() {
    try {
      const dirPath = path.dirname(this.dataPath);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      fs.writeFileSync(this.dataPath, JSON.stringify(this.agents, null, 2), 'utf8');
    } catch (error) {
      console.error('Error saving agents:', error);
    }
  }

  getAgents() {
    return Object.values(this.agents);
  }

  getAgent(agentId) {
    return this.agents[agentId];
  }

  createAgent(agentData) {
    // Generate a new UUID regardless of whether agentData contains an id
    const agentId = uuidv4();
    
    // Create a new agent object with the generated ID
    const agent = {
      // Start with basic properties
      id: agentId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Spread the rest of agentData but ensure we override id with our generated one
      ...agentData,
      // Force the ID to be our generated one, even if agentData contained an id
      id: agentId 
    };
    
    // Store the agent in our map using the generated ID as key
    this.agents[agentId] = agent;
    
    // Save to persistent storage
    this.saveAgents();
    
    // Return the complete agent with the generated ID
    return agent;
  }

  updateAgent(agentId, agentData) {
    if (!this.agents[agentId]) {
      throw new Error('Agent not found');
    }
    
    this.agents[agentId] = {
      ...this.agents[agentId],
      ...agentData,
      updatedAt: new Date().toISOString()
    };
    
    this.saveAgents();
    return this.agents[agentId];
  }

  deleteAgent(agentId) {
    if (!this.agents[agentId]) {
      throw new Error('Agent not found');
    }
    
    delete this.agents[agentId];
    this.saveAgents();
    return { success: true };
  }

  // Get the system prompt for an agent, incorporating traits and expertise
  getSystemPrompt(agentId) {
    const agent = this.getAgent(agentId);
    if (!agent) {
      throw new Error('Agent not found');
    }
    
    // If agent has a custom system prompt, use that
    if (agent.systemPrompt) {
      return agent.systemPrompt;
    }
    
    // Otherwise, build a system prompt from traits and expertise
    let prompt = 'You are a helpful assistant';
    
    if (agent.traits && agent.traits.length > 0) {
      prompt += ' with the following traits: ' + agent.traits.join(', ');
    }
    
    if (agent.expertise && agent.expertise.length > 0) {
      prompt += '. You have expertise in: ' + agent.expertise.join(', ');
    }
    
    return prompt + '.';
  }

  // Associate an agent with a conversation
  associateWithConversation(agentId, conversationId) {
    if (!this.agents[agentId]) {
      throw new Error('Agent not found');
    }
    
    // If the agent doesn't have conversations yet, initialize the array
    if (!this.agents[agentId].conversations) {
      this.agents[agentId].conversations = [];
    }
    
    // Add the conversation ID if it's not already there
    if (!this.agents[agentId].conversations.includes(conversationId)) {
      this.agents[agentId].conversations.push(conversationId);
      this.saveAgents();
    }
    
    return this.agents[agentId];
  }

  // Get all conversations associated with an agent
  getAgentConversations(agentId) {
    const agent = this.getAgent(agentId);
    if (!agent) {
      throw new Error('Agent not found');
    }
    
    return agent.conversations || [];
  }
}

module.exports = AgentManagement;