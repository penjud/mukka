/**
 * AgentProfile Model
 * 
 * Defines the schema for MukkaAI agent profiles, encapsulating both their attributes and behaviors.
 * This model is designed to work with MongoDB and integrates with the MCP (Model Context Protocol)
 * system for agent-based LLM interactions.
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Agent Profile Schema
 * 
 * Stores configuration for an AI agent, including its personality, knowledge domains,
 * LLM settings, and tool access permissions.
 */
const AgentProfileSchema = new Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Agent name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  
  description: {
    type: String,
    required: [true, 'Agent description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  
  avatar: {
    type: String,
    default: '/assets/avatars/default.png',
    validate: {
      validator: function(v) {
        // Allow valid URLs or relative paths
        return /^(\/|https?:\/\/)/.test(v);
      },
      message: props => `${props.value} is not a valid avatar path or URL`
    }
  },
  
  // Personality Configuration
  personalityTraits: [{
    type: Schema.Types.ObjectId,
    ref: 'PersonalityTrait'
  }],
  
  personalityIntensity: {
    type: Number,
    min: [1, 'Intensity must be at least 1'],
    max: [10, 'Intensity cannot exceed 10'],
    default: 5
  },
  
  // Knowledge and Expertise
  knowledgeDomains: [{
    domain: {
      type: Schema.Types.ObjectId,
      ref: 'KnowledgeDomain',
      required: true
    },
    expertiseLevel: {
      type: Number,
      min: [1, 'Expertise level must be at least 1'],
      max: [5, 'Expertise level cannot exceed 5'],
      default: 3
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  
  // RAG Integration
  ragSettings: {
    enabled: {
      type: Boolean,
      default: true
    },
    maxSources: {
      type: Number,
      min: [1, 'Must retrieve at least 1 source'],
      max: [10, 'Cannot retrieve more than 10 sources'],
      default: 5
    },
    relevanceThreshold: {
      type: Number,
      min: [0, 'Threshold must be at least 0'],
      max: [1, 'Threshold cannot exceed 1'],
      default: 0.7
    },
    citationStyle: {
      type: String,
      enum: ['none', 'inline', 'footnote', 'academic', 'legal'],
      default: 'inline'
    },
    vaultPaths: [{
      type: String,
      validate: {
        validator: function(v) {
          return v.startsWith('/mukka_vault/');
        },
        message: props => `${props.value} is not a valid mukka_vault path`
      }
    }]
  },
  
  // LLM Configuration
  llmConfig: {
    model: {
      type: String,
      required: [true, 'LLM model is required'],
      enum: ['llama3', 'dolphin-mistral', 'NeuralDaredevil-8B', 'other'],
      default: 'llama3'
    },
    temperature: {
      type: Number,
      min: [0, 'Temperature must be at least 0'],
      max: [2, 'Temperature cannot exceed 2'],
      default: 0.7
    },
    maxTokens: {
      type: Number,
      min: [100, 'Max tokens must be at least 100'],
      max: [100000, 'Max tokens cannot exceed 100000'],
      default: 4000
    },
    topP: {
      type: Number,
      min: [0, 'Top P must be at least 0'],
      max: [1, 'Top P cannot exceed 1'],
      default: 0.9
    },
    presencePenalty: {
      type: Number,
      min: [0, 'Presence penalty must be at least 0'],
      max: [2, 'Presence penalty cannot exceed 2'],
      default: 0
    },
    frequencyPenalty: {
      type: Number,
      min: [0, 'Frequency penalty must be at least 0'],
      max: [2, 'Frequency penalty cannot exceed 2'],
      default: 0
    },
    contextWindowSize: {
      type: Number,
      min: [1024, 'Context window must be at least 1024'],
      max: [100000, 'Context window cannot exceed 100000'],
      default: 8192
    }
  },
  
  // System Prompt
  systemPrompt: {
    type: String,
    required: [true, 'System prompt is required'],
    maxlength: [8000, 'System prompt cannot exceed 8000 characters']
  },
  
  // Tool Access
  toolAccess: {
    memory: {
      enabled: { type: Boolean, default: true },
      readAccess: { type: Boolean, default: true },
      writeAccess: { type: Boolean, default: true }
    },
    filesystem: {
      enabled: { type: Boolean, default: true },
      paths: [{ 
        type: String,
        validate: {
          validator: function(v) {
            return v.startsWith('/mukka_vault/');
          },
          message: props => `${props.value} is not a valid mukka_vault path`
        }
      }],
      readOnly: { type: Boolean, default: true }
    },
    braveSearch: {
      enabled: { type: Boolean, default: true },
      maxResults: { 
        type: Number,
        min: [1, 'Must allow at least 1 result'],
        max: [20, 'Cannot exceed 20 results'],
        default: 5
      }
    },
    codeExecution: { 
      enabled: { type: Boolean, default: false }
    },
    calendar: { 
      enabled: { type: Boolean, default: false },
      readOnly: { type: Boolean, default: true }
    },
    email: { 
      enabled: { type: Boolean, default: false },
      readOnly: { type: Boolean, default: true }
    }
  },
  
  // Access Control
  accessControl: {
    isPublic: {
      type: Boolean,
      default: false
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    allowEditing: {
      type: Boolean,
      default: true
    },
    editors: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    viewers: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  
  // Template Settings
  templateSettings: {
    isTemplate: {
      type: Boolean,
      default: false
    },
    category: {
      type: String,
      enum: ['professional', 'creative', 'technical', 'casual', 'specialized', 'uncategorized'],
      default: 'uncategorized'
    },
    featured: {
      type: Boolean,
      default: false
    },
    popularity: {
      type: Number,
      default: 0
    },
    version: {
      type: String,
      default: '1.0.0'
    },
    derivedFrom: {
      type: String,
      default: null
    }
  },
  
  // Usage Statistics
  usageStats: {
    totalConversations: {
      type: Number,
      default: 0
    },
    totalMessages: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      min: [0, 'Rating must be at least 0'],
      max: [5, 'Rating cannot exceed 5'],
      default: 0
    },
    lastUsed: {
      type: Date
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for agent's URL
AgentProfileSchema.virtual('url').get(function() {
  return `/agents/${this._id}`;
});

// Compound index for better query performance
AgentProfileSchema.index({ 'accessControl.createdBy': 1, 'accessControl.isPublic': 1 });
AgentProfileSchema.index({ 'templateSettings.isTemplate': 1, 'templateSettings.category': 1 });
AgentProfileSchema.index({ 'knowledgeDomains.domain': 1 });

/**
 * Assembles the complete system prompt for this agent
 * @returns {Promise<String>} The assembled system prompt
 */
AgentProfileSchema.methods.assembleSystemPrompt = async function() {
  await this.populate([
    {
      path: 'personalityTraits',
      select: 'name promptSegment'
    }, 
    {
      path: 'knowledgeDomains.domain',
      select: 'name promptSegment'
    }
  ]);
  
  // Start with base system prompt
  let finalPrompt = this.systemPrompt;
  
  // Add personality instructions
  if (this.personalityTraits && this.personalityTraits.length > 0) {
    const personalitySection = `\n\n## Personality Instructions\n` + 
      this.personalityTraits.map(trait => trait.promptSegment).join('\n\n');
    
    finalPrompt += personalitySection;
  }
  
  // Add knowledge domain instructions
  if (this.knowledgeDomains && this.knowledgeDomains.length > 0) {
    const primaryDomains = this.knowledgeDomains
      .filter(kd => kd.isPrimary && kd.domain && kd.domain.promptSegment)
      .map(kd => kd.domain.promptSegment);
    
    if (primaryDomains.length > 0) {
      finalPrompt += `\n\n## Knowledge Domain Instructions\n` + primaryDomains.join('\n\n');
    }
  }
  
  // Add tool access instructions
  const enabledTools = [];
  for (const [tool, config] of Object.entries(this.toolAccess)) {
    if (config.enabled) {
      enabledTools.push(tool);
    }
  }
  
  if (enabledTools.length > 0) {
    finalPrompt += `\n\n## Tool Access\nYou have access to the following tools: ${enabledTools.join(', ')}.`;
    
    // Add specific tool instructions
    if (this.toolAccess.filesystem.enabled) {
      finalPrompt += `\n\nFor filesystem access, you can access the following paths: ${this.toolAccess.filesystem.paths.join(', ')}.`;
      if (this.toolAccess.filesystem.readOnly) {
        finalPrompt += ` You have read-only access to these paths.`;
      }
    }
  }
  
  // Add citation instructions if enabled
  if (this.ragSettings.enabled) {
    finalPrompt += `\n\n## Source Citations\n`;
    switch (this.ragSettings.citationStyle) {
      case 'inline':
        finalPrompt += `When citing sources, include the reference inline like this: [Source: document_name.md].`;
        break;
      case 'footnote':
        finalPrompt += `When citing sources, add numbered footnotes and include a references section at the end of your responses.`;
        break;
      case 'academic':
        finalPrompt += `When citing sources, use academic citation format with author names and dates when available.`;
        break;
      case 'legal':
        finalPrompt += `When citing sources, use legal citation format for any legal documents or precedents.`;
        break;
      case 'none':
        finalPrompt += `You can use information from sources without explicit citation, but ensure information is accurate.`;
        break;
    }
  }
  
  return finalPrompt;
};

/**
 * Updates the LLM parameters based on personality traits
 * @returns {Object} Modified LLM parameters
 */
AgentProfileSchema.methods.getLLMParameters = async function() {
  await this.populate({
    path: 'personalityTraits',
    select: 'parameters'
  });
  
  // Start with the base configuration
  const params = { ...this.llmConfig };
  
  // Adjust parameters based on personality traits if they exist
  if (this.personalityTraits && this.personalityTraits.length > 0) {
    // Calculate average parameter values weighted by personality intensity
    const traitParams = this.personalityTraits
      .filter(trait => trait.parameters)
      .map(trait => trait.parameters);
    
    if (traitParams.length > 0) {
      // Calculate average values for each parameter
      const avgTemp = traitParams.reduce((sum, p) => sum + (p.temperature || 0), 0) / traitParams.length;
      const avgTopP = traitParams.reduce((sum, p) => sum + (p.top_p || 0), 0) / traitParams.length;
      const avgFreqP = traitParams.reduce((sum, p) => sum + (p.frequency_penalty || 0), 0) / traitParams.length;
      const avgPresP = traitParams.reduce((sum, p) => sum + (p.presence_penalty || 0), 0) / traitParams.length;
      
      // Apply personality intensity factor (1-10 scale)
      const intensityFactor = this.personalityIntensity / 5; // normalize to 0.2-2.0 range
      
      // Blend with base parameters (give more weight to personality as intensity increases)
      params.temperature = 0.3 * params.temperature + 0.7 * avgTemp * intensityFactor;
      params.topP = 0.3 * params.topP + 0.7 * avgTopP;
      params.frequencyPenalty = 0.3 * params.frequencyPenalty + 0.7 * avgFreqP * intensityFactor;
      params.presencePenalty = 0.3 * params.presencePenalty + 0.7 * avgPresP * intensityFactor;
      
      // Ensure parameters stay within valid ranges
      params.temperature = Math.min(Math.max(params.temperature, 0), 2);
      params.topP = Math.min(Math.max(params.topP, 0), 1);
      params.frequencyPenalty = Math.min(Math.max(params.frequencyPenalty, 0), 2);
      params.presencePenalty = Math.min(Math.max(params.presencePenalty, 0), 2);
    }
  }
  
  return params;
};

/**
 * Records usage of this agent
 * @param {Boolean} newConversation Whether this is a new conversation
 * @returns {Promise<void>}
 */
AgentProfileSchema.methods.recordUsage = async function(newConversation = false) {
  this.usageStats.totalMessages += 1;
  if (newConversation) {
    this.usageStats.totalConversations += 1;
  }
  this.usageStats.lastUsed = new Date();
  return this.save();
};

// Pre-save middleware to verify knowledge domain configurations
AgentProfileSchema.pre('save', async function(next) {
  // Ensure at least one knowledge domain is marked as primary
  if (this.knowledgeDomains && this.knowledgeDomains.length > 0) {
    const hasPrimary = this.knowledgeDomains.some(kd => kd.isPrimary);
    if (!hasPrimary) {
      this.knowledgeDomains[0].isPrimary = true;
    }
  }
  
  next();
});

// Create model from schema
const AgentProfile = mongoose.model('AgentProfile', AgentProfileSchema);

module.exports = AgentProfile;
