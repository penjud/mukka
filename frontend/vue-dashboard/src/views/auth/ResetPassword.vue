<template>
  <div class="reset-password-form">
    <h3 class="text-h5 font-weight-bold text-center mb-4">Reset Password</h3>
    
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
    
    <div v-if="!isSubmitted">
      <p class="text-body-1 text-medium-emphasis mb-4">
        Enter your new password below to reset your account password.
      </p>
      
      <v-form @submit.prevent="handleSubmit" ref="form">
        <v-text-field
          v-model="password"
          label="New Password"
          :rules="[rules.required, rules.minLength]"
          type="password"
          prepend-inner-icon="mdi-lock"
          variant="outlined"
          :disabled="authStore.loading"
        ></v-text-field>
        
        <PasswordStrengthMeter :password="password" class="my-2" />
        
        <v-text-field
          v-model="confirmPassword"
          label="Confirm New Password"
          :rules="[rules.required, matchPassword]"
          type="password"
          prepend-inner-icon="mdi-lock-check"
          variant="outlined"
          :disabled="authStore.loading"
        ></v-text-field>
        
        <div class="loading-overlay-wrapper position-relative">
          <v-btn
            color="primary"
            block
            size="large"
            type="submit"
            :loading="authStore.loading"
            class="mt-2"
          >
          Reset Password
          </v-btn>
        </div>
      </v-form>
    </div>
    
    <div v-else class="text-center">
      <v-icon
        color="success"
        size="64"
        class="mb-4"
      >
        mdi-check-circle
      </v-icon>
      
      <p class="text-body-1 mb-4">
        Your password has been successfully reset. You can now use your new password to log in.
      </p>
      
      <v-btn
        color="primary"
        variant="outlined"
        :to="{ name: 'Login' }"
        class="mt-2"
      >
        Go to Login
      </v-btn>
    </div>
    
    <div v-if="!isSubmitted" class="text-center mt-6">
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
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import PasswordStrengthMeter from '../../components/PasswordStrengthMeter.vue';

// Component state
const password = ref('');
const confirmPassword = ref('');
const token = ref('');
const form = ref(null);
const isSubmitted = ref(false);
const successMessage = ref('');

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

// Form validation rules
const rules = {
  required: value => !!value || 'This field is required',
  minLength: value => value.length >= 8 || 'Password must be at least 8 characters'
};

// Password match validation
const matchPassword = value => {
  return value === password.value || 'Passwords do not match';
};

// Handle form submission
async function handleSubmit() {
  // Validate form
  const isValid = await form.value.validate();
  if (!isValid.valid) return;
  
  // Reset password using auth store
  const success = await authStore.resetPassword(token.value, password.value);
  
  if (success) {
    // Set success state
    isSubmitted.value = true;
    successMessage.value = 'Your password has been reset successfully';
  }
  // If not successful, the auth store will have already set the error message
}

// Get token from URL on component mount
onMounted(() => {
  token.value = route.query.token;
  
  if (!token.value) {
    authStore.error = 'Missing password reset token. Please use the link from your email.';
  }
});
</script>
