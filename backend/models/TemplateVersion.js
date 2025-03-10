/**
 * TemplateVersion Model
 * 
 * Defines the schema for MukkaAI agent template versions, providing version control
 * and history tracking for agent templates.
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Template Version Schema
 * 
 * Stores historical versions of agent templates for version control and rollback capabilities.
 */
const TemplateVersionSchema = new Schema({
  // Reference to the template
  templateId: {
    type: Schema.Types.ObjectId,
    ref: 'AgentProfile',
    required: true
  },
  
  // Version information
  version: {
    type: String,
    required: true,
    match: [/^\d+\.\d+\.\d+$/, 'Version must be in semver format (e.g., 1.0.0)']
  },
  
  // Full snapshot of the template at this version
  templateData: {
    type: Schema.Types.Mixed,
    required: true
  },
  
  // Change information
  changeDescription: {
    type: String,
    required: true
  },
  
  // Who made the change
  changedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Is this the current version?
  isCurrent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Compound index for better query performance
TemplateVersionSchema.index({ templateId: 1, version: 1 }, { unique: true });
TemplateVersionSchema.index({ templateId: 1, isCurrent: 1 });

// Create model from schema
const TemplateVersion = mongoose.model('TemplateVersion', TemplateVersionSchema);

module.exports = TemplateVersion;
