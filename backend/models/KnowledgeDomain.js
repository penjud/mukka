/**
 * KnowledgeDomain Model
 * 
 * Defines knowledge domains that can be assigned to agents, including
 * their hierarchy, RAG integration settings, and prompt engineering.
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Knowledge Resource Schema
 * Represents an important resource for this knowledge domain
 */
const KnowledgeResourceSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Resource name is required'],
    trim: true
  },
  path: {
    type: String,
    required: [true, 'Resource path is required'],
    validate: {
      validator: function(v) {
        return v.startsWith('/mukka_vault/');
      },
      message: props => `${props.value} is not a valid mukka_vault path`
    }
  },
  description: {
    type: String,
    trim: true
  },
  priority: {
    type: Number,
    min: [1, 'Priority must be at least 1'],
    max: [10, 'Priority cannot exceed 10'],
    default: 5
  }
});

/**
 * Retrieval Strategy Schema
 * Defines specific retrieval strategies for this domain
 */
const RetrievalStrategySchema = new Schema({
  name: {
    type: String,
    required: [true, 'Strategy name is required'],
    enum: [
      'general',           // Balanced precision and recall
      'precision_focused', // Prioritize accuracy over coverage
      'recall_focused',    // Prioritize coverage over accuracy
      'precedent_focused', // Focus on previous cases/examples (legal)
      'regulation_focused' // Focus on rules and regulations (legal)
    ],
    default: 'general'
  },
  description: {
    type: String,
    trim: true
  },
  relevanceThreshold: {
    type: Number,
    min: [0, 'Threshold must be at least 0'],
    max: [1, 'Threshold cannot exceed 1'],
    default: 0.7
  },
  maxResults: {
    type: Number,
    min: [1, 'Must include at least 1 result'],
    max: [20, 'Cannot exceed 20 results'],
    default: 5
  },
  searchDepth: {
    type: Number,
    min: [1, 'Depth must be at least 1'],
    max: [5, 'Depth cannot exceed 5'],
    default: 2
  }
});

/**
 * Knowledge Domain Schema
 */
const KnowledgeDomainSchema = new Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Domain name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters'],
    unique: true
  },
  
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  
  // Domain Hierarchy
  parentDomain: {
    type: Schema.Types.ObjectId,
    ref: 'KnowledgeDomain',
    default: null
  },
  
  // Prompt Engineering
  promptSegment: {
    type: String,
    required: [true, 'Prompt segment is required'],
    maxlength: [4000, 'Prompt segment cannot exceed 4000 characters']
  },
  
  // mukka_vault Integration
  vaultPath: {
    type: String,
    required: [true, 'Vault path is required'],
    validate: {
      validator: function(v) {
        return v.startsWith('/mukka_vault/');
      },
      message: props => `${props.value} is not a valid mukka_vault path`
    }
  },
  
  // Important Resources
  keyResources: [KnowledgeResourceSchema],
  
  // Key Terms and Concepts
  keyTerms: [{
    type: String,
    trim: true
  }],
  
  // Retrieval Strategy
  retrievalStrategy: RetrievalStrategySchema,
  
  // Citation and Source Handling
  citationFormat: {
    type: String,
    enum: ['standard', 'legal', 'academic', 'casual', 'none'],
    default: 'standard'
  },
  
  requireCitation: {
    type: Boolean,
    default: true
  },
  
  // Special Domain Configurations
  specialInstructions: {
    type: String,
    maxlength: [2000, 'Special instructions cannot exceed 2000 characters']
  },
  
  disclaimers: {
    type: String,
    maxlength: [1000, 'Disclaimers cannot exceed 1000 characters']
  },
  
  // Metadata
  isActive: {
    type: Boolean,
    default: true
  },
  
  tags: [{
    type: String,
    trim: true
  }],
  
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for domain's URL
KnowledgeDomainSchema.virtual('url').get(function() {
  return `/knowledge-domains/${this._id}`;
});

// Virtual for subdomains
KnowledgeDomainSchema.virtual('subdomains', {
  ref: 'KnowledgeDomain',
  localField: '_id',
  foreignField: 'parentDomain'
});

// Method to get full vault path considering parent domains
KnowledgeDomainSchema.methods.getFullVaultPath = async function() {
  let currentDomain = this;
  let paths = [currentDomain.vaultPath];
  
  // Recursively get parent domain paths
  while (currentDomain.parentDomain) {
    await currentDomain.populate('parentDomain');
    currentDomain = currentDomain.parentDomain;
    if (currentDomain) {
      paths.unshift(currentDomain.vaultPath);
    }
  }
  
  return paths;
};

// Method to get domain-specific retrieval instructions
KnowledgeDomainSchema.methods.getRetrievalInstructions = function() {
  const strategy = this.retrievalStrategy.name;
  let instructions = '';
  
  switch (strategy) {
    case 'precision_focused':
      instructions = `For queries related to ${this.name}, prioritize the most directly relevant and accurate information over broad coverage. Focus on exact matches and authoritative sources.`;
      break;
    case 'recall_focused':
      instructions = `For queries related to ${this.name}, retrieve a broad range of potentially relevant information to ensure comprehensive coverage, even if some sources are only tangentially related.`;
      break;
    case 'precedent_focused':
      instructions = `For queries related to ${this.name}, prioritize previous cases, examples, and precedents that closely match the query context.`;
      break;
    case 'regulation_focused':
      instructions = `For queries related to ${this.name}, prioritize official rules, regulations, and governance documents that provide authoritative guidance.`;
      break;
    default: // general
      instructions = `For queries related to ${this.name}, balance precision and recall to provide relevant information that addresses the query accurately and comprehensively.`;
  }
  
  return instructions;
};

// Static method to get the complete domain hierarchy
KnowledgeDomainSchema.statics.getDomainHierarchy = async function() {
  // Find all top-level domains (no parent)
  const topLevelDomains = await this.find({ parentDomain: null, isActive: true });
  
  // Recursively populate subdomains
  const populateDomains = async (domains) => {
    for (const domain of domains) {
      const subdomains = await this.find({ parentDomain: domain._id, isActive: true });
      domain.subdomains = subdomains;
      
      if (subdomains.length > 0) {
        await populateDomains(subdomains);
      }
    }
    return domains;
  };
  
  return populateDomains(topLevelDomains);
};

// Static method to search domains by term
KnowledgeDomainSchema.statics.searchByTerm = function(term) {
  return this.find({
    $or: [
      { name: { $regex: term, $options: 'i' } },
      { description: { $regex: term, $options: 'i' } },
      { keyTerms: { $in: [new RegExp(term, 'i')] } },
      { tags: { $in: [new RegExp(term, 'i')] } }
    ],
    isActive: true
  });
};

// Create model from schema
const KnowledgeDomain = mongoose.model('KnowledgeDomain', KnowledgeDomainSchema);

module.exports = KnowledgeDomain;
