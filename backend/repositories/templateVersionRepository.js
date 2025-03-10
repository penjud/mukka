/**
 * Template Version Repository
 * 
 * Provides data access methods for agent template versions, following the repository pattern
 * to abstract database operations from the business logic.
 */

const mongoose = require('mongoose');
const TemplateVersion = require('../models/TemplateVersion');
const AgentProfile = require('../models/AgentProfile');
const semver = require('semver');

/**
 * Template Version Repository
 */
class TemplateVersionRepository {
  /**
   * Create a new template version
   * @param {String} templateId - ID of the template
   * @param {Object} templateData - The complete template data
   * @param {String} changeDescription - Description of the changes
   * @param {String} userId - ID of the user creating the version
   * @returns {Promise<Object>} - Created version or error object
   */
  async createVersion(templateId, templateData, changeDescription, userId) {
    try {
      console.log(`Creating version for template: ${templateId}`);
      
      // Find the template
      const template = await AgentProfile.findById(templateId);
      if (!template) {
        console.error('Template not found:', templateId);
        return {
          success: false,
          errors: ['Template not found'],
          version: null
        };
      }
      
      // Verify it's a template
      if (!template.templateSettings || !template.templateSettings.isTemplate) {
        console.error('Specified agent is not a template:', templateId);
        return {
          success: false,
          errors: ['Specified agent is not a template'],
          version: null
        };
      }
      
      // Check permission
      if (String(template.accessControl.createdBy) !== String(userId)) {
        console.error('User does not have permission to version this template');
        return {
          success: false,
          errors: ['You do not have permission to create a version for this template'],
          version: null
        };
      }
      
      // Generate new version number
      const newVersion = this._generateNewVersionNumber(template.templateSettings.version);
      console.log(`Generated new version: ${newVersion} (from ${template.templateSettings.version})`);
      
      // Update all existing versions to not be current
      await TemplateVersion.updateMany(
        { templateId: templateId },
        { isCurrent: false }
      );
      
      // Create version record
      const versionData = {
        templateId,
        version: newVersion,
        templateData,
        changeDescription,
        changedBy: userId,
        isCurrent: true
      };
      
      const version = new TemplateVersion(versionData);
      await version.save();
      
      // Update the template's version number
      template.templateSettings.version = newVersion;
      await template.save();
      
      return {
        success: true,
        version
      };
    } catch (error) {
      console.error('Error creating version:', error);
      return {
        success: false,
        errors: [error.message],
        version: null
      };
    }
  }
  
  /**
   * Get version history for a template
   * @param {String} templateId - ID of the template
   * @param {Object} options - Query options (pagination, sorting)
   * @returns {Promise<Object>} - Version history and count
   */
  async getVersionHistory(templateId, options = {}) {
    const { 
      page = 1, 
      limit = 10, 
      sortBy = 'createdAt', 
      sortDir = 'desc'
    } = options;
    
    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortDir === 'asc' ? 1 : -1 };
    
