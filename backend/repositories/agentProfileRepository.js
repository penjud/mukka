/**
 * Agent Profile Repository
 * 
 * Provides data access methods for agent profiles, following the repository pattern
 * to abstract database operations from the business logic.
 */

const mongoose = require('mongoose');
const AgentProfile = require('../models/AgentProfile');
const { validateAgentProfile, validateProfileDerivation } = require('../validators/agentProfileValidator');

// Try to import PersonalityTrait and KnowledgeDomain models if available
let PersonalityTrait, KnowledgeDomain;
try {
  PersonalityTrait = require('../models/PersonalityTrait');
  KnowledgeDomain = require('../models/KnowledgeDomain');
} catch (error) {
  console.log('PersonalityTrait or KnowledgeDomain models not available, some functions may be limited');
}

/**
 * Agent Profile Repository
 */
class AgentProfileRepository {
  /**
   * Create a new agent profile
   * @param {Object} profileData - The agent profile data
   * @param {String} userId - ID of the user creating the profile
   * @returns {Promise<Object>} - Created profile or error object
   */
  async createProfile(profileData, userId) {
    try {
      // Set creator ID
      profileData.accessControl = {
        ...profileData.accessControl,
        createdBy: userId
      };
      
      // Add debug logging
      console.log('Profile data for creation:', JSON.stringify(profileData, null, 2));
      
      // Validate the profile data
      const validation = await validateAgentProfile(profileData);
      if (!validation.isValid) {
        console.error('Validation errors:', validation.errors);
        return {
          success: false,
          errors: validation.errors,
          profile: null // Add explicit null profile to avoid undefined errors
        };
      }
      
      // Create and save the profile
      const profile = new AgentProfile(profileData);
      await profile.save();
      
      return {
        success: true,
        profile
      };
    } catch (error) {
      console.error('Repository create error:', error);
      return {
        success: false,
        errors: [error.message],
        profile: null // Add explicit null profile to avoid undefined errors
      };
    }
  }
  
  /**
   * Create a profile from a template
   * @param {String} templateId - ID of the template to derive from
   * @param {Object} customizations - Customizations to apply to the template
   * @param {String} userId - ID of the user creating the profile
   * @returns {Promise<Object>} - Created profile or error object
   */
  async createFromTemplate(templateId, customizations, userId) {
    try {
      console.log('Creating profile from template:', templateId);
      
      // Find the template
      const template = await AgentProfile.findById(templateId);
      if (!template) {
        console.error('Template not found:', templateId);
        return {
          success: false,
          errors: ['Template not found'],
          profile: null
        };
      }
      
      // Verify it's a template
      if (!template.templateSettings || !template.templateSettings.isTemplate) {
        console.error('Specified agent is not a template:', templateId);
        return {
          success: false,
          errors: ['Specified agent is not a template'],
          profile: null
        };
      }
      
      // Create a copy of the template
      const profileData = template.toObject();
      
      // Remove template-specific fields
      delete profileData._id;
      delete profileData.createdAt;
      delete profileData.updatedAt;
      delete profileData.__v;
      
      // Update settings for a regular agent
      profileData.templateSettings = {
        isTemplate: false,
        derivedFrom: templateId.toString() // Convert ObjectId to string
      };
      
      // Set access control
      profileData.accessControl = {
        isPublic: false,
        createdBy: userId,
        allowEditing: true
      };
      
      // Apply customizations
      if (customizations) {
        // Apply basic customizations
        if (customizations.name) profileData.name = customizations.name;
        if (customizations.description) profileData.description = customizations.description;
        if (customizations.avatar) profileData.avatar = customizations.avatar;
        
        // Apply personality customizations
        if (customizations.personalityTraits) {
          profileData.personalityTraits = customizations.personalityTraits;
        }
        if (customizations.personalityIntensity) {
          profileData.personalityIntensity = customizations.personalityIntensity;
        }
        
        // Apply knowledge domain customizations
        if (customizations.knowledgeDomains) {
          profileData.knowledgeDomains = customizations.knowledgeDomains;
        }
        
        // Apply LLM configuration customizations
        if (customizations.llmConfig) {
          profileData.llmConfig = {
            ...profileData.llmConfig,
            ...customizations.llmConfig
          };
        }
        
        // Apply tool access customizations
        if (customizations.toolAccess) {
          profileData.toolAccess = {
            ...profileData.toolAccess,
            ...customizations.toolAccess
          };
        }
        
        // Apply RAG settings customizations
        if (customizations.ragSettings) {
          profileData.ragSettings = {
            ...profileData.ragSettings,
            ...customizations.ragSettings
          };
        }
        
        // Apply system prompt customizations
        if (customizations.systemPrompt) {
          profileData.systemPrompt = customizations.systemPrompt;
        }
      }
      
      // Validate the customized profile
      const validation = await validateAgentProfile(profileData);
      if (!validation.isValid) {
        return {
          success: false,
          errors: validation.errors
        };
      }
      
      // Validate derivation compatibility
      const derivationValidation = await validateProfileDerivation(template, profileData);
      if (!derivationValidation.isValid) {
        console.error('Derivation validation failed:', derivationValidation.errors);
        return {
          success: false,
          errors: derivationValidation.errors,
          profile: null
        };
      }
      
      // Create and save the profile
      const profile = new AgentProfile(profileData);
      await profile.save();
      
      return {
        success: true,
        profile
      };
    } catch (error) {
      console.error('Error creating from template:', error);
      return {
        success: false,
        errors: [error.message],
        profile: null
      };
    }
  }
  
