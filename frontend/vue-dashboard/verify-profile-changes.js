// Profile Settings Page Verification Script
// Run this after deploying changes to check if they're effective.

console.log("=== ProfileSettings Page Verification ===");

// Check if problematic scripts have been effectively disabled
const disabledScripts = [
  "/home/mothership/mukka/frontend/vue-dashboard/src/views/settings/profile-button-remover.js",
  "/home/mothership/mukka/frontend/vue-dashboard/src/views/settings/profile-update-fix.js"
];

const fs = require('fs');

console.log("Checking if problematic scripts are disabled:");
disabledScripts.forEach(scriptPath => {
  try {
    const content = fs.readFileSync(scriptPath, 'utf8');
    const isDisabled = !content.includes("MutationObserver") && 
                      !content.includes("document.querySelector") &&
                      content.length < 500;
    
    console.log(`- ${scriptPath}: ${isDisabled ? "✅ DISABLED" : "❌ STILL ACTIVE"}`);
  } catch (error) {
    console.log(`- ${scriptPath}: ⚠️ ERROR: ${error.message}`);
  }
});

// Check if ProfileSettings.vue is using our new approach
try {
  const profileSettingsPath = "/home/mothership/mukka/frontend/vue-dashboard/src/views/settings/ProfileSettings.vue";
  const content = fs.readFileSync(profileSettingsPath, 'utf8');
  
  const usesTextLink = content.includes("save-link") && !content.includes("v-btn");
  const usesSafetyTimeout = content.includes("saveTimeout");
  
  console.log("\nChecking ProfileSettings.vue implementation:");
  console.log(`- Using text link instead of button: ${usesTextLink ? "✅ YES" : "❌ NO"}`);
  console.log(`- Using safety timeout: ${usesSafetyTimeout ? "✅ YES" : "❌ NO"}`);
} catch (error) {
  console.log(`\nError checking ProfileSettings.vue: ${error.message}`);
}

console.log("\n=== Verification Complete ===");
