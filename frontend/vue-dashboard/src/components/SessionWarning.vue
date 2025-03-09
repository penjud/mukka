<template>
  <v-dialog
    v-model="authStore.showSessionWarning"
    max-width="400"
    persistent
  >
    <v-card>
      <v-card-title class="headline text-warning">
        <v-icon
          icon="mdi-clock-alert-outline"
          size="x-large"
          class="mr-2"
          color="warning"
        ></v-icon>
        Session Expiring
      </v-card-title>
      
      <v-card-text class="pt-4">
        <p>Your session will expire in <strong>{{ formattedTime }}</strong>.</p>
        <p>Please save your work and refresh your authentication to continue.</p>
      </v-card-text>
      
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="error"
          variant="text"
          @click="logout"
        >
          Logout
        </v-btn>
        <v-btn
          color="secondary"
          variant="text"
          @click="dismiss"
        >
          Dismiss
        </v-btn>
        <v-btn
          color="primary"
          variant="elevated"
          @click="refreshSession"
        >
          Continue Session
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

// Format the remaining time in mm:ss format
const formattedTime = computed(() => {
  const minutes = Math.floor(authStore.remainingTime / 60);
  const seconds = authStore.remainingTime % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

// Refresh the session
async function refreshSession() {
  const success = await authStore.refreshToken();
  if (!success) {
    // If refresh fails, go to login page
    router.push({ name: 'Login' });
  } else {
    // Dismiss the warning
    authStore.dismissSessionWarning();
  }
}

// Dismiss the warning
function dismiss() {
  authStore.dismissSessionWarning();
}

// Logout and go to login page
function logout() {
  authStore.logout();
  router.push({ name: 'Login' });
}
</script>
