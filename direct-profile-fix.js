#!/usr/bin/env node

/**
 * Direct Profile Button Fix Script
 * 
 * This script directly modifies the bundled JavaScript in the Vue Dashboard
 * to fix the issue with the profile save button getting stuck in loading state.
 */

const fs = require('fs');
const path = require('path');

// Path to the Vue Dashboard container
const dockerCommand = `docker exec mukka-vue-dashboard bash -c "grep -r 'loading.value = false' /usr/share/nginx/html/"`;
const child_process = require('child_process');

console.log('Searching for loading state code in Vue Dashboard...');

try {
  // Search for the loading value code in the bundle
  const result = child_process.execSync(dockerCommand).toString();
  console.log('Search result:', result);
  
  if (result.includes('index-')) {
    // Extract the bundle filename
    const match = result.match(/\/usr\/share\/nginx\/html\/assets\/(index-[a-z0-9]+\.js)/);
    
    if (match && match[1]) {
      const bundleFile = match[1];
      console.log(`Found bundle file: ${bundleFile}`);
      
      // Extract the bundle from the container
      console.log(`Extracting ${bundleFile} from container...`);
      child_process.execSync(`docker cp mukka-vue-dashboard:/usr/share/nginx/html/assets/${bundleFile} /tmp/${bundleFile}`);
      
      // Read the bundle
      console.log(`Reading bundle file...`);
      let bundleContent = fs.readFileSync(`/tmp/${bundleFile}`, 'utf8');
      
      // Find and modify the updateProfile function
      console.log('Modifying bundle...');
      
      // Look for the updateProfile function
      if (bundleContent.includes('updateProfile') && bundleContent.includes('loading.value=!0')) {
        console.log('Found updateProfile function with loading state...');
        
        // Add a timeout to reset loading state
        const fixCode = `
// Add timeout to reset loading state
setTimeout(function(){loading.value=!1,console.log("Profile save timeout triggered")},5e3);`;
        
        // Find a suitable injection point - after the loading.value=!0 statement
        const injectionPoint = bundleContent.indexOf('loading.value=!0');
        if (injectionPoint !== -1) {
          // Insert the fix code
          bundleContent = bundleContent.slice(0, injectionPoint + 'loading.value=!0'.length) + 
                         fixCode + 
                         bundleContent.slice(injectionPoint + 'loading.value=!0'.length);
          
          // Write the modified bundle
          fs.writeFileSync(`/tmp/${bundleFile}.fixed`, bundleContent);
          console.log(`Modified bundle saved to /tmp/${bundleFile}.fixed`);
          
          // Copy back to the container
          console.log('Copying modified bundle back to container...');
          child_process.execSync(`docker cp /tmp/${bundleFile}.fixed mukka-vue-dashboard:/usr/share/nginx/html/assets/${bundleFile}`);
          
          console.log('Fix applied successfully!');
          console.log('Please refresh the page in your browser to apply the changes.');
        } else {
          console.log('Could not find suitable injection point in the bundle.');
        }
      } else {
        console.log('Could not find updateProfile function with loading state in the bundle.');
      }
    } else {
      console.log('Could not extract bundle filename from search results.');
    }
  } else {
    console.log('Could not find loading.value code in any bundle files.');
  }
} catch (error) {
  console.error('Error:', error.message);
}
