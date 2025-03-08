<template>
  <div class="password-recovery-form">
    <h3 class="text-h5 font-weight-bold text-center mb-4">Recover Password</h3>
    
    <v-alert
      v-if="successMessage"
      type="success"
      variant="tonal"
      closable
      class="mb-4"
    >
      {{ successMessage }}
    </v-alert>
    
    <v-alert
      v-if="authStore.error"
      type="error"
      variant="tonal"
      closable
      class="mb-4"
    >
      {{ authStore.error }}
    </v-alert>
    
    <v-alert
      type="info"
      variant="tonal"
      class="mb-4"
    >
      The password recovery feature is currently under development. Please contact your administrator to reset your password.
    </v-alert>
    
    <div v-if="!isSubmitted">
      <p class="text-body-1 text-medium-emphasis mb-4">
        Enter your email address and we'll send you instructions to reset your password.
      </p>
      
      <v-form @submit.prevent="handleSubmit" ref="form">
        <v-text-field
          v-model="email"
          label="Email Address"
          :rules="[rules.required, rules.email]"
          prepend-inner-icon="mdi-email"
          variant="outlined"
          :disabled="authStore.loading"
        ></v-text-field>
        
        <v-btn
          color="primary"
          block
          size="large"
          type="submit"
          :loading="authStore.loading"
          class="mt-2"
        >
          Send Reset Link
        </v-btn>
      </v-form>
    </div>
    
    <div v-else class="text-center">
      <v-icon
        color="success"
        size="64"
        class="mb-4"
      >
        mdi-email-check
      </v-icon>
      
      <p class="text-body-1 mb-4">
        If your email address exists in our database, you will receive a password recovery link at your email address shortly.
      </p>
    </div>
    
    <div class="text-center mt-6">
      <router-link 
        :to="{ name: 'Login' }" 
        class="text-decoration-none text-body-2 font-weight-bold"
      >
        Back to Login
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../../stores/auth';

// Component state
const email = ref('');
const form = ref(null);
const isSubmitted = ref(false);
const successMessage = ref('');

// Auth store
const authStore = useAuthStore();

// Form validation rules
const rules = {
  required: value => !!value || 'This field is required',
  email: value => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(value) || 'Enter a valid email address';
  }
};

// Handle form submission
async function handleSubmit() {
  // Validate form
  const isValid = await form.value.validate();
  if (!isValid.valid) return;
  
  // Since this feature is not yet implemented in the backend,
  // just simulate a successful submission
  isSubmitted.value = true;
  successMessage.value = 'Password reset instructions sent successfully';
  
  // In a real implementation, we would call the API:
  // try {
  //   // Send password reset request
  //   const response = await mcpApi.post('auth', '/forgot-password', { 
  //     email: email.value 
  //   });
  //   
  //   // Set success state
  //   isSubmitted.value = true;
  //   successMessage.value = 'Password reset instructions sent successfully';
  // } catch (error) {
  //   // Auth store error handling will capture this
  //   // We'll keep the form visible to allow retries
  // }
}
</script>
