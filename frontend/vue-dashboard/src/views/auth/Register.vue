<template>
  <div class="register-form">
    <h3 class="text-h5 font-weight-bold text-center mb-4">Create New Account</h3>
    
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
    
    <v-alert
      type="info"
      variant="tonal"
      class="mb-4"
    >
      Currently, new accounts must be created by an administrator. Please contact your administrator for account creation.
    </v-alert>
    
    <v-form @submit.prevent="handleRegistration" ref="form">
      <v-row>
        <v-col cols="12">
          <v-text-field
            v-model="formData.username"
            label="Username"
            :rules="[rules.required]"
            prepend-inner-icon="mdi-account"
            variant="outlined"
            :disabled="authStore.loading"
          ></v-text-field>
        </v-col>
        
        <v-col cols="12">
          <v-text-field
            v-model="formData.email"
            label="Email"
            :rules="[rules.required, rules.email]"
            prepend-inner-icon="mdi-email"
            variant="outlined"
            :disabled="authStore.loading"
          ></v-text-field>
        </v-col>
        
        <v-col cols="12" md="6">
          <v-text-field
            v-model="formData.password"
            label="Password"
            :rules="[rules.required, rules.password]"
            type="password"
            prepend-inner-icon="mdi-lock"
            variant="outlined"
            :disabled="authStore.loading"
          ></v-text-field>
        </v-col>
        
        <v-col cols="12" md="6">
          <v-text-field
            v-model="formData.confirmPassword"
            label="Confirm Password"
            :rules="[rules.required, rules.passwordMatch]"
            type="password"
            prepend-inner-icon="mdi-lock-check"
            variant="outlined"
            :disabled="authStore.loading"
          ></v-text-field>
        </v-col>
        
        <v-col cols="12">
          <v-checkbox
            v-model="formData.agreeTerms"
            :rules="[rules.agreeTerms]"
            label="I agree to the Terms of Service and Privacy Policy"
            :disabled="authStore.loading"
          ></v-checkbox>
        </v-col>
      </v-row>
      
      <v-btn
        color="primary"
        block
        size="large"
        type="submit"
        :loading="authStore.loading"
      >
        Request Account
      </v-btn>
      
      <div class="text-center mt-6">
        <span class="text-body-2 text-medium-emphasis">
          Already have an account?
        </span>
        <router-link 
          :to="{ name: 'Login' }" 
          class="text-decoration-none ml-2 text-body-2 font-weight-bold"
        >
          Log in
        </router-link>
      </div>
    </v-form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';

// Component state
const formData = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  agreeTerms: false
});

const form = ref(null);
const registrationSuccess = ref(false);

// Composables
const router = useRouter();
const authStore = useAuthStore();

// Form validation rules
const rules = {
  required: value => !!value || 'This field is required',
  email: value => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(value) || 'Enter a valid email address';
  },
  password: value => {
    // Password should be at least 8 characters with at least one number, 
    // one uppercase letter, and one special character
    const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return pattern.test(value) || 
      'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character';
  },
  passwordMatch: value => value === formData.password || 'Passwords do not match',
  agreeTerms: value => value || 'You must agree to the terms to continue'
};

// Handle registration form submission
async function handleRegistration() {
  // Validate form
  const isValid = await form.value.validate();
  if (!isValid.valid) return;
  
  // Since only admins can register users in the current setup,
  // we'll just simulate a success and redirect to login
  registrationSuccess.value = true;
    
  // Redirect to login page with success message
  router.replace({ 
    name: 'Login',
    query: { registrationSuccess: 'true' }
  });
  
  // In a real implementation with self-registration:
  /*
  // Prepare user data for registration
  const userData = {
    username: formData.username,
    email: formData.email,
    password: formData.password
  };
  
  // Attempt registration
  const success = await authStore.register(userData);
  
  if (success) {
    registrationSuccess.value = true;
    
    // Redirect to login page with success message
    router.replace({ 
      name: 'Login',
      query: { registrationSuccess: 'true' }
    });
  }
  */
}
</script>
