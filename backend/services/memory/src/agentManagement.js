const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class AgentManagement {
  constructor(storageDir = '/app/data/memory/agents') {
    this.storageDir = storageDir;
    this.agents = new Map();
    this.init();
  }

  init() {
    // Ensure storage directory exists
    fs.ensureDirSync(this.storageDir);
    this.loadAgents();
  }

  loadAgents() {
    try {
      const files = fs.readdirSync(this.storageDir);
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const agentId = path.basename(file, '.json');
          const agentData = fs.readJSONSync(path.join(this.storageDir, file));
          this.agents.set(agentId, agentData);
        }
      }
    } catch (error) {
      console.error('Error loading agents:', error);
    }
  }

  saveAgent(agentId) {
    try {
      const agent = this.agents.get(agentId);
      if (agent) {
        fs.writeJSONSync(
          path.join(this.storageDir, `${agentId}.json`), 
          agent
        );
      }
    } catch (error) {
      console.error(`Error saving agent ${agentId}:`, error);
    }
  }

  createAgent(agentData) {
    const agentId = uuidv4();
    const timestamp = new Date().toISOString();
    
    const newAgent = {
      id: agentId,
      name: agentData.name || 'New Agent',
      description: agentData.description || '',
      avatar: agentData.avatar || null,
      color: agentData.color || 'primary',
      traits: agentData.traits || [],
      expertise: agentData.expertise || [],
      model: agentData.model || 'llama3',
      systemPrompt: agentData.systemPrompt || 'You are a helpful AI assistant.',
      createdAt: timestamp,
      updatedAt: timestamp
    };
    
    this.agents.set(agentId, newAgent);
    this.saveAgent(agentId);
    
    return newAgent;
  }

  getAgent(agentId) {
    return this.agents.get(agentId);
  }

  getAllAgents() {
    return Array.from(this.agents.values());
  }

  updateAgent(agentId, updates) {
    const agent = this.agents.get(agentId);
    
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }
    
    const updatedAgent = {
      ...agent,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    // Ensure id remains unchanged
    updatedAgent.id = agentId;
    
    this.agents.set(agentId, updatedAgent);
    this.saveAgent(agentId);
    
    return updatedAgent;
  }

  deleteAgent(agentId) {
    if (!this.agents.has(agentId)) {
      return false;
    }
    
    this.agents.delete(agentId);
    
    try {
      fs.removeSync(path.join(this.storageDir, `${agentId}.json`));
      return true;
    } catch (error) {
      console.error(`Error deleting agent ${agentId}:`, error);
      return false;
    }
  }

  searchAgents(query) {
    if (!query) return [];
    
    const lowerQuery = query.toLowerCase();
    
    return Array.from(this.agents.values())
      .filter(agent => {
        return (
          (agent.name && agent.name.toLowerCase().includes(lowerQuery)) ||
          (agent.description && agent.description.toLowerCase().includes(lowerQuery)) ||
          (agent.traits && agent.traits.some(trait => trait.toLowerCase().includes(lowerQuery))) ||
          (agent.expertise && agent.expertise.some(skill => skill.toLowerCase().includes(lowerQuery)))
        );
      });
  }
}

module.exports = AgentManagement;