  /**
   * Get an agent profile by ID
   * @param {String} profileId - ID of the profile to retrieve
   * @param {Boolean} populateRefs - Whether to populate references
   * @returns {Promise<Object>} - Retrieved profile or null
   */
  async getProfileById(profileId, populateRefs = false) {
    try {
      console.log('Getting profile by ID:', profileId);
      
      if (!mongoose.Types.ObjectId.isValid(profileId)) {
        console.error('Invalid profile ID format');
        return null;
      }
      
      let query = AgentProfile.findById(profileId);
      
      if (populateRefs) {
        query = query.populate('personalityTraits')
                     .populate('knowledgeDomains.domain');
        
        // Only populate user references if User model exists
        try {
          if (mongoose.models.User) {
            query = query.populate('accessControl.createdBy', 'username email');
          }
        } catch (err) {
          console.log('User model not available for population, skipping');
        }
      }
      
      const profile = await query.exec();
      
      if (!profile) {
        console.error('Profile not found with ID:', profileId);
      }
      
      return profile;
    } catch (error) {
      console.error('Error retrieving profile:', error.message);
      return null;
    }
  }
  
  /**
   * Get agent profiles for a user
   * @param {String} userId - ID of the user
   * @param {Object} options - Query options (pagination, sorting)
   * @returns {Promise<Object>} - Retrieved profiles and count
   */
  async getProfilesByUser(userId, options = {}) {
    const { 
      page = 1, 
      limit = 10, 
      sortBy = 'createdAt', 
      sortDir = 'desc',
      includeTemplates = false
    } = options;
    
    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortDir === 'asc' ? 1 : -1 };
    
    const query = {
      'accessControl.createdBy': userId
    };
    
    // Filter templates if specified
    if (!includeTemplates) {
      query['templateSettings.isTemplate'] = false;
    }
    
