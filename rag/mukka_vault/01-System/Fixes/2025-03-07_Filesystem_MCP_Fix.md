---
title: Filesystem MCP File Browsing Fix
created: 2025-03-07 11:10:00
modified: 2025-03-07 11:10:00
tags:
  - fix
  - MCP
  - filesystem
  - API
  - browse
status: completed
---

# Filesystem MCP File Browsing Fix

## Issue Description
The Filesystem MCP server had a missing API endpoint for browsing files. While the server had an existing `/ls` endpoint for listing directory contents, the Web UI and test scripts were attempting to use a `/browse` endpoint, resulting in 404 errors.

## Analysis
After examining the Filesystem MCP server code in `/home/mothership/mukka/backend/services/filesystem/src/index.js`, I discovered:

1. The server had a properly implemented `/ls` endpoint that listed directory contents
2. However, the functional test script and likely the Web UI were expecting a `/browse` endpoint
3. The test script was also using a different parameter name (`path` instead of `directory`) for file path

## Solution
I implemented the following solutions:

1. Added a new API endpoint `/browse` that serves as an alternative to `/ls`:
```javascript
// Alternative endpoint for browsing files (to match Web UI expectations)
app.get('/browse', async (req, res) => {
  try {
    const { path: dirPath } = req.query;
    
    if (!dirPath) {
      return res.status(400).json({ error: 'Path parameter is required' });
    }
    
    // Check if directory is within allowed paths
    if (!isPathAllowed(dirPath)) {
      return res.status(403).json({ error: 'Access to this path is not allowed' });
    }
    
    if (!fs.existsSync(dirPath)) {
      return res.status(404).json({ error: 'Path not found' });
    }
    
    if (!fs.statSync(dirPath).isDirectory()) {
      return res.status(400).json({ error: 'Path is not a directory' });
    }
    
    const files = await fs.readdir(dirPath);
    const listing = formatDirectoryListing(dirPath, files);
    
    res.json({ path: dirPath, files: listing });
  } catch (error) {
    logger.error('Error browsing directory:', error);
    res.status(500).json({ error: error.message });
  }
});
```

2. This new endpoint:
   - Accepts a `path` query parameter instead of `directory`
   - Returns a slightly different JSON structure with `path` and `files` keys
   - Uses the same validation and directory listing logic as the original `/ls` endpoint

3. I also updated the test script to use the correct parameter for reading files:
   - Changed `read?path=...` to `read?file=...` to match the server's implementation

## Implementation Steps
1. Added the missing `/browse` endpoint to `/home/mothership/mukka/backend/services/filesystem/src/index.js`
2. Rebuilt the Docker image for the Filesystem MCP server
3. Recreated the container to ensure the changes were applied
4. Updated the test script to use the correct parameter for reading files
5. Verified the functionality using curl and the functional test script

## Verification
The fix was verified by:
1. Using curl to test the new `/browse` endpoint directly
2. Running the functional tests, which now pass for both file browsing and file reading operations

## Status
✅ Issue resolved. The Filesystem MCP server now correctly handles file browsing and reading operations.

## Notes
This fix demonstrates the importance of API consistency. The different parameter names (`directory` vs. `path`) and slightly different response structures between the two endpoints could cause confusion. In the future, we should:
1. Standardize API parameter names across all endpoints
2. Document the expected parameters and response formats for each endpoint
3. Consider implementing API versioning or maintaining backward compatibility when changing APIs

## Next Steps
The remaining issues to be addressed are:
1. Ollama Bridge authentication problems
2. Standardizing and documenting API paths across services
