/**
 * Profile Directories Verification Script
 * 
 * This script verifies that the required directories for profile storage
 * exist in the Filesystem MCP and attempts to create them if they don't.
 */

// Constants
const FILESYSTEM_MCP_URL = 'http://localhost:8095';
const BASE_PATH = '/home/mothership';
const HOME_DIR = process.env.HOME;
const PROFILE_STORAGE_DIR = `${HOME_DIR}/profiles`;
const AVATAR_STORAGE_DIR = `${HOME_DIR}/avatars`;

// Make a fetch request to the Filesystem MCP
async function fetchFilesystem(path) {
  try {
    const response = await fetch(`${FILESYSTEM_MCP_URL}/api/files?path=${encodeURIComponent(path)}`);
    
    if (response.ok) {
      return {
        exists: true,
        data: await response.json()
      };
    } else if (response.status === 404) {
      return {
        exists: false,
        error: 'Directory not found'
      };
    } else {
      throw new Error(`Unexpected response: ${response.status}`);
    }
  } catch (error) {
    return {
      exists: false,
      error: error.message
    };
  }
}

// Create a directory in the Filesystem MCP
async function createDirectory(path) {
  try {
    const response = await fetch(`${FILESYSTEM_MCP_URL}/api/files?path=${encodeURIComponent(path)}&directory=true`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });
    
    if (response.ok) {
      return {
        success: true
      };
    } else {
      throw new Error(`Failed to create directory: ${response.status}`);
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Verify a directory exists and create it if it doesn't
async function verifyDirectory(path) {
  console.log(`Verifying directory: ${path}`);
  
  const result = await fetchFilesystem(path);
  
  if (result.exists) {
    console.log(`✅ Directory exists: ${path}`);
    return true;
  } else {
    console.log(`❌ Directory does not exist: ${path}`);
    console.log(`Creating directory: ${path}`);
    
    const createResult = await createDirectory(path);
    
    if (createResult.success) {
      console.log(`✅ Directory created: ${path}`);
      return true;
    } else {
      console.error(`❌ Failed to create directory: ${path}`);
      console.error(`   Error: ${createResult.error}`);
      return false;
    }
  }
}

// Main function
async function main() {
  console.log('Profile Directories Verification');
  console.log('-------------------------------');
  
  // Verify Filesystem MCP is available
  try {
    const response = await fetch(`${FILESYSTEM_MCP_URL}/`);
    if (response.ok) {
      console.log('✅ Filesystem MCP is available');
    } else {
      console.error(`❌ Filesystem MCP health check failed: ${response.status}`);
      return;
    }
  } catch (error) {
    console.error(`❌ Filesystem MCP is not available: ${error.message}`);
    console.error('Make sure the Filesystem MCP is running at ' + FILESYSTEM_MCP_URL);
    return;
  }
  
  // Verify profile directories
  const profileDirOk = await verifyDirectory(PROFILE_STORAGE_DIR);
  const avatarDirOk = await verifyDirectory(AVATAR_STORAGE_DIR);
  
  if (profileDirOk && avatarDirOk) {
    console.log('\n✅ All profile directories are available and ready to use');
  } else {
    console.error('\n❌ Some directories could not be verified or created');
    console.error('   Please check the Filesystem MCP logs for more information');
  }
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
});
