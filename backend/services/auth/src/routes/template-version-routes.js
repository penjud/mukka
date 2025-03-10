/**
 * Template Version Routes
 * Routes for agent template version management in the MCP Auth Server
 */

const express = require('express');
const templateVersionRepository = require('../../../../repositories/templateVersionRepository');

// Create router
const router = express.Router();

/**
 * Initialize function to set up the router with dependencies
 */
const initTemplateVersionRoutes = ({
  logger,
  middlewares
}) => {
  const { authenticateToken, requireAdmin } = middlewares;
  
  /**
   * GET /templates/:templateId/versions
   * Get version history for a template
   */
  router.get('/:templateId/versions', authenticateToken, async (req, res, next) => {
    try {
      const { templateId } = req.params;
      const { page = 1, limit = 10, sortBy = 'createdAt', sortDir = 'desc' } = req.query;
      
      // Convert string params to appropriate types
      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sortBy: sortBy,
        sortDir: sortDir
      };
      
      const result = await templateVersionRepository.getVersionHistory(templateId, options);
      
      res.json(result);
    } catch (error) {
      logger.error('Error getting template versions:', error);
      next(error);
    }
  });
  
  /**
   * GET /templates/:templateId/versions/:version
   * Get a specific version of a template
   */
  router.get('/:templateId/versions/:version', authenticateToken, async (req, res, next) => {
    try {
      const { templateId, version } = req.params;
      
      const templateVersion = await templateVersionRepository.getVersion(templateId, version);
      
      if (!templateVersion) {
        return res.status(404).json({
          success: false,
          errors: ['Template version not found']
        });
      }
      
      res.json({
        success: true,
        version: templateVersion
      });
    } catch (error) {
      logger.error('Error getting template version:', error);
      next(error);
    }
  });
  
  /**
   * POST /templates/:templateId/versions
   * Create a new version for a template
   */
  router.post('/:templateId/versions', authenticateToken, async (req, res, next) => {
    try {
      const { templateId } = req.params;
      const { templateData, changeDescription } = req.body;
      
      if (!changeDescription) {
        return res.status(400).json({
          success: false,
          errors: ['Change description is required']
        });
      }
      
      if (!templateData) {
        return res.status(400).json({
          success: false,
          errors: ['Template data is required']
        });
      }
      
      const result = await templateVersionRepository.createVersion(
        templateId,
        templateData,
        changeDescription,
        req.user.id
      );
      
      if (!result.success) {
        const status = result.errors.includes('Template not found') ? 404 : 
                      result.errors.includes('permission') ? 403 : 400;
                      
        return res.status(status).json({
          success: false,
          errors: result.errors
        });
      }
      
      res.status(201).json({
        success: true,
        version: result.version
      });
    } catch (error) {
      logger.error('Error creating template version:', error);
      next(error);
    }
  });
  
  /**
   * POST /templates/:templateId/rollback
   * Roll back a template to a specific version
   */
  router.post('/:templateId/rollback', authenticateToken, async (req, res, next) => {
    try {
      const { templateId } = req.params;
      const { version } = req.body;
      
      if (!version) {
        return res.status(400).json({
          success: false,
          errors: ['Version is required']
        });
      }
      
      const result = await templateVersionRepository.rollbackToVersion(
        templateId,
        version,
        req.user.id
      );
      
      if (!result.success) {
        const status = result.errors.includes('Template not found') ? 404 : 
                      result.errors.includes('permission') ? 403 : 400;
                      
        return res.status(status).json({
          success: false,
          errors: result.errors
        });
      }
      
      res.json({
        success: true,
        version: result.version
      });
    } catch (error) {
      logger.error('Error rolling back template:', error);
      next(error);
    }
  });
  
  /**
   * DELETE /templates/:templateId/versions/:version
   * Delete a specific version of a template
   */
  router.delete('/:templateId/versions/:version', authenticateToken, async (req, res, next) => {
    try {
      const { templateId, version } = req.params;
      
      const result = await templateVersionRepository.deleteVersion(
        templateId,
        version,
        req.user.id
      );
      
      if (!result.success) {
        const status = result.errors.includes('Template not found') ? 404 : 
                      result.errors.includes('permission') ? 403 : 
                      result.errors.includes('current version') ? 400 : 400;
                      
        return res.status(status).json({
          success: false,
          errors: result.errors
        });
      }
      
      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      logger.error('Error deleting template version:', error);
      next(error);
    }
  });
  
  return router;
};

module.exports = initTemplateVersionRoutes;
