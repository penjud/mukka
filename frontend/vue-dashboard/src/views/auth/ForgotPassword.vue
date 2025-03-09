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
    

    
    <v-fade-transition mode="out-in">
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
        
        <div class="position-relative">
          <v-btn
            color="primary"
            block
            size="large"
            type="submit"
            :loading="authStore.loading"
            class="mt-2"
          >
            <v-fade-transition mode="out-in">
              <span v-if="authStore.loading">Sending...</span>
              <span v-else>Send Reset Link</span>
            </v-fade-transition>
          </v-btn>
        </div>
      </v-form>
        </div>
    </v-fade-transition>
    
    <v-fade-transition mode="out-in">
      <div v-if="isSubmitted" class="text-center">
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
    </v-fade-transition>
    
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
import mcpApi from '../../services/mcp-api';

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
  
  // Request password reset using auth store
  const success = await authStore.requestPasswordReset(email.value);
  
  if (success) {
    // Set success state
    isSubmitted.value = true;
    successMessage.value = 'Password reset instructions sent successfully';
  }
  // If not successful, the auth store will have already set the error message
}
</script>
