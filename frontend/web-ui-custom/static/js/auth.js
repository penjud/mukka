// Simple authentication JS for MCP Web UI
console.log('MCP Auth Module Loaded');

// Check if we need to authenticate
document.addEventListener('DOMContentLoaded', function() {
  // Check if authenticated
  const authCookie = getCookie('token');
  if (!authCookie) {
    // Redirect to login
    console.log('No auth token found, should redirect to login');
    // window.location.href = '/login';
  } else {
    console.log('Auth token found, user is authenticated');
  }
});

// Get cookie helper function
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}
