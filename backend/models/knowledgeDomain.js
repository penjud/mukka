/**
 * Knowledge Domain Schema
 * 
 * Defines the structure for knowledge domains that can be assigned to agents,
 * including the mapping to mukka_vault paths and related information.
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

const KnowledgeDomainSchema = new Schema({
  // Basic Information
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  
  // Domain hierarchy
  parentDomain: {
    type: Schema.Types.ObjectId,
    ref: 'KnowledgeDomain',
    default: null
  },
  subdomains: [{
    type: Schema.Types.ObjectId,
    ref: 'KnowledgeDomain'
  }],
  
  // Prompt Engineering
  promptSegment: {
    type: String,
    required: true,
    maxlength: 2000
  },
  
  // mukka_vault integration
  vaultPath: {
    type: String,
    required: true
  },
  
  // Key terms and concepts related to this domain
  keyTerms: [{
    type: String
  }],
  
  // Retrieval strategy settings
  retrievalStrategy: {
    type: String,
    enum: ['general', 'precision_focused', 'recall_focused', 'precedent_focused', 'regulation_focused'],
    default: 'general'
  },
  
  // Source priority (1-10)
  sourcePriority: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  
  // Citation format
  citationFormat: {
    type: String,
    enum: ['standard', 'legal', 'academic', 'casual', 'none'],
    default: 'standard'
  },
  
  // Metadata
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Virtual for domain's full path
KnowledgeDomainSchema.virtual('fullPath').get(function() {
  return `/domains/${this._id}`;
});

// Static method to get full domain hierarchy
KnowledgeDomainSchema.statics.getDomainHierarchy = async function() {
  // Find all top-level domains (no parent)
  const topLevelDomains = await this.find({ parentDomain: null }).populate('subdomains');
  
  // Recursively populate subdomains
  const populateSubdomains = async (domains) => {
    for (let domain of domains) {
      if (domain.subdomains && domain.subdomains.length > 0) {
        await domain.populate('subdomains');
        await populateSubdomains(domain.subdomains);
      }
    }
    return domains;
  };
  
  return populateSubdomains(topLevelDomains);
};

// Create and export the model
const KnowledgeDomain = mongoose.model('KnowledgeDomain', KnowledgeDomainSchema);
module.exports = KnowledgeDomain;