    try {
      const [profiles, totalCount] = await Promise.all([
        AgentProfile.find(query)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .populate('personalityTraits', 'name description category')
          .populate('knowledgeDomains.domain', 'name description'),
        
        AgentProfile.countDocuments(query)
      ]);
      
      return {
        profiles,
        totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit)
      };
    } catch (error) {
      return {
        profiles: [],
        totalCount: 0,
        page,
        limit,
        totalPages: 0,
        error: error.message
      };
    }
  }
  
  /**
   * Get available templates
   * @param {Object} options - Query options (pagination, filtering)
   * @returns {Promise<Object>} - Retrieved templates and count
   */
  async getTemplates(options = {}) {
    const { 
      page = 1, 
      limit = 10, 
      sortBy = 'name', 
      sortDir = 'asc',
      category = null
    } = options;
    
    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortDir === 'asc' ? 1 : -1 };
    
    const query = {
      'templateSettings.isTemplate': true,
      'accessControl.isPublic': true
    };
    
    // Filter by category if specified
    if (category) {
      query['templateSettings.category'] = category;
    }
    
    try {
      const [templates, totalCount] = await Promise.all([
        AgentProfile.find(query)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .populate('personalityTraits', 'name description category')
          .populate('knowledgeDomains.domain', 'name description'),
        
        AgentProfile.countDocuments(query)
      ]);
      
      return {
        templates,
        totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit)
      };
    } catch (error) {
      return {
        templates: [],
        totalCount: 0,
        page,
        limit,
        totalPages: 0,
        error: error.message
      };
    }
  }
  
  /**
   * Update an agent profile
   * @param {String} profileId - ID of the profile to update
   * @param {Object} updates - Updates to apply
   * @param {String} userId - ID of the user making the update
   * @returns {Promise<Object>} - Updated profile or error object
   */
  async updateProfile(profileId, updates, userId) {
    try {
      // Find the profile
      const profile = await AgentProfile.findById(profileId);
      if (!profile) {
        return {
          success: false,
          errors: ['Profile not found']
        };
      }
      
      // Check permission to update
      if (!this._canModifyProfile(profile, userId)) {
        return {
          success: false,
          errors: ['You do not have permission to update this profile']
        };
      }
      
      // Check if trying to modify a template
      if (profile.templateSettings && profile.templateSettings.isTemplate && 
          String(profile.accessControl.createdBy) !== String(userId)) {
        return {
          success: false,
          errors: ['You cannot modify a template you did not create']
        };
      }
      
      // Apply updates (excluding protected fields)
      const protectedFields = [
        '_id', 
        'accessControl.createdBy', 
        'createdAt', 
        'updatedAt',
        '__v'
      ];
      
      for (const [key, value] of Object.entries(updates)) {
        if (!protectedFields.includes(key)) {
          if (key.includes('.')) {
            // Handle nested fields
            const parts = key.split('.');
            let obj = profile;
            for (let i = 0; i < parts.length - 1; i++) {
              if (!obj[parts[i]]) obj[parts[i]] = {};
              obj = obj[parts[i]];
            }
            obj[parts[parts.length - 1]] = value;
          } else {
            profile[key] = value;
          }
        }
      }
      
      // Validate the updated profile
      const validation = await validateAgentProfile(profile);
      if (!validation.isValid) {
        return {
          success: false,
          errors: validation.errors
        };
      }
      
      // Save the updated profile
      await profile.save();
      
      return {
        success: true,
        profile
      };
    } catch (error) {
      return {
        success: false,
        errors: [error.message]
      };
    }
  }
  
  /**
   * Delete an agent profile
   * @param {String} profileId - ID of the profile to delete
   * @param {String} userId - ID of the user making the deletion
   * @returns {Promise<Object>} - Success or error object
   */
  async deleteProfile(profileId, userId) {
    try {
      // Find the profile
      const profile = await AgentProfile.findById(profileId);
      if (!profile) {
        return {
          success: false,
          errors: ['Profile not found']
        };
      }
      
      // Check permission to delete
      if (!this._canModifyProfile(profile, userId)) {
        return {
          success: false,
          errors: ['You do not have permission to delete this profile']
        };
      }
      
      // Check if trying to delete a public template
      if (profile.templateSettings && profile.templateSettings.isTemplate && 
          profile.accessControl.isPublic) {
        // Only admin or template creator can delete public templates
        if (String(profile.accessControl.createdBy) !== String(userId)) {
          return {
            success: false,
            errors: ['You cannot delete a public template you did not create']
          };
        }
      }
      
      // Delete the profile
      await AgentProfile.findByIdAndDelete(profileId);
      
      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        errors: [error.message]
      };
    }
  }
  
  /**
   * Search for agent profiles
   * @param {String} searchTerm - Term to search for
   * @param {Object} options - Query options (pagination, filtering)
   * @param {String} userId - ID of the requesting user (for access control)
   * @returns {Promise<Object>} - Search results and count
   */
  async searchProfiles(searchTerm, options = {}, userId) {
    const { 
      page = 1, 
      limit = 10,
      includeTemplates = true,
      onlyTemplates = false,
      onlyPublic = true
    } = options;
    
    const skip = (page - 1) * limit;
    
    // Build search query
    const searchRegex = new RegExp(searchTerm, 'i');
    
    let query = {
      $or: [
        { name: searchRegex },
        { description: searchRegex }
      ]
    };
    
    // Filter by template status
    if (onlyTemplates) {
      query['templateSettings.isTemplate'] = true;
    } else if (!includeTemplates) {
      query['templateSettings.isTemplate'] = false;
    }
    
    // Filter by accessibility
    if (onlyPublic) {
      query['accessControl.isPublic'] = true;
    } else if (userId) {
      // Include user's own profiles and public profiles
      query = {
        $and: [
          query,
          {
            $or: [
              { 'accessControl.isPublic': true },
              { 'accessControl.createdBy': userId },
              { 'accessControl.editors': userId },
              { 'accessControl.viewers': userId }
            ]
          }
        ]
      };
    }
    
    try {
      const [profiles, totalCount] = await Promise.all([
        AgentProfile.find(query)
          .sort({ name: 1 })
          .skip(skip)
          .limit(limit)
          .populate('personalityTraits', 'name description category')
          .populate('knowledgeDomains.domain', 'name description'),
        
        AgentProfile.countDocuments(query)
      ]);
      
      return {
        profiles,
        totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit)
      };
    } catch (error) {
      return {
        profiles: [],
        totalCount: 0,
        page,
        limit,
        totalPages: 0,
        error: error.message
      };
    }
  }
  
  /**
   * Convert an agent to a template
   * @param {String} profileId - ID of the profile to convert
   * @param {Object} templateSettings - Template settings to apply
   * @param {String} userId - ID of the user making the conversion
   * @returns {Promise<Object>} - Updated profile or error object
   */
  async convertToTemplate(profileId, templateSettings, userId) {
    try {
      // Find the profile
      const profile = await AgentProfile.findById(profileId);
      if (!profile) {
        return {
          success: false,
          errors: ['Profile not found']
        };
      }
      
      // Check permission to update
      if (String(profile.accessControl.createdBy) !== String(userId)) {
        return {
          success: false,
          errors: ['Only the creator can convert an agent to a template']
        };
      }
      
      // Update template settings
      profile.templateSettings = {
        isTemplate: true,
        category: templateSettings.category || 'uncategorized',
        featured: templateSettings.featured || false,
        popularity: 0,
        version: templateSettings.version || '1.0.0'
      };
      
      // Update access control for templates
      profile.accessControl.isPublic = templateSettings.isPublic || false;
      
      // Save the updated profile
      await profile.save();
      
      return {
        success: true,
        profile
      };
    } catch (error) {
      console.error('Error converting to template:', error);
      return {
        success: false,
        errors: [error.message]
      };
    }
  }

  /**
   * Get all personality traits
   * @returns {Promise<Array>} - Array of personality traits
   */
  async getPersonalityTraits() {
    try {
      if (!PersonalityTrait) {
        console.error('PersonalityTrait model not available');
        return [];
      }
      
      const traits = await PersonalityTrait.find({ isActive: true })
        .select('_id name description category')
        .sort({ name: 1 });
      
      return traits;
    } catch (error) {
      console.error('Error fetching personality traits:', error);
      return [];
    }
  }

  /**
   * Get all knowledge domains
   * @returns {Promise<Array>} - Array of knowledge domains
   */
  async getKnowledgeDomains() {
    try {
      if (!KnowledgeDomain) {
        console.error('KnowledgeDomain model not available');
        return [];
      }
      
      const domains = await KnowledgeDomain.find({ isActive: true })
        .select('_id name description vaultPath')
        .sort({ name: 1 });
      
      return domains;
    } catch (error) {
      console.error('Error fetching knowledge domains:', error);
      return [];
    }
  }

  /**
   * Get version history for an agent
   * @param {String} profileId - ID of the agent profile
   * @returns {Promise<Array>} - Array of version history entries
   */
  async getVersionHistory(profileId) {
    try {
      // In a real implementation, this would fetch from a version history collection
      // For this example, we'll return mock data with the current version from the profile
      
      const profile = await AgentProfile.findById(profileId);
      if (!profile) {
        return [];
      }
      
      // Get current version from template settings
      const currentVersion = profile.templateSettings?.version || '1.0.0';
      
      // Mock previous versions
      const versionParts = currentVersion.split('.').map(Number);
      const versions = [
        {
          version: currentVersion,
          createdAt: profile.updatedAt || profile.createdAt,
          createdBy: profile.accessControl.createdBy,
          notes: 'Current version',
          isCurrent: true
        }
      ];
      
      // Add previous minor version if current is not 1.0.0
      if (versionParts[1] > 0 || versionParts[2] > 0) {
        const prevMinor = `${versionParts[0]}.${versionParts[1] > 0 ? versionParts[1] - 1 : 0}.0`;
        versions.push({
          version: prevMinor,
          createdAt: new Date(profile.createdAt.getTime() - 7 * 24 * 60 * 60 * 1000), // 1 week before
          createdBy: profile.accessControl.createdBy,
          notes: 'Previous minor version',
          isCurrent: false
        });
      }
      
      // Add initial version
      if (currentVersion !== '1.0.0') {
        versions.push({
          version: '1.0.0',
          createdAt: profile.createdAt,
          createdBy: profile.accessControl.createdBy,
          notes: 'Initial version',
          isCurrent: false
        });
      }
      
      return versions.sort((a, b) => {
        const aVer = a.version.split('.').map(Number);
        const bVer = b.version.split('.').map(Number);
        
        for (let i = 0; i < 3; i++) {
          if (aVer[i] !== bVer[i]) {
            return bVer[i] - aVer[i]; // Descending order
          }
        }
        
        return 0;
      });
    } catch (error) {
      console.error('Error fetching version history:', error);
      return [];
    }
  }

  /**
   * Fork an existing profile (template or agent)
   * @param {String} profileId - ID of the profile to fork
   * @param {Object} customizations - Customizations to apply
   * @param {String} userId - ID of the user making the fork
   * @returns {Promise<Object>} - Created profile or error object
   */
  async forkProfile(profileId, customizations, userId) {
    try {
      // Find the source profile
      const sourceProfile = await AgentProfile.findById(profileId);
      if (!sourceProfile) {
        return {
          success: false,
          errors: ['Profile not found'],
          profile: null
        };
      }
      
      // Check if forking is allowed
      if (!sourceProfile.templateSettings?.isTemplate && 
          !sourceProfile.accessControl.isPublic && 
          String(sourceProfile.accessControl.createdBy) !== String(userId)) {
        return {
          success: false,
          errors: ['This profile cannot be forked'],
          profile: null
        };
      }
      
      // Create a copy of the profile
      const profileData = sourceProfile.toObject();
      
      // Remove source-specific fields
      delete profileData._id;
      delete profileData.createdAt;
      delete profileData.updatedAt;
      delete profileData.__v;
      
      // Set new profile settings
      profileData.name = customizations.name || `Copy of ${sourceProfile.name}`;
      profileData.description = customizations.description || sourceProfile.description;
      profileData.templateSettings = {
        isTemplate: false,
        derivedFrom: profileId.toString(),
        version: '1.0.0'
      };
      
      // Set access control
      profileData.accessControl = {
        isPublic: false,
        createdBy: userId,
        allowEditing: true,
        editors: [],
        viewers: []
      };
      
      // Apply additional customizations
      if (customizations) {
        if (customizations.avatar) profileData.avatar = customizations.avatar;
        if (customizations.personalityTraits) profileData.personalityTraits = customizations.personalityTraits;
        if (customizations.personalityIntensity) profileData.personalityIntensity = customizations.personalityIntensity;
        if (customizations.knowledgeDomains) profileData.knowledgeDomains = customizations.knowledgeDomains;
        if (customizations.systemPrompt) profileData.systemPrompt = customizations.systemPrompt;
        
        if (customizations.llmConfig) {
          profileData.llmConfig = {
            ...profileData.llmConfig,
            ...customizations.llmConfig
          };
        }
        
        if (customizations.toolAccess) {
          profileData.toolAccess = {
            ...profileData.toolAccess,
            ...customizations.toolAccess
          };
        }
      }
      
      // Create and save the new profile
      const profile = new AgentProfile(profileData);
      await profile.save();
      
      return {
        success: true,
        profile
      };
    } catch (error) {
      console.error('Error forking profile:', error);
      return {
        success: false,
        errors: [error.message],
        profile: null
      };
    }
  }
  
  /**
   * Check if a user can modify a profile
   * @param {Object} profile - The profile to check
   * @param {String} userId - ID of the user
   * @returns {Boolean} - Whether the user can modify the profile
   * @private
   */
  _canModifyProfile(profile, userId) {
    try {
      // Creator always has permission
      if (String(profile.accessControl.createdBy) === String(userId)) {
        return true;
      }
      
      // Check if user is an editor
      if (profile.accessControl.allowEditing && 
          profile.accessControl.editors && 
          profile.accessControl.editors.some(editor => String(editor) === String(userId))) {
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error in _canModifyProfile:', error);
      return false;
    }
  }
}

module.exports = new AgentProfileRepository();
