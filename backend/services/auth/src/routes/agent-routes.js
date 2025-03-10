/**
 * Agent Routes
 * Routes for agent profile management in the MCP Auth Server
 */

const express = require('express');
const agentProfileRepository = require('../../../../repositories/agentProfileRepository');
const fs = require('fs').promises;
const path = require('path');

// Create router
const router = express.Router();

/**
 * Initialize function to set up the router with dependencies
 */
const initAgentRoutes = ({
  logger,
  middlewares
}) => {
  const { authenticateToken, requireAdmin } = middlewares;
  
  /**
   * GET /agents
   * List all available agents for the current user
   */
  router.get('/', authenticateToken, async (req, res, next) => {
    try {
      const { 
        page = 1, 
        limit = 10, 
        sortBy = 'createdAt', 
        sortDir = 'desc',
        includeTemplates = false 
      } = req.query;
      
      // Convert string params to appropriate types
      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sortBy: sortBy,
        sortDir: sortDir,
        includeTemplates: includeTemplates === 'true'
      };
      
      const result = await agentProfileRepository.getProfilesByUser(req.user.id, options);
      
      res.json(result);
    } catch (error) {
      logger.error('Error getting agents:', error);
      next(error);
    }
  });
  
  /**
   * GET /agents/:id
   * Get specific agent by ID
   */
  router.get('/:id', authenticateToken, async (req, res, next) => {
    try {
      const { id } = req.params;
      const populate = req.query.populate === 'true';
      
      const profile = await agentProfileRepository.getProfileById(id, populate);
      
      if (!profile) {
        const err = new Error('Agent profile not found');
        err.status = 404;
        return next(err);
      }
      
      // Check access permission
      if (!profile.accessControl.isPublic && 
          String(profile.accessControl.createdBy) !== String(req.user.id) &&
          !(profile.accessControl.viewers && profile.accessControl.viewers.includes(req.user.id)) &&
          !(profile.accessControl.editors && profile.accessControl.editors.includes(req.user.id))) {
        const err = new Error('You do not have permission to view this agent profile');
        err.status = 403;
        return next(err);
      }
      
      res.json(profile);
    } catch (error) {
      logger.error('Error getting agent by ID:', error);
      next(error);
    }
  });
  
  /**
   * POST /agents
   * Create new agent
   */
  router.post('/', authenticateToken, async (req, res, next) => {
    try {
      const profileData = req.body;
      
      // Validate basic required fields
      if (!profileData.name) {
        return res.status(400).json({
          success: false,
          errors: ['Agent name is required']
        });
      }
      
      const result = await agentProfileRepository.createProfile(profileData, req.user.id);
      
      if (!result.success) {
        return res.status(400).json({
          success: false,
          errors: result.errors
        });
      }
      
      res.status(201).json({
        success: true,
        profile: result.profile
      });
    } catch (error) {
      logger.error('Error creating agent:', error);
      next(error);
    }
  });
  
  /**
   * PUT /agents/:id
   * Update agent
   */
  router.put('/:id', authenticateToken, async (req, res, next) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      // Prevent updating critical fields
      delete updates._id;
      delete updates.accessControl?.createdBy;
      
      const result = await agentProfileRepository.updateProfile(id, updates, req.user.id);
      
      if (!result.success) {
        const status = result.errors.includes('Profile not found') ? 404 : 
                      result.errors.includes('You do not have permission') ? 403 : 400;
        
        return res.status(status).json({
          success: false,
          errors: result.errors
        });
      }
      
      res.json({
        success: true,
        profile: result.profile
      });
    } catch (error) {
      logger.error('Error updating agent:', error);
      next(error);
    }
  });
  
  /**
   * DELETE /agents/:id
   * Delete agent
   */
  router.delete('/:id', authenticateToken, async (req, res, next) => {
    try {
      const { id } = req.params;
      
      const result = await agentProfileRepository.deleteProfile(id, req.user.id);
      
      if (!result.success) {
        const status = result.errors.includes('Profile not found') ? 404 : 
                      result.errors.includes('You do not have permission') ? 403 : 400;
        
        return res.status(status).json({
          success: false,
          errors: result.errors
        });
      }
      
      res.json({
        success: true,
        message: 'Agent profile deleted successfully'
      });
    } catch (error) {
      logger.error('Error deleting agent:', error);
      next(error);
    }
  });
  
  /**
   * GET /agents/templates
   * Get available templates
   */
  router.get('/templates', authenticateToken, async (req, res, next) => {
    try {
      const { 
        page = 1, 
        limit = 10, 
        sortBy = 'name', 
        sortDir = 'asc',
        category = null
      } = req.query;
      
      // Convert string params to appropriate types
      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sortBy: sortBy,
        sortDir: sortDir,
        category: category
      };
      
      const result = await agentProfileRepository.getTemplates(options);
      
      res.json(result);
    } catch (error) {
      logger.error('Error getting templates:', error);
      next(error);
    }
  });
  
  /**
   * POST /agents/from-template
   * Create from template
   */
  router.post('/from-template', authenticateToken, async (req, res, next) => {
    try {
      const { templateId, customizations } = req.body;
      
      if (!templateId) {
        return res.status(400).json({
          success: false,
          errors: ['Template ID is required']
        });
      }
      
      const result = await agentProfileRepository.createFromTemplate(
        templateId, 
        customizations, 
        req.user.id
      );
      
      if (!result.success) {
        const status = result.errors.includes('Template not found') ? 404 : 400;
        
        return res.status(status).json({
          success: false,
          errors: result.errors
        });
      }
      
      res.status(201).json({
        success: true,
        profile: result.profile
      });
    } catch (error) {
      logger.error('Error creating from template:', error);
      next(error);
    }
  });
  
  /**
   * POST /agents/:id/convert-to-template
   * Convert agent to template
   */
  router.post('/:id/convert-to-template', authenticateToken, async (req, res, next) => {
    try {
      const { id } = req.params;
      const templateSettings = req.body;
      
      const result = await agentProfileRepository.convertToTemplate(id, templateSettings, req.user.id);
      
      if (!result.success) {
        const status = result.errors.includes('Profile not found') ? 404 : 
                      result.errors.includes('Only the creator') ? 403 : 400;
        
        return res.status(status).json({
          success: false,
          errors: result.errors
        });
      }
      
      res.json({
        success: true,
        profile: result.profile
      });
    } catch (error) {
      logger.error('Error converting to template:', error);
      next(error);
    }
  });
  
  /**
   * GET /agents/search
   * Search for agents
   */
  router.get('/search', authenticateToken, async (req, res, next) => {
    try {
      const { 
        q,
        page = 1, 
        limit = 10,
        includeTemplates = true,
        onlyTemplates = false,
        onlyPublic = true
      } = req.query;
      
      if (!q) {
        return res.status(400).json({
          success: false,
          errors: ['Search query is required']
        });
      }
      
      // Convert string params to appropriate types
      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        includeTemplates: includeTemplates === 'true',
        onlyTemplates: onlyTemplates === 'true',
        onlyPublic: onlyPublic === 'true'
      };
      
      const result = await agentProfileRepository.searchProfiles(q, options, req.user.id);
      
      res.json(result);
    } catch (error) {
      logger.error('Error searching agents:', error);
      next(error);
    }
  });
  
  /**
   * GET /agents/customization-flow
   * Get configuration for the customization wizard
   */
  router.get('/customization-flow', authenticateToken, async (req, res, next) => {
    try {
      // Path to configuration file
      const configPath = path.join(__dirname, '../../../../../data/customization-flow/customization-flow.json');
      
      // Try to read the configuration file
      try {
        const configData = await fs.readFile(configPath, 'utf8');
        const config = JSON.parse(configData);
        
        // Get personality traits
        const personalityTraits = await agentProfileRepository.getPersonalityTraits();
        
        // Get knowledge domains
        const knowledgeDomains = await agentProfileRepository.getKnowledgeDomains();
        
        // Enrich configuration with dynamic data
        const enrichedConfig = {
          ...config,
          personalityTraits,
          knowledgeDomains
        };
        
        res.json(enrichedConfig);
      } catch (fileError) {
        logger.error('Error reading customization flow config:', fileError);
        return res.status(500).json({ 
          success: false,
          error: 'Failed to load customization configuration'
        });
      }
    } catch (error) {
      logger.error('Error fetching customization flow:', error);
      next(error);
    }
  });
  
  /**
   * GET /agents/quick-edit-config
   * Get configuration for quick edit interface
   */
  router.get('/quick-edit-config', authenticateToken, async (req, res, next) => {
    try {
      // Path to configuration file
      const configPath = path.join(__dirname, '../../../../../data/customization-flow/quick-edit-config.json');
      
      // Try to read the configuration file
      try {
        const configData = await fs.readFile(configPath, 'utf8');
        const config = JSON.parse(configData);
        
        // Get personality traits
        const personalityTraits = await agentProfileRepository.getPersonalityTraits();
        
        // Get knowledge domains
        const knowledgeDomains = await agentProfileRepository.getKnowledgeDomains();
        
        // Enrich configuration with dynamic data
        const enrichedConfig = {
          ...config,
          personalityTraits,
          knowledgeDomains
        };
        
        res.json(enrichedConfig);
      } catch (fileError) {
        logger.error('Error reading quick edit config:', fileError);
        return res.status(500).json({ 
          success: false,
          error: 'Failed to load quick edit configuration'
        });
      }
    } catch (error) {
      logger.error('Error fetching quick edit config:', error);
      next(error);
    }
  });
  
  /**
   * GET /agents/template-forking-config
   * Get configuration for template forking interface
   */
  router.get('/template-forking-config', authenticateToken, async (req, res, next) => {
    try {
      // Path to configuration file
      const configPath = path.join(__dirname, '../../../../../data/customization-flow/template-forking-config.json');
      
      // Try to read the configuration file
      try {
        const configData = await fs.readFile(configPath, 'utf8');
        const config = JSON.parse(configData);
        
        // Get personality traits
        const personalityTraits = await agentProfileRepository.getPersonalityTraits();
        
        // Get knowledge domains
        const knowledgeDomains = await agentProfileRepository.getKnowledgeDomains();
        
        // Enrich configuration with dynamic data
        const enrichedConfig = {
          ...config,
          personalityTraits,
          knowledgeDomains
        };
        
        res.json(enrichedConfig);
      } catch (fileError) {
        logger.error('Error reading template forking config:', fileError);
        return res.status(500).json({ 
          success: false,
          error: 'Failed to load template forking configuration'
        });
      }
    } catch (error) {
      logger.error('Error fetching template forking config:', error);
      next(error);
    }
  });

  /**
   * GET /agents/versions/:id
   * Get version history for an agent
   */
  router.get('/versions/:id', authenticateToken, async (req, res, next) => {
    try {
      const { id } = req.params;
      
      // Check if the agent exists
      const agent = await agentProfileRepository.getProfileById(id);
      
      if (!agent) {
        return res.status(404).json({
          success: false,
          error: 'Agent profile not found'
        });
      }
      
      // Check permissions
      if (!agent.accessControl.isPublic && 
          String(agent.accessControl.createdBy) !== String(req.user.id) &&
          !(agent.accessControl.viewers && agent.accessControl.viewers.includes(req.user.id)) &&
          !(agent.accessControl.editors && agent.accessControl.editors.includes(req.user.id))) {
        return res.status(403).json({
          success: false,
          error: 'You do not have permission to view this agent profile'
        });
      }
      
      // Get version history
      const versions = await agentProfileRepository.getVersionHistory(id);
      
      res.json({
        success: true,
        versions
      });
    } catch (error) {
      logger.error('Error fetching agent versions:', error);
      next(error);
    }
  });
  
  /**
   * POST /agents/:id/fork
   * Fork an existing agent template
   */
  router.post('/:id/fork', authenticateToken, async (req, res, next) => {
    try {
      const { id } = req.params;
      const customizations = req.body;
      
      // Get the source template
      const sourceTemplate = await agentProfileRepository.getProfileById(id);
      
      if (!sourceTemplate) {
        return res.status(404).json({
          success: false,
          errors: ['Template not found']
        });
      }
      
      // Check if it's a template or if forking is allowed
      if (!sourceTemplate.templateSettings?.isTemplate && 
          !sourceTemplate.accessControl.isPublic) {
        return res.status(403).json({
          success: false,
          errors: ['This profile cannot be forked']
        });
      }
      
      // Create a new agent based on the template
      const result = await agentProfileRepository.forkProfile(id, customizations, req.user.id);
      
      if (!result.success) {
        return res.status(400).json({
          success: false,
          errors: result.errors
        });
      }
      
      res.status(201).json({
        success: true,
        profile: result.profile
      });
    } catch (error) {
      logger.error('Error forking agent:', error);
      next(error);
    }
  });
  
  return router;
};

module.exports = initAgentRoutes;
