onMounted(() => {
  console.log('Login component mounted');
  console.log('Form ref:', form.value);
  console.log('Auth service available:', isAuthServiceAvailable.value);
});
<template>
  <div class="login-form">
    <h3 class="text-h5 font-weight-bold text-center mb-4">Login to your account</h3>
    
    <!-- Debug Info -->
    <div class="debug-info mb-4 pa-2" style="border: 1px solid #ddd; background: #f5f5f5;">
      <pre>Auth Service Available: {{ isAuthServiceAvailable ? 'Yes' : 'No' }}</pre>
      <pre>Form Disabled: {{ authStore.loading ? 'Yes' : 'No' }}</pre>
    </div>
    
    <!-- Alert for error messages -->
    <v-alert
      v-if="authStore.error"
      type="error"
      variant="tonal"
      closable
      class="mb-4"
      @click:close="authStore.error = null"
    >
      {{ authStore.error }}
    </v-alert>
    
    <!-- Alert for service discovery issues -->
    <v-alert
      v-if="!isAuthServiceAvailable"
      type="warning"
      variant="tonal"
      class="mb-4"
    >
      Authentication service is currently unavailable. Please try again later or contact your administrator.
    </v-alert>
    
    <v-form @submit.prevent="handleLogin" ref="form" :disabled="authStore.loading">      
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
      
      <div class="position-relative">
        <v-btn
          color="primary"
          block
          size="large"
          type="submit"
          :loading="authStore.loading"
          class="mt-2"
        >
          <span v-if="authStore.loading">Authenticating...</span>
          <span v-else>Login</span>
        </v-btn>
      </div>
      
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
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { serviceStore } from '../../services/discovery';

// Component state
const username = ref('');
const password = ref('');
const rememberMe = ref(localStorage.getItem('remember_me') === 'true');
const form = ref(null);

// Composables
const router = useRouter();
const authStore = useAuthStore();

// Check if auth service is available
const isAuthServiceAvailable = computed(() => {
  return serviceStore.services.auth && serviceStore.services.auth.status;
});

// Component lifecycle
onMounted(() => {
  console.log('Login component mounted');
  console.log('Form ref:', form.value);
  console.log('Auth service available:', isAuthServiceAvailable.value);
});
const rules = {
  required: value => !!value || 'This field is required',
};

// Handle login form submission
async function handleLogin() {
  // Validate form
  const { valid } = await form.value.validate();
  if (!valid) return;
  
  // Trigger transition animation
  form.value.$el.classList.add('loading');
  
  // Clear any previous errors
  authStore.error = null;
  
  // Check if auth service is available
  if (!isAuthServiceAvailable.value) {
    authStore.error = "Authentication service is unavailable. Please try again later.";
    return;
  }
  
  // Attempt to login
  const success = await authStore.login(username.value, password.value);
  
  if (success) {
    // Store remember me preference
    localStorage.setItem('remember_me', rememberMe.value ? 'true' : 'false');
    
    // If remember me is checked and we have expiresIn info, handle accordingly
    // This will inform the refresh token logic
    if (authStore.refreshEnabled === undefined) {
      authStore.refreshEnabled = rememberMe.value;
      localStorage.setItem('refresh_enabled', rememberMe.value ? 'true' : 'false');
    }
    
    // Redirect to dashboard
    router.replace({ name: 'Dashboard' });
  } else if (authStore.error && authStore.error.includes('Too many login attempts')) {
    // Handle account lockout
    authStore.error = "Your account has been temporarily locked due to too many failed login attempts. Please try again later or contact support.";
  }
}
</script>
