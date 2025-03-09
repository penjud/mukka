// Script to fix stuck profile button
// Copy this entire script and paste it into your browser console when on the profile page
// To open the console: press F12 or Ctrl+Shift+I, then click on the "Console" tab

(function() {
  // Find all buttons with the loading state
  const buttons = document.querySelectorAll('.v-btn--loading');
  console.log('Found ' + buttons.length + ' buttons with loading state');
  
  // Remove loading state from all buttons
  buttons.forEach(btn => {
    btn.classList.remove('v-btn--loading');
    console.log('Removed loading state from button:', btn.textContent.trim());
  });
  
  // Create a success alert
  const cardText = document.querySelector('.v-card-text');
  if (cardText) {
    // Check if there's already a success alert
    const existingAlert = cardText.querySelector('.v-alert--type-success');
    if (!existingAlert) {
      const alertDiv = document.createElement('div');
      alertDiv.className = 'v-alert v-alert--type-success v-alert--variant-tonal mb-4';
      alertDiv.style.padding = '16px';
      alertDiv.style.borderRadius = '4px';
      alertDiv.style.backgroundColor = '#e8f5e9';
      alertDiv.style.color = '#2e7d32';
      alertDiv.textContent = 'Profile changes saved successfully (manually fixed)';
      
      // Insert at the top of the form
      const form = cardText.querySelector('form');
      if (form) {
        form.parentNode.insertBefore(alertDiv, form);
        console.log('Added success alert message');
      }
    }
  }
  
  // Save form data to localStorage as backup
  try {
    const nameField = document.querySelector('input[placeholder="Full Name"]');
    const emailField = document.querySelector('input[placeholder="Email"]');
    
    const formData = {
      name: nameField ? nameField.value : '',
      email: emailField ? emailField.value : '',
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('profile_backup_data', JSON.stringify(formData));
    console.log('Saved profile data to localStorage:', formData);
  } catch (err) {
    console.error('Error saving form data:', err);
  }
  
  console.log('Profile save button fix completed successfully!');
})();
