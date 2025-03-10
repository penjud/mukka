/**
 * Agent Profile Validator
 * 
 * Validates agent profiles before creation or update to ensure data integrity,
 * compatibility between components, and proper configuration.
 */

const AgentProfile = require('../models/AgentProfile');
const PersonalityTrait = require('../models/PersonalityTrait');
const KnowledgeDomain = require('../models/KnowledgeDomain');
const mongoose = require('mongoose');

/**
 * Validates an agent profile before saving
 * @param {Object} profileData - The agent profile data to validate
 * @returns {Object} - Object containing validation result and any errors
 */
async function validateAgentProfile(profileData) {
  const errors = [];
  
  try {
    // Basic validation
    if (!profileData.name || profileData.name.trim().length < 2) {
      errors.push('Agent name must be at least 2 characters');
    }
    
    if (!profileData.description || profileData.description.trim().length < 10) {
      errors.push('Agent description must be at least 10 characters');
    }
    
    if (!profileData.systemPrompt || profileData.systemPrompt.trim().length < 50) {
      errors.push('System prompt must be at least 50 characters');
    }
    
    // Validate personality traits
    if (profileData.personalityTraits && profileData.personalityTraits.length > 0) {
      // Check that all personality traits exist
      for (const traitId of profileData.personalityTraits) {
        if (!mongoose.Types.ObjectId.isValid(traitId)) {
          errors.push(`Invalid personality trait ID: ${traitId}`);
          continue;
        }
        
        const trait = await PersonalityTrait.findById(traitId);
        if (!trait) {
          errors.push(`Personality trait not found: ${traitId}`);
        } else if (!trait.isActive) {
          errors.push(`Personality trait is inactive: ${trait.name}`);
        }
      }
      
      // Check for personality trait compatibility
      if (profileData.personalityTraits.length > 1) {
        const traits = await PersonalityTrait.find({
          _id: { $in: profileData.personalityTraits }
        });
        
        // Check each trait against all others for compatibility
        for (let i = 0; i < traits.length; i++) {
          for (let j = i + 1; j < traits.length; j++) {
            const trait1 = traits[i];
            const trait2 = traits[j];
            
            if (trait1.incompatibleWith && trait1.incompatibleWith.some(id => id.equals(trait2._id))) {
              errors.push(`Personality traits are incompatible: ${trait1.name} and ${trait2.name}`);
            }
          }
        }
      }
    }
    
    // Validate knowledge domains
    if (profileData.knowledgeDomains && profileData.knowledgeDomains.length > 0) {
      let hasPrimary = false;
      
      for (const domainObj of profileData.knowledgeDomains) {
        // Check valid domain ID
        if (!mongoose.Types.ObjectId.isValid(domainObj.domain)) {
          errors.push(`Invalid knowledge domain ID: ${domainObj.domain}`);
          continue;
        }
        
        // Check domain exists
        const domain = await KnowledgeDomain.findById(domainObj.domain);
        if (!domain) {
          errors.push(`Knowledge domain not found: ${domainObj.domain}`);
        } else if (!domain.isActive) {
          errors.push(`Knowledge domain is inactive: ${domain.name}`);
        }
        
        // Check expertise level
        if (domainObj.expertiseLevel < 1 || domainObj.expertiseLevel > 5) {
          errors.push(`Expertise level must be between 1 and 5 for domain: ${domain ? domain.name : domainObj.domain}`);
        }
        
        // Track if at least one primary domain is defined
        if (domainObj.isPrimary) {
          hasPrimary = true;
        }
      }
      
      // Ensure at least one domain is primary
      if (!hasPrimary && profileData.knowledgeDomains.length > 0) {
        errors.push('At least one knowledge domain must be marked as primary');
      }
    }
    
    // Validate tool access
    if (profileData.toolAccess) {
      // Validate filesystem paths if enabled
      if (profileData.toolAccess.filesystem && profileData.toolAccess.filesystem.enabled) {
        const paths = profileData.toolAccess.filesystem.paths;
        if (!paths || paths.length === 0) {
          errors.push('At least one filesystem path must be specified if filesystem access is enabled');
        } else {
          for (const path of paths) {
            if (!path.startsWith('/mukka_vault/')) {
              errors.push(`Invalid mukka_vault path: ${path}`);
            }
          }
        }
      }
      
      // Validate brave search settings if enabled
      if (profileData.toolAccess.braveSearch && profileData.toolAccess.braveSearch.enabled) {
        const maxResults = profileData.toolAccess.braveSearch.maxResults;
        if (maxResults && (maxResults < 1 || maxResults > 20)) {
          errors.push('Brave Search max results must be between 1 and 20');
        }
      }
    }
    
    // Validate RAG settings
    if (profileData.ragSettings && profileData.ragSettings.enabled) {
      const maxSources = profileData.ragSettings.maxSources;
      if (maxSources && (maxSources < 1 || maxSources > 10)) {
        errors.push('RAG max sources must be between 1 and 10');
      }
      
      const relevanceThreshold = profileData.ragSettings.relevanceThreshold;
      if (relevanceThreshold && (relevanceThreshold < 0 || relevanceThreshold > 1)) {
        errors.push('RAG relevance threshold must be between 0 and 1');
      }
      
      // Validate vault paths
      if (profileData.ragSettings.vaultPaths) {
        for (const path of profileData.ragSettings.vaultPaths) {
          if (!path.startsWith('/mukka_vault/')) {
            errors.push(`Invalid mukka_vault path: ${path}`);
          }
        }
      }
    }
    
    // Validate LLM config
    if (profileData.llmConfig) {
      // Validate temperature
      if (profileData.llmConfig.temperature < 0 || profileData.llmConfig.temperature > 2) {
        errors.push('LLM temperature must be between 0 and 2');
      }
      
      // Validate top_p
      if (profileData.llmConfig.topP < 0 || profileData.llmConfig.topP > 1) {
        errors.push('LLM topP must be between 0 and 1');
      }
      
      // Validate max tokens
      if (profileData.llmConfig.maxTokens < 100 || profileData.llmConfig.maxTokens > 100000) {
        errors.push('LLM maxTokens must be between 100 and 100000');
      }
      
      // Validate context window size
      if (profileData.llmConfig.contextWindowSize < 1024 || profileData.llmConfig.contextWindowSize > 100000) {
        errors.push('LLM context window size must be between 1024 and 100000');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  } catch (error) {
    return {
      isValid: false,
      errors: [`Validation error: ${error.message}`, ...errors]
    };
  }
}

/**
 * Checks if one agent profile is derivable from another (for templates)
 * @param {Object} sourceProfile - The source profile to derive from
 * @param {Object} targetProfile - The target profile to check
 * @returns {Object} - Object containing validation result and any errors
 */
async function validateProfileDerivation(sourceProfile, targetProfile) {
  const errors = [];
  
  try {
    // If source is not a template, fail
    if (!sourceProfile.templateSettings || !sourceProfile.templateSettings.isTemplate) {
      errors.push('Source profile is not a template');
      return { isValid: false, errors };
    }
    
    // Check personality trait compatibility
    // If target has traits not in source, check compatibility
    if (targetProfile.personalityTraits) {
      const extraTraits = targetProfile.personalityTraits.filter(
        traitId => !sourceProfile.personalityTraits.includes(traitId)
      );
      
      if (extraTraits.length > 0) {
        const traits = await PersonalityTrait.find({
          _id: { $in: [...extraTraits, ...sourceProfile.personalityTraits] }
        });
        
        // Check each new trait against source traits for compatibility
        for (const extraTraitId of extraTraits) {
          const extraTrait = traits.find(t => t._id.equals(extraTraitId));
          if (!extraTrait) continue;
          
          for (const sourceTrait of traits.filter(t => 
            sourceProfile.personalityTraits.some(id => id.equals(t._id))
          )) {
            if (extraTrait.incompatibleWith && 
                extraTrait.incompatibleWith.some(id => id.equals(sourceTrait._id))) {
              errors.push(`Added personality trait ${extraTrait.name} is incompatible with template trait ${sourceTrait.name}`);
            }
          }
        }
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  } catch (error) {
    return {
      isValid: false,
      errors: [`Derivation validation error: ${error.message}`, ...errors]
    };
  }
}

module.exports = {
  validateAgentProfile,
  validateProfileDerivation
};
