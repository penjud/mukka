/**
 * Test script for Agent Customization API endpoints
 * 
 * This script tests the API endpoints for the agent customization UI
 * including the customization flow, quick edit, and template forking configurations.
 */

const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

// Auth server URL
const AUTH_SERVER_URL = process.env.AUTH_SERVER_URL || 'http://localhost:8097';

// Test credentials
const TEST_CREDENTIALS = {
  username: process.env.TEST_USERNAME || 'admin',
  password: process.env.TEST_PASSWORD || 'admin123'
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Helper function to authenticate and get token
async function authenticate() {
  try {
    console.log(`${colors.blue}Authenticating with test credentials...${colors.reset}`);
    
    const response = await axios.post(`${AUTH_SERVER_URL}/auth/login`, TEST_CREDENTIALS);
    
    if (response.data && response.data.token) {
      console.log(`${colors.green}✓ Authentication successful${colors.reset}`);
      return response.data.token;
    } else {
      console.log(`${colors.red}✗ Authentication failed: No token received${colors.reset}`);
      return null;
    }
  } catch (error) {
    console.error(`${colors.red}✗ Authentication failed:${colors.reset}`, error.response?.data || error.message);
    return null;
  }
}

// Test customization flow API
async function testCustomizationFlowAPI(token) {
  try {
    console.log(`\n${colors.cyan}${colors.bright}Testing Customization Flow API${colors.reset}`);
    
    const response = await axios.get(
      `${AUTH_SERVER_URL}/agents/customization-flow`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    if (response.data) {
      console.log(`${colors.green}✓ Received customization flow configuration${colors.reset}`);
      console.log(`${colors.dim}Configuration has ${response.data.steps?.length || 0} steps${colors.reset}`);
      
      if (response.data.personalityTraits) {
        console.log(`${colors.green}✓ Received ${response.data.personalityTraits.length} personality traits${colors.reset}`);
      } else {
        console.log(`${colors.yellow}⚠ No personality traits received${colors.reset}`);
      }
      
      if (response.data.knowledgeDomains) {
        console.log(`${colors.green}✓ Received ${response.data.knowledgeDomains.length} knowledge domains${colors.reset}`);
      } else {
        console.log(`${colors.yellow}⚠ No knowledge domains received${colors.reset}`);
      }
      
      return true;
    } else {
      console.log(`${colors.red}✗ No data received from customization flow API${colors.reset}`);
      return false;
    }
  } catch (error) {
    console.error(`${colors.red}✗ Customization flow API test failed:${colors.reset}`, error.response?.data || error.message);
    return false;
  }
}

// Test quick edit config API
async function testQuickEditConfigAPI(token) {
  try {
    console.log(`\n${colors.cyan}${colors.bright}Testing Quick Edit Config API${colors.reset}`);
    
    const response = await axios.get(
      `${AUTH_SERVER_URL}/agents/quick-edit-config`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    if (response.data) {
      console.log(`${colors.green}✓ Received quick edit configuration${colors.reset}`);
      console.log(`${colors.dim}Configuration has ${response.data.sections?.length || 0} sections${colors.reset}`);
      
      if (response.data.personalityTraits) {
        console.log(`${colors.green}✓ Received ${response.data.personalityTraits.length} personality traits${colors.reset}`);
      } else {
        console.log(`${colors.yellow}⚠ No personality traits received${colors.reset}`);
      }
      
      if (response.data.knowledgeDomains) {
        console.log(`${colors.green}✓ Received ${response.data.knowledgeDomains.length} knowledge domains${colors.reset}`);
      } else {
        console.log(`${colors.yellow}⚠ No knowledge domains received${colors.reset}`);
      }
      
      return true;
    } else {
      console.log(`${colors.red}✗ No data received from quick edit config API${colors.reset}`);
      return false;
    }
  } catch (error) {
    console.error(`${colors.red}✗ Quick edit config API test failed:${colors.reset}`, error.response?.data || error.message);
    return false;
  }
}

// Test template forking config API
async function testTemplateForkingConfigAPI(token) {
  try {
    console.log(`\n${colors.cyan}${colors.bright}Testing Template Forking Config API${colors.reset}`);
    
    const response = await axios.get(
      `${AUTH_SERVER_URL}/agents/template-forking-config`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    if (response.data) {
      console.log(`${colors.green}✓ Received template forking configuration${colors.reset}`);
      console.log(`${colors.dim}Configuration has ${response.data.sections?.length || 0} sections${colors.reset}`);
      
      if (response.data.personalityTraits) {
        console.log(`${colors.green}✓ Received ${response.data.personalityTraits.length} personality traits${colors.reset}`);
      } else {
        console.log(`${colors.yellow}⚠ No personality traits received${colors.reset}`);
      }
      
      if (response.data.knowledgeDomains) {
        console.log(`${colors.green}✓ Received ${response.data.knowledgeDomains.length} knowledge domains${colors.reset}`);
      } else {
        console.log(`${colors.yellow}⚠ No knowledge domains received${colors.reset}`);
      }
      
      return true;
    } else {
      console.log(`${colors.red}✗ No data received from template forking config API${colors.reset}`);
      return false;
    }
  } catch (error) {
    console.error(`${colors.red}✗ Template forking config API test failed:${colors.reset}`, error.response?.data || error.message);
    return false;
  }
}

// Test getting version history
async function testVersionHistoryAPI(token) {
  try {
    console.log(`\n${colors.cyan}${colors.bright}Testing Version History API${colors.reset}`);
    
    // First, get a list of templates
    const templatesResponse = await axios.get(
      `${AUTH_SERVER_URL}/agents/templates`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    if (!templatesResponse.data.templates || templatesResponse.data.templates.length === 0) {
      console.log(`${colors.yellow}⚠ No templates found to test version history${colors.reset}`);
      return false;
    }
    
    // Get the first template ID
    const templateId = templatesResponse.data.templates[0]._id;
    console.log(`${colors.blue}Using template ID: ${templateId}${colors.reset}`);
    
    // Get version history for this template
    const historyResponse = await axios.get(
      `${AUTH_SERVER_URL}/agents/versions/${templateId}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    if (historyResponse.data && historyResponse.data.versions) {
      console.log(`${colors.green}✓ Received version history with ${historyResponse.data.versions.length} versions${colors.reset}`);
      return true;
    } else {
      console.log(`${colors.red}✗ No version history received${colors.reset}`);
      return false;
    }
  } catch (error) {
    console.error(`${colors.red}✗ Version history API test failed:${colors.reset}`, error.response?.data || error.message);
    return false;
  }
}

// Test forking a template
async function testTemplateForkingAPI(token) {
  try {
    console.log(`\n${colors.cyan}${colors.bright}Testing Template Forking API${colors.reset}`);
    
    // First, get a list of templates
    const templatesResponse = await axios.get(
      `${AUTH_SERVER_URL}/agents/templates`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    if (!templatesResponse.data.templates || templatesResponse.data.templates.length === 0) {
      console.log(`${colors.yellow}⚠ No templates found to test forking${colors.reset}`);
      return false;
    }
    
    // Get the first template ID
    const templateId = templatesResponse.data.templates[0]._id;
    console.log(`${colors.blue}Using template ID: ${templateId}${colors.reset}`);
    
    // Fork the template
    const forkResponse = await axios.post(
      `${AUTH_SERVER_URL}/agents/${templateId}/fork`,
      {
        name: `Test Fork ${new Date().toISOString()}`,
        description: 'Test fork created by integration test script'
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    if (forkResponse.data && forkResponse.data.success) {
      console.log(`${colors.green}✓ Successfully forked template${colors.reset}`);
      console.log(`${colors.dim}Created agent: ${forkResponse.data.profile.name} (${forkResponse.data.profile._id})${colors.reset}`);
      return true;
    } else {
      console.log(`${colors.red}✗ Failed to fork template${colors.reset}`);
      return false;
    }
  } catch (error) {
    console.error(`${colors.red}✗ Template forking API test failed:${colors.reset}`, error.response?.data || error.message);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log(`${colors.bright}${colors.cyan}=== Agent Customization API Integration Tests ===${colors.reset}\n`);
  
  // Authenticate
  const token = await authenticate();
  if (!token) {
    console.log(`${colors.red}${colors.bright}Cannot proceed with tests due to authentication failure${colors.reset}`);
    return;
  }
  
  // Run tests
  const results = {
    customizationFlow: await testCustomizationFlowAPI(token),
    quickEditConfig: await testQuickEditConfigAPI(token),
    templateForkingConfig: await testTemplateForkingConfigAPI(token),
    versionHistory: await testVersionHistoryAPI(token),
    templateForking: await testTemplateForkingAPI(token)
  };
  
  // Summary
  console.log(`\n${colors.cyan}${colors.bright}=== Test Results ===${colors.reset}`);
  Object.entries(results).forEach(([testName, result]) => {
    const status = result ? `${colors.green}PASS${colors.reset}` : `${colors.red}FAIL${colors.reset}`;
    console.log(`${testName}: ${status}`);
  });
  
  // Overall result
  const overallSuccess = Object.values(results).every(result => result);
  if (overallSuccess) {
    console.log(`\n${colors.green}${colors.bright}All tests passed!${colors.reset}`);
  } else {
    console.log(`\n${colors.red}${colors.bright}Some tests failed.${colors.reset}`);
    
    // Save results to file
    const resultsFile = path.join(__dirname, 'test-results.json');
    await fs.writeFile(
      resultsFile,
      JSON.stringify({ 
        timestamp: new Date().toISOString(), 
        results 
      }, null, 2)
    );
    console.log(`Test results saved to ${resultsFile}`);
  }
  
  return overallSuccess;
}

// Run tests if script is executed directly
if (require.main === module) {
  runTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Error running tests:', error);
      process.exit(1);
    });
}

module.exports = {
  runTests,
  authenticate,
  testCustomizationFlowAPI,
  testQuickEditConfigAPI,
  testTemplateForkingConfigAPI,
  testVersionHistoryAPI,
  testTemplateForkingAPI
};
