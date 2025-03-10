/**
 * Personality Trait Schema
 * 
 * Defines the structure for personality traits that can be assigned to agents,
 * including prompt instructions and language patterns.
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

const PersonalityTraitSchema = new Schema({
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
  
  // Prompt Engineering
  promptSegment: {
    type: String,
    required: true,
    maxlength: 2000
  },
  
  // Examples for this personality trait
  examples: [{
    scenario: {
      type: String,
      required: true
    },
    response: {
      type: String,
      required: true
    }
  }],
  
  // Recommended LLM Parameters
  parameters: {
    temperature: {
      type: Number,
      min: 0,
      max: 2,
      default: 0.7
    },
    top_p: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.9
    },
    frequency_penalty: {
      type: Number,
      min: 0,
      max: 2,
      default: 0
    },
    presence_penalty: {
      type: Number,
      min: 0,
      max: 2,
      default: 0
    }
  },
  
  // Categorization
  category: {
    type: String,
    enum: ['communication_style', 'emotional', 'archetype'],
    required: true
  },
  
  // Compatibility with other traits
  compatibleWith: [{
    type: Schema.Types.ObjectId,
    ref: 'PersonalityTrait'
  }],
  
  // Incompatible with other traits
  incompatibleWith: [{
    type: Schema.Types.ObjectId,
    ref: 'PersonalityTrait'
  }],
  
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

// Method to check if this trait is compatible with another
PersonalityTraitSchema.methods.isCompatibleWith = function(traitId) {
  if (this.incompatibleWith && this.incompatibleWith.some(id => id.equals(traitId))) {
    return false;
  }
  return true;
};

// Create and export the model
const PersonalityTrait = mongoose.model('PersonalityTrait', PersonalityTraitSchema);
module.exports = PersonalityTrait;
