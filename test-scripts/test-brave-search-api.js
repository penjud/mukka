/**
 * Brave Search MCP API Test Script
 * 
 * This script tests the basic functionality of the Brave Search MCP service.
 */

async function testBraveSearchApi() {
  const BRAVE_SEARCH_URL = 'http://localhost:8096';
  
  console.log('Starting Brave Search MCP API test...');
  
  try {
    // Test 1: Health check
    console.log('\n1. Testing health endpoint...');
    const healthResponse = await fetch(`${BRAVE_SEARCH_URL}/health`);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.text();
      console.log('✅ Health check successful');
      console.log(`Response: ${healthData}`);
    } else {
      console.error(`❌ Health check failed: ${healthResponse.status} - ${healthResponse.statusText}`);
    }
    
    // Test 2: Search query
    console.log('\n2. Testing search query...');
    
    // URL encode the search query
    const searchQuery = encodeURIComponent('latest AI research papers');
    
    const searchResponse = await fetch(`${BRAVE_SEARCH_URL}/api/search?q=${searchQuery}&count=5`);
    
    if (searchResponse.ok) {
      const searchResults = await searchResponse.json();
      console.log('✅ Search query successful');
      console.log(`Results found: ${searchResults.length || (searchResults.results ? searchResults.results.length : 0)}`);
      
      // Check result structure and display some data
      if (searchResults.results && searchResults.results.length > 0) {
        console.log('\nTop 3 search results:');
        searchResults.results.slice(0, 3).forEach((result, index) => {
          console.log(`\n[${index + 1}] ${result.title || 'No title'}`);
          console.log(`URL: ${result.url || 'No URL'}`);
          console.log(`Description: ${result.description ? result.description.substring(0, 100) + '...' : 'No description'}`);
        });
      } else if (Array.isArray(searchResults) && searchResults.length > 0) {
        console.log('\nTop 3 search results:');
        searchResults.slice(0, 3).forEach((result, index) => {
          console.log(`\n[${index + 1}] ${result.title || 'No title'}`);
          console.log(`URL: ${result.url || 'No URL'}`);
          console.log(`Description: ${result.description ? result.description.substring(0, 100) + '...' : 'No description'}`);
        });
      } else {
        console.log('No results found or unexpected response format');
        console.log('Response structure:', JSON.stringify(searchResults, null, 2).substring(0, 300) + '...');
      }
    } else {
      console.error(`❌ Search query failed: ${searchResponse.status} - ${searchResponse.statusText}`);
      try {
        const errorText = await searchResponse.text();
        console.error(`Error details: ${errorText}`);
      } catch (e) {
        console.error('Could not read error details');
      }
    }
    
    // Test 3: Local search query (if supported)
    console.log('\n3. Testing local search query...');
    
    // URL encode the local search query
    const localSearchQuery = encodeURIComponent('restaurants near me');
    
    const localSearchResponse = await fetch(`${BRAVE_SEARCH_URL}/api/search/local?q=${localSearchQuery}&count=3`);
    
    if (localSearchResponse.ok) {
      const localSearchResults = await localSearchResponse.json();
      console.log('✅ Local search query successful');
      
      if (localSearchResults.results && localSearchResults.results.length > 0) {
        console.log(`Results found: ${localSearchResults.results.length}`);
        console.log('\nTop 3 local search results:');
        localSearchResults.results.slice(0, 3).forEach((result, index) => {
          console.log(`\n[${index + 1}] ${result.name || 'No name'}`);
          console.log(`Address: ${result.address || 'No address'}`);
          console.log(`Rating: ${result.rating || 'No rating'}`);
        });
      } else {
        console.log('No local results found or feature not supported');
        console.log('Response structure:', JSON.stringify(localSearchResults, null, 2).substring(0, 300) + '...');
      }
    } else if (localSearchResponse.status === 404) {
      console.log('⚠️ Local search endpoint not found - this feature may not be implemented');
    } else {
      console.error(`❌ Local search query failed: ${localSearchResponse.status} - ${localSearchResponse.statusText}`);
    }
    
    console.log('\nBrave Search MCP API test completed.');
  } catch (error) {
    console.error('Error during test:', error);
  }
}

// Run the test
testBraveSearchApi();
