<template>
  <div class="login-form">
    <h3 class="text-h5 font-weight-bold text-center mb-4">Login to your account</h3>
    
    <!-- Alert for error messages -->
    <v-alert
      v-if="authStore.error"
      type="error"
      variant="tonal"
      closable
      class="mb-4"
    >
      {{ authStore.error }}
    </v-alert>
    
    <v-form @submit.prevent="handleLogin" ref="form">
      <v-text-field
        v-model="username"
        label="Username or Email"
        :rules="[rules.required]"
        prepend-inner-icon="mdi-account"
        variant="outlined"
        :disabled="authStore.loading"
      ></v-text-field>
      
      <v-text-field
        v-model="password"
        label="Password"
        :rules="[rules.required]"
        type="password"
        prepend-inner-icon="mdi-lock"
        variant="outlined"
        :disabled="authStore.loading"
      ></v-text-field>
      
      <div class="d-flex justify-space-between align-center mb-4">
        <v-checkbox
          v-model="rememberMe"
          label="Remember me"
          :disabled="authStore.loading"
          hide-details
        ></v-checkbox>
        
        <router-link 
          :to="{ name: 'ForgotPassword' }" 
          class="text-decoration-none text-caption"
        >
          Forgot Password?
        </router-link>
      </div>
      
      <v-btn
        color="primary"
        block
        size="large"
        type="submit"
        :loading="authStore.loading"
      >
        Login
      </v-btn>
      
      <div class="text-center mt-6">
        <span class="text-body-2 text-medium-emphasis">
          Don't have an account?
        </span>
        <router-link 
          :to="{ name: 'Register' }" 
          class="text-decoration-none ml-2 text-body-2 font-weight-bold"
        >
          Create one now
        </router-link>
      </div>
    </v-form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';

// Component state
const username = ref('');
const password = ref('');
const rememberMe = ref(false);
const form = ref(null);

// Composables
const router = useRouter();
const authStore = useAuthStore();

// Form validation rules
const rules = {
  required: value => !!value || 'This field is required',
};

// Handle login form submission
async function handleLogin() {
  // Validate form
  const isValid = await form.value.validate();
  if (!isValid.valid) return;
  
  // Attempt to login
  const success = await authStore.login(username.value, password.value);
  
  if (success) {
    // If remember me is checked, could implement persistent login here
    // Store the preference if needed
    localStorage.setItem('remember_me', rememberMe.value ? 'true' : 'false');
    
    // Redirect to dashboard
    router.replace({ name: 'Dashboard' });
  }
}
</script>
