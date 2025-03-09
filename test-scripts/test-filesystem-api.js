/**
 * Filesystem MCP API Test Script
 * 
 * This script tests the basic functionality of the Filesystem MCP service.
 */

async function testFilesystemApi() {
  const FILESYSTEM_URL = 'http://localhost:8095';
  
  console.log('Starting Filesystem MCP API test...');
  
  try {
    // Test 1: Health check
    console.log('\n1. Testing health endpoint...');
    const healthResponse = await fetch(`${FILESYSTEM_URL}/health`);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.text();
      console.log('✅ Health check successful');
      console.log(`Response: ${healthData}`);
    } else {
      console.error(`❌ Health check failed: ${healthResponse.status} - ${healthResponse.statusText}`);
    }
    
    // Test 2: List files
    console.log('\n2. Testing file listing...');
    const listResponse = await fetch(`${FILESYSTEM_URL}/api/files`);
    
    if (listResponse.ok) {
      const files = await listResponse.json();
      console.log('✅ File listing successful');
      console.log('Files found:', files.length);
      console.log('First 5 files or folders:');
      files.slice(0, 5).forEach(file => {
        console.log(`- ${file.type === 'directory' ? '[DIR]' : '[FILE]'} ${file.name}`);
      });
    } else {
      console.error(`❌ File listing failed: ${listResponse.status} - ${listResponse.statusText}`);
    }
    
    // Test 3: Create a test file
    console.log('\n3. Testing file creation...');
    const testContent = 'This is a test file created by the Filesystem MCP API test script.';
    const createResponse = await fetch(`${FILESYSTEM_URL}/api/files/test-file.txt`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'text/plain'
      },
      body: testContent
    });
    
    if (createResponse.ok) {
      console.log('✅ File creation successful');
    } else {
      console.error(`❌ File creation failed: ${createResponse.status} - ${createResponse.statusText}`);
    }
    
    // Test 4: Read the test file
    console.log('\n4. Testing file reading...');
    const readResponse = await fetch(`${FILESYSTEM_URL}/api/files/test-file.txt`);
    
    if (readResponse.ok) {
      const fileContent = await readResponse.text();
      console.log('✅ File reading successful');
      console.log(`Content: ${fileContent}`);
      console.log(`Content matches: ${fileContent === testContent}`);
    } else {
      console.error(`❌ File reading failed: ${readResponse.status} - ${readResponse.statusText}`);
    }
    
    // Test 5: Delete the test file
    console.log('\n5. Testing file deletion...');
    const deleteResponse = await fetch(`${FILESYSTEM_URL}/api/files/test-file.txt`, {
      method: 'DELETE'
    });
    
    if (deleteResponse.ok) {
      console.log('✅ File deletion successful');
    } else {
      console.error(`❌ File deletion failed: ${deleteResponse.status} - ${deleteResponse.statusText}`);
    }
    
    console.log('\nFilesystem MCP API test completed.');
  } catch (error) {
    console.error('Error during test:', error);
  }
}

// Run the test
testFilesystemApi();