    try {
      const [versions, totalCount] = await Promise.all([
        TemplateVersion.find({ templateId })
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .populate('changedBy', 'username email'),
        
        TemplateVersion.countDocuments({ templateId })
      ]);
      
      return {
        versions,
        totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit)
      };
    } catch (error) {
      console.error('Error getting version history:', error);
      return {
        versions: [],
        totalCount: 0,
        page,
        limit,
        totalPages: 0,
        error: error.message
      };
    }
  }
  
  /**
   * Get a specific version of a template
   * @param {String} templateId - ID of the template
   * @param {String} version - Version to retrieve
   * @returns {Promise<Object>} - Template version or null
   */
  async getVersion(templateId, version) {
    try {
      const templateVersion = await TemplateVersion.findOne({
        templateId,
        version
      }).populate('changedBy', 'username email');
      
      return templateVersion;
    } catch (error) {
      console.error('Error getting template version:', error);
      return null;
    }
  }
  
  /**
   * Roll back template to a specific version
   * @param {String} templateId - ID of the template
   * @param {String} version - Version to roll back to
   * @param {String} userId - ID of the user performing the rollback
   * @returns {Promise<Object>} - Success or error object
   */
  async rollbackToVersion(templateId, version, userId) {
    try {
      console.log(`Rolling back template ${templateId} to version ${version}`);
      
      // Find the template
      const template = await AgentProfile.findById(templateId);
      if (!template) {
        console.error('Template not found:', templateId);
        return {
          success: false,
          errors: ['Template not found']
        };
      }
      
      // Verify it's a template
      if (!template.templateSettings || !template.templateSettings.isTemplate) {
        console.error('Specified agent is not a template:', templateId);
        return {
          success: false,
          errors: ['Specified agent is not a template']
        };
      }
      
      // Check permission
      if (String(template.accessControl.createdBy) !== String(userId)) {
        console.error('User does not have permission to roll back this template');
        return {
          success: false,
          errors: ['You do not have permission to roll back this template']
        };
      }
      
      // Find the version to roll back to
      const targetVersion = await TemplateVersion.findOne({
        templateId,
        version
      });
      
      if (!targetVersion) {
        console.error('Target version not found:', version);
        return {
          success: false,
          errors: ['Target version not found']
        };
      }
      
      // Create a new version that copies the data from the target version
      return this.createVersion(
        templateId,
        targetVersion.templateData,
        `Rolled back to version ${version}`,
        userId
      );
    } catch (error) {
      console.error('Error rolling back template:', error);
      return {
        success: false,
        errors: [error.message]
      };
    }
  }
  
  /**
   * Delete a template version (only if not current)
   * @param {String} templateId - ID of the template
   * @param {String} version - Version to delete
   * @param {String} userId - ID of the user performing the deletion
   * @returns {Promise<Object>} - Success or error object
   */
  async deleteVersion(templateId, version, userId) {
    try {
      console.log(`Deleting version ${version} of template ${templateId}`);
      
      // Find the template
      const template = await AgentProfile.findById(templateId);
      if (!template) {
        console.error('Template not found:', templateId);
        return {
          success: false,
          errors: ['Template not found']
        };
      }
      
      // Verify it's a template
      if (!template.templateSettings || !template.templateSettings.isTemplate) {
        console.error('Specified agent is not a template:', templateId);
        return {
          success: false,
          errors: ['Specified agent is not a template']
        };
      }
      
      // Check permission
      if (String(template.accessControl.createdBy) !== String(userId)) {
        console.error('User does not have permission to delete versions of this template');
        return {
          success: false,
          errors: ['You do not have permission to delete versions of this template']
        };
      }
      
      // Find the version to delete
      const targetVersion = await TemplateVersion.findOne({
        templateId,
        version
      });
      
      if (!targetVersion) {
        console.error('Target version not found:', version);
        return {
          success: false,
          errors: ['Target version not found']
        };
      }
      
      // Cannot delete the current version
      if (targetVersion.isCurrent) {
        console.error('Cannot delete the current version');
        return {
          success: false,
          errors: ['Cannot delete the current version of a template']
        };
      }
      
      // Delete the version
      await TemplateVersion.deleteOne({
        templateId,
        version
      });
      
      return {
        success: true,
        message: `Version ${version} deleted successfully`
      };
    } catch (error) {
      console.error('Error deleting version:', error);
      return {
        success: false,
        errors: [error.message]
      };
    }
  }
  
  /**
   * Generate a new version number based on the current version
   * @param {String} currentVersion - Current version number
   * @returns {String} - New version number
   * @private
   */
  _generateNewVersionNumber(currentVersion) {
    // Use semver for proper versioning
    if (!currentVersion || !semver.valid(currentVersion)) {
      return '1.0.0';
    }
    
    // Increment patch version by default
    return semver.inc(currentVersion, 'patch');
  }
}

module.exports = new TemplateVersionRepository();
