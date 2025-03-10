/**
 * PersonalityTrait Model
 * 
 * Defines personality traits that can be assigned to agents, including 
 * prompt instructions, examples, and language patterns.
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Example Schema
 * Represents an example of this personality trait in action
 */
const ExampleSchema = new Schema({
  scenario: {
    type: String,
    required: [true, 'Scenario is required'],
    trim: true
  },
  response: {
    type: String,
    required: [true, 'Response is required'],
    trim: true
  }
});

/**
 * Language Pattern Schema
 * Defines specific language patterns associated with this trait
 */
const LanguagePatternSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Pattern name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  examples: [String],
  frequency: {
    type: String,
    enum: ['rare', 'occasional', 'frequent', 'very_frequent'],
    default: 'occasional'
  }
});

/**
 * Parameter Recommendations Schema
 * Defines LLM parameter recommendations for this trait
 */
const ParameterRecommendationSchema = new Schema({
  temperature: {
    type: Number,
    min: [0, 'Temperature must be at least 0'],
    max: [2, 'Temperature cannot exceed 2'],
    default: 0.7
  },
  top_p: {
    type: Number,
    min: [0, 'Top P must be at least 0'],
    max: [1, 'Top P cannot exceed 1'],
    default: 0.9
  },
  frequency_penalty: {
    type: Number,
    min: [0, 'Frequency penalty must be at least 0'],
    max: [2, 'Frequency penalty cannot exceed 2'],
    default: 0
  },
  presence_penalty: {
    type: Number,
    min: [0, 'Presence penalty must be at least 0'],
    max: [2, 'Presence penalty cannot exceed 2'],
    default: 0
  }
});

/**
 * Personality Trait Schema
 */
const PersonalityTraitSchema = new Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Trait name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters'],
    unique: true
  },
  
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  
  shortDescription: {
    type: String,
    trim: true,
    maxlength: [100, 'Short description cannot exceed 100 characters']
  },
  
  // Categorization
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'communication_style',  // How the agent communicates (formal, casual, technical, etc.)
      'emotional',            // Emotional characteristics (enthusiastic, reserved, empathetic, etc.)
      'personality_archetype' // Character archetypes (scholar, coach, bogan, mentor, etc.)
    ],
    default: 'communication_style'
  },
  
  // Prompt Engineering
  promptSegment: {
    type: String,
    required: [true, 'Prompt segment is required'],
    maxlength: [4000, 'Prompt segment cannot exceed 4000 characters']
  },
  
  // Examples
  examples: [ExampleSchema],
  
  // Language Patterns
  languagePatterns: [LanguagePatternSchema],
  
  // Parameter Recommendations
  parameters: ParameterRecommendationSchema,
  
  // Compatibility
  compatibleWith: [{
    type: Schema.Types.ObjectId,
    ref: 'PersonalityTrait'
  }],
  
  incompatibleWith: [{
    type: Schema.Types.ObjectId,
    ref: 'PersonalityTrait'
  }],
  
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

// Virtual for trait's URL
PersonalityTraitSchema.virtual('url').get(function() {
  return `/personality-traits/${this._id}`;
});

// Method to check compatibility with another trait
PersonalityTraitSchema.methods.isCompatibleWith = function(traitId) {
  // If explicitly listed as incompatible, return false
  if (this.incompatibleWith && this.incompatibleWith.some(id => id.equals(traitId))) {
    return false;
  }
  
  // If explicitly listed as compatible, return true
  if (this.compatibleWith && this.compatibleWith.some(id => id.equals(traitId))) {
    return true;
  }
  
  // If not explicitly listed either way, assume compatible
  return true;
};

// Static method to get all traits by category
PersonalityTraitSchema.statics.getByCategory = function(category) {
  return this.find({ category, isActive: true }).sort('name');
};

// Create model from schema
const PersonalityTrait = mongoose.model('PersonalityTrait', PersonalityTraitSchema);

module.exports = PersonalityTrait;
